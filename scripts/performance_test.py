import json
import random
import requests
import uuid
import time

num_transactions = 2000

category_uuids = []
account_uuids = []
payee_uuids= []
transactions=[]
def main():
    # create accounts
    with open("scripts/accounts.txt") as f:
        accounts = f.readlines()
        for a in accounts:
            account = dict(name=a, credit_card=False, starting_balance=1000000)
            r = requests.post("http://localhost:9980/api/account/create", json=account)
            account_uuids.append(r.json()["id"])

    # create payees
    with open("scripts/payees.txt") as f:
        payees = f.readlines() 
        for p in payees:
            payee = dict(name=p)
            r = requests.post("http://localhost:9980/api/payee/create", json=payee)
            payee_uuids.append(r.json()["id"])
    
    # create categories
    with open("scripts/categories.txt") as f:
        categories = f.readlines() 
        for c in categories:
            category = dict(name=c.split(",")[1], group=c.split(",")[0])
            r = requests.post("http://localhost:9980/api/category/create", json=category)
            category_uuids.append(r.json()["id"])

    # create transactions
    for i in range(num_transactions):
        amount = random.randint(99,100000)*-1
        transaction = dict(
            payee_id=random.choice(payee_uuids),
            account_id=random.choice(account_uuids),
            cleared=True,
            date=f"2022-{str(random.randint(1,12)).zfill(2)}-{str(random.randint(1,28)).zfill(2)}",
            amount=amount,
            categories=[dict(category_id=random.choice(category_uuids), amount=amount)],
        )
        r = requests.post("http://localhost:9980/api/transaction/create", json=transaction)
        transactions.append(r.json())




if __name__ == "__main__":
    main()

