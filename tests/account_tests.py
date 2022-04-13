import random
import requests
import unittest
import uuid

from datetime import datetime

API_HOST = "localhost"
API_PORT = 80
API_BASE_PATH = "/api/account"

BASE_URL = f"http://{API_HOST}:{API_PORT}{API_BASE_PATH}"


class TestAccountEndpoints(unittest.TestCase):
    def test_create_account_success(self):
        """
        Testing creating new accounts successfully
        """
        accounts = [
            {"name": uuid.uuid4().hex[:8]},
            {"name": uuid.uuid4().hex[:8], "starting_balance": 100},
            {"name": uuid.uuid4().hex[:8], "notes": uuid.uuid4().hex[:8]},
            {"name": uuid.uuid4().hex[:8], "starting_balanace": -100},
        ]
        for account in accounts:
            resp = create_account(account)
            self.assertEqual(resp.status_code, 201)

    def test_create_account_fail(self):
        """
        Test Creating Accounts Unseccessfully
        """
        accounts = [
            {"nam": uuid.uuid4().hex[:8]},
            {"nae": uuid.uuid4().hex[:8], "starting_balace": 100},
            {"notes": uuid.uuid4().hex[:8]},
            {},
        ]
        for account in accounts:
            resp = create_account(account)
            self.assertEqual(resp.status_code, 400)

    def test_hide_account(self):
        """
        Testing hiding an account
        """
        # create account
        resp = create_account(dict(name="foo"))
        account_id = resp.json()[0]["id"]

        resp = hide_account(account_id)
        self.assertEqual(resp.status_code, 200)

        accounts = get_accounts().json()
        accounts = [a for a in accounts if a["id"] == account_id]
        for a in accounts:
            self.assertEqual(a["hidden"], True)

    def test_unhide_account(self):
        """
        Testing unhiding an account
        """
        # create account
        resp = create_account(dict(name="foo"))
        account_id = resp.json()[0]["id"]

        hide_account(account_id)
        resp = unhide_account(account_id)
        self.assertEqual(resp.status_code, 200)

        accounts = get_accounts().json()
        accounts = [a for a in accounts if a["id"] == account_id]
        for a in accounts:
            self.assertEqual(a["hidden"], False)

    def test_account_reconcile(self):
        """
        Testing Reconciling an account
        """
        starting_balance = random.randint(1, 999)
        resp = create_account(dict(name="foo", starting_balance=starting_balance))
        account_id = resp.json()[0]["id"]

        new_balance = starting_balance + 100
        resp = reconcile_account(account_id, new_balance)
        self.assertEqual(resp.status_code, 200)

        accounts = get_accounts().json()
        accounts = [a for a in accounts if a["id"] == account_id]
        for a in accounts:
            self.assertEqual(a["cleared_balance"], new_balance)


def reconcile_account(account_id, balance):
    """
    Reconile account balance
    """
    resp = requests.put(
        f"{BASE_URL}/reconcile/{account_id}",
        json={"balance": balance, "date": get_current_date()},
    )

    return resp


def get_accounts():
    """
    Fetch all accounts
    """
    resp = requests.get(f"{BASE_URL}")
    return resp


def create_account(account_data):
    """
    Create New Account
    """
    resp = requests.post(f"{BASE_URL}/create", json=account_data)
    return resp


def hide_account(account_id):
    """
    Hide Account
    """
    resp = requests.put(f"{BASE_URL}/hide/{account_id}")
    return resp


def unhide_account(account_id):
    """
    Unhide Account
    """
    resp = requests.put(f"{BASE_URL}/unhide/{account_id}")
    return resp


def get_current_date():
    """
    return date string for todays date
    """
    return datetime.now().strftime("%d-%m-%Y")


if __name__ == "__main__":
    unittest.main()
