import random
import requests
import unittest
import uuid

from datetime import datetime

API_HOST = 'localhost'
API_PORT = 80
API_BASE_PATH = '/api/transaction'

BASE_URL = f'http://{API_HOST}:{API_PORT}{API_BASE_PATH}'

class TestTransactionEndpoints(unittest.TestCase):
    def setup(self, num_categories=1, num_payees=1, num_accounts=1):
        """
        Create the necessary prerequisites for a tranasaction
        """
        categories = []
        payees = []
        accounts = []
        for i in range(num_categories):
            category_id = requests.post(
                f'http://{API_HOST}:{API_PORT}/api/category/create',
                json={
                    "name": uuid.uuid4().hex[:8],
                    "group": uuid.uuid4().hex[:8],
                    "notes": uuid.uuid4().hex[:8]
                }
            ).json()['id']
            categories.append(category_id)

        for i in range(num_payees):
            payee_id = requests.post(
                f'http://{API_HOST}:{API_PORT}/api/payee/create',
                json={
                    "name": uuid.uuid4().hex[:8]
                }
            ).json()[0]['id']
            payees.append(payee_id)
        
        for i in range(num_accounts):
            account_id = requests.post(
                f'http://{API_HOST}:{API_PORT}/api/account/create',
                json={
                    "name": uuid.uuid4().hex[:8]
                }
            ).json()[0]['id']
            accounts.append(account_id)

        return {
            "categories": categories,
            "accounts": accounts,
            "payees": payees
        }
        
    def test_create_transaction_success(self):
        """
        Testing creating new transaction successfully
        """
        num_categories = 16
        # Create Categories and payees for transaction
        setup_data = self.setup(num_categories=num_categories)
        # even amount to make splitting it easier
        amount = random.randint(50, 500)*num_categories

        categories = []
        for i in range(num_categories):
            categories.append({
                "category_id": setup_data['categories'][i],
                "amount": int(amount/num_categories)
            })

        transaction = {
                "payee_id": setup_data['payees'][0],
                "amount": amount,
                "date": get_current_date(),
                "memo": uuid.uuid4().hex[:8],
                "account_id": setup_data['accounts'][0],
                "cleared": True,
                "categories": categories
            }
        resp = create_transaction(transaction)
        self.assertEqual(resp.status_code, 201)
        transaction_id = resp.json()['id']

        resp = get_transactions()
        transactions = [t['id'] for t in resp.json()]

        self.assertTrue(transaction_id in transactions)
        

    def test_create_transaction_fail(self):
        """
        Test Creating Transactions Unseccessfully
        """
        num_transactions = len(get_transactions().json())
        transactions = [
            {
                "payee_id": "foo",
                "amount": 1867,
                "date": get_current_date(),
                "account_id": 99999,
                "cleared": True,
                "categories": []
            },
            {
               "payee_id": 0,
                "amount": 1867,
                "date": get_current_date(),
                "account_id": 99999,
                "cleared": True,
                "categories": [{
                    "category_id":1,
                    "amount": 45
                }] 
            },
            {
                "amount": 1867,
                "date": get_current_date(),
                "account_id": 99999,
                "cleared": True,
                "categories": [{
                    "category_id":1,
                    "amount": 45
                }] 
            },
            {
               "payee_id": 0,
                "amount": 1867,
                "date": "foo",
                "account_id": 45,
                "cleared": True,
                "categories": [{
                    "category_id":1,
                    "amount": 45
                }] 
            }
        ]
        for t in transactions:
            resp = create_transaction(t)
            self.assertEqual(resp.status_code, 400)

        self.assertEqual(len(get_transactions().json()), num_transactions)

    def test_delete_transaction(self):
        """
        Testing deleting a transaction
        """
        num_categories = 1
        # Create Categories and payees for transaction
        setup_data = self.setup(num_categories=num_categories)
        # even amount to make splitting it easier
        amount = random.randint(50, 500)*num_categories

        categories = []
        for i in range(num_categories):
            categories.append({
                "category_id": setup_data['categories'][i],
                "amount": int(amount/num_categories)
            })

        transaction = {
            "payee_id": setup_data['payees'][0],
            "amount": amount,
            "date": get_current_date(),
            "memo": uuid.uuid4().hex[:8],
            "account_id": setup_data['accounts'][0],
            "cleared": True,
            "categories": categories
        }
        resp = create_transaction(transaction)
        transaction_id = resp.json()['id']

        resp = get_transactions()
        transactions = [t['id'] for t in resp.json()]
        self.assertTrue(transaction_id in transactions)

        self.assertEqual(delete_transaction(transaction_id).status_code, 200)

        resp = get_transactions()
        transactions = [t['id'] for t in resp.json()]
        self.assertFalse(transaction_id in transactions)


    def test_delete_transaction_invalid_id(self):
        """
        Testing deleting a transaction with invalid id
        """
        transaction_ids = [None, 'fff']
        for transaction_id in transaction_ids:
            resp = delete_transaction(transaction_id)
            self.assertEqual(resp.status_code, 400)
    
    def test_update_transaction(self):
        """
        Testing updating a transaction
        """
        num_categories = 1
        # Create Categories and payees for transaction
        setup_data = self.setup(num_categories=num_categories)
        # even amount to make splitting it easier
        amount = random.randint(50, 500)*num_categories

        categories = []
        for i in range(num_categories):
            categories.append({
                "category_id": setup_data['categories'][i],
                "amount": int(amount/num_categories)
            })

        transaction = {
            "payee_id": setup_data['payees'][0],
            "amount": amount,
            "date": get_current_date(),
            "memo": uuid.uuid4().hex[:8],
            "account_id": setup_data['accounts'][0],
            "cleared": True,
            "categories": categories
        }
        resp = create_transaction(transaction)
        transaction_id = resp.json()['id']

        resp = get_transactions()
        transactions = [t['id'] for t in resp.json()]
        self.assertTrue(transaction_id in transactions)

        num_categories = 1
        # Create Categories and payees for transaction
        setup_data = self.setup(num_categories=num_categories)
        # even amount to make splitting it easier
        amount = random.randint(50, 500)*num_categories

        categories = []
        for i in range(num_categories):
            categories.append({
                "category_id": setup_data['categories'][i],
                "amount": int(amount/num_categories)
            })

        updated_transaction = {
            "payee_id": setup_data['payees'][0],
            "amount": amount,
            "date": get_current_date(),
            "memo": uuid.uuid4().hex[:8],
            "account_id": setup_data['accounts'][0],
            "cleared": True,
            "categories": categories
        }

        resp = update_transaction(transaction_id, updated_transaction)
        self.assertEqual(resp.status_code, 200)

def get_transactions():
    """
    Fetch all transactions
    """
    resp = requests.get(
        f'{BASE_URL}'
    )
    return resp


def create_transaction(transaction_data):
    """
    Create New Transaction
    """
    resp = requests.post(
        f'{BASE_URL}/create', 
        json=transaction_data
    )
    return resp

def update_transaction(transaction_id, transaction_data):
    """
    Update Transaction
    """
    resp = requests.put(
        f'{BASE_URL}/update/{transaction_id}', 
        json=transaction_data
    )
    return resp


def delete_transaction(transaction_id):
    """
    Delete Transaction
    """
    resp = requests.delete(
        f'{BASE_URL}/delete/{transaction_id}'
    )
    return resp

def get_current_date():
    """
    return date string for todays date
    """ 
    return datetime.now().strftime("%d-%m-%Y")


if __name__ == '__main__':
    unittest.main()