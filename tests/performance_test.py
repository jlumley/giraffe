import json
import random
import requests
import uuid
import time

num_categories = 50
num_accounts = 20
num_payees = 500
num_transactions = 100


def main():
    accounts = []
    payees = []
    categories = []

    # create accounts
    for i in range(num_accounts):
        account = dict(name=uuid.uuid4().hex)
        accounts.append(account)
        r = requests.post("http://localhost/api/account/create", json=account)
        # print(r.content)

    # create payees
    for i in range(num_payees):
        payee = dict(name=uuid.uuid4().hex)
        payees.append(payee)
        r = requests.post("http://localhost/api/payee/create", json=payee)
        # print(r.content)

    # create categories
    for i in range(num_categories):
        category = dict(name=uuid.uuid4().hex, category_group="new group")
        categories.append(category)
        r = requests.post("http://localhost/api/category/create", json=category)
        # print(r.content)

    # fund accounts
    for i in range(num_accounts):
        transaction = dict(
            payee_id=1,
            account_id=i,
            memo="Income",
            cleared=True,
            date="12-10-2001",
            amount=100000000,
        )
        requests.post("http://localhost/api/transaction/create", json=transaction)

    # fund categories
    for i in range(num_categories):
        r = requests.put(
            f"http://localhost/api/category/assign/{i}",
            json=dict(amount=1000000.00, date="12-10-2001"),
        )
    r = requests.get("http://localhost/api/category/balance/1").content
    before_resp = json.loads(r)
    print(f"Category balance before spending: ${before_resp['balance']}")

    # Spend Spend Spend
    amount_spent = 0.00
    for i in range(num_transactions):
        amount = round(random.uniform(0.01, 15.00), 2) * -1
        amount_spent += int(amount * 100)
        transaction = dict(
            payee_id=1,
            account_id=1,
            category_id=1,
            memo="Spend spend spend",
            cleared=True,
            date="12-08-2011",
            amount=amount,
        )
        r = requests.post("http://localhost/api/transaction/create", json=transaction)
        # print(r.content)

    print(f"Amount spent: ${round(amount_spent/100,2)}")
    # print(requests.get('http://localhost/api/account').content[0])

    r = requests.get("http://localhost/api/category/balance/1").content
    after_resp = json.loads(r)
    print(f"Category balance after spending: ${after_resp['balance']}")
    print(f"Difference: ${round(before_resp['balance']-after_resp['balance'],2)}")

    for i in range(num_accounts, num_accounts + num_transactions + 1):
        r = requests.delete(f"http://localhost/api/transaction/delete/{i}")
        # print(r.content)

    r = requests.get("http://localhost/api/transaction").content
    r = json.loads(r)
    # print(r)

    r = requests.get("http://localhost/api/account").content
    r = json.loads(r)[0]
    # print(r)
    r = requests.get("http://localhost/api/category/balance/1").content
    r = json.loads(r)
    print(f"Category balance after deleting transactions: ${r['balance']}")


if __name__ == "__main__":
    main()
