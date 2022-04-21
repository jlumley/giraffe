import json
import random
import requests
import uuid
import time

num_categories = 5
num_transactions = 0


def main():
    accounts = ["Mastercard", "Visa", "Checking", "Saving"]
    payees = ["Amazon", "Loblaws", "LCBO", "Walmart", "Apple"]
    categories = ["Mortgage", "Groceries", "Cellphone", "gifts", "Car Repair"]

    # create accounts
    for a in accounts:
        account = dict(name=a, credit_card=False, starting_balance=10000)
        if a in ["Visa", "Mastercard"]:
            account["credit_card"] = True
            account["starting_balance"] = -1000

        r = requests.post("http://localhost/api/account/create", json=account)

    # create payees
    for p in payees:
        payee = dict(name=p)
        r = requests.post("http://localhost/api/payee/create", json=payee)
        # print(r.content)

    # create categories
    for c in categories:
        group = random.randint(0, 2)
        category = dict(name=c, group="group" + str(group))
        r = requests.post("http://localhost/api/category/create", json=category)
        # print(r.content)

    # fund accounts
    for i in []:
        transaction = dict(
            payee_id=1,
            account_id=i,
            memo="Income",
            cleared=True,
            date="2022-01-01",
            amount=999999,
            categories=[dict(category_id=1, amount=999999)],
        )
        r = requests.post("http://localhost/api/transaction/create", json=transaction)
        # print(r.content)

    # create trasfer between accounts
    transfer_data = dict(
        from_account_id=3, to_account_id=1, amount=50, date="2022-02-01"
    )
    r = requests.post(
        "http://localhost/api/transaction/transfer/create", json=transfer_data
    )

    # fund categories
    for i in range(len(categories)):
        if i % 2 == 0:
            r = requests.put(
                f"http://localhost/api/category/update/{i+1}/target",
                json=dict(target_type="monthly_savings", target_amount=50000),
            )
        else:
            r = requests.put(
                f"http://localhost/api/category/update/{i+1}/target",
                json=dict(
                    target_type="savings_target",
                    target_amount=53567,
                    target_date="2022-04-02",
                ),
            )

    #   print(r.content)
    r = requests.get("http://localhost/api/category/1/2022-01-01").content
    before_resp = json.loads(r)
    # print(f"Category balance before spending: ${before_resp[0]['balance']}")

    r = requests.get("http://localhost/api/category/2022-01-01").content
    r = json.loads(r)
    # print(r)

    # Spend Spend Spend
    amount_spent = 0
    for i in range(num_transactions):
        amount = int(random.randint(0, 15000) * -1)
        if i % len(categories) == 0:
            amount_spent += int(amount)
        transaction = dict(
            payee_id=1,
            account_id=1,
            categories=[dict(category_id=(i % len(categories) + 1), amount=amount)],
            memo="Spend spend spend",
            cleared=True,
            date="2022-01-01",
            amount=amount,
        )
        r = requests.post("http://localhost/api/transaction/create", json=transaction)
        print(r.content)

    for i in range(num_transactions):
        amount = int(random.randint(0, 15000) * -2)
        if i % len(categories) == 0:
            amount_spent += int(amount)
        transaction = dict(
            payee_id=1,
            account_id=1,
            categories=[
                dict(category_id=(i % len(categories) + 1), amount=amount / 2),
                dict(category_id=(i % num_categories + 2), amount=amount / 2),
            ],
            memo="Spend spend spend",
            cleared=True,
            date="2022-01-01",
            amount=amount,
        )
        r = requests.post("http://localhost/api/transaction/create", json=transaction)
        print(r.content)

    print(f"Amount spent: ${amount_spent}")
    # print(requests.get('http://localhost/api/account').content[0])

    r = requests.get("http://localhost/api/category/1/2022-01-01").content
    after_resp = json.loads(r)
    # print(f"Category balance after spending: ${after_resp[0]['balance']}")
    # print(f"Difference: ${round(before_resp[0]['balance']-after_resp[0]['balance'],2)}")


if __name__ == "__main__":
    main()
