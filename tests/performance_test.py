import json
import random
import requests
import uuid
import time

num_categories = 40
num_accounts = 3
num_payees = 100
num_transactions = 2000


def main():
    accounts = []
    payees = []
    categories = []

    # create accounts
    for i in range(num_accounts):
        account = dict(name=uuid.uuid4().hex[:4])
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
        category = dict(name=uuid.uuid4().hex[:6], group="group" + str(i % 3))
        categories.append(category)
        r = requests.post("http://localhost/api/category/create", json=category)
        # print(r.content)

    # fund accounts
    for i in range(1, num_accounts + 1):
        transaction = dict(
            payee_id=1,
            account_id=i,
            memo="Income",
            cleared=True,
            date="2022-01-01",
            amount=9999999,
        )
        r = requests.post("http://localhost/api/transaction/create", json=transaction)
    # print(r.content)
    # fund categories
    for i in range(1, num_categories + 1):
        if i % 2 == 0:
            r = requests.put(
                f"http://localhost/api/category/update/{i}/target",
                json=dict(target_type="monthly_savings", target_amount=50000),
            )
        else:
            r = requests.put(
                f"http://localhost/api/category/update/{i}/target",
                json=dict(
                    target_type="savings_target",
                    target_amount=53567,
                    target_date="2022-04-02",
                ),
            )

        #  print(r.content)
        r = requests.put(
            f"http://localhost/api/category/assign/{i}",
            json=dict(amount=1000000, date="2022-01-02"),
        )

    #   print(r.content)
    r = requests.get("http://localhost/api/category/1/2022-01-01").content
    before_resp = json.loads(r)
    print(f"Category balance before spending: ${before_resp[0]['balance']}")

    r = requests.get("http://localhost/api/category/2022-01-01").content
    r = json.loads(r)
    # print(r)

    # Spend Spend Spend
    amount_spent = 0
    for i in range(num_transactions):
        amount = int(random.randint(0, 15000) * -1)
        if i % num_categories == 0:
            amount_spent += int(amount)
        transaction = dict(
            payee_id=1,
            account_id=1,
            categories=[dict(category_id=(i % num_categories + 1), amount=amount)],
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
    print(f"Category balance after spending: ${after_resp[0]['balance']}")
    print(f"Difference: ${round(before_resp[0]['balance']-after_resp[0]['balance'],2)}")

    for i in range(num_accounts, num_accounts + num_transactions + 1):
        # r = requests.delete(f"http://localhost/api/transaction/delete/{i}")
        # print(r.content)
        pass

    r = requests.get("http://localhost/api/transaction").content
    r = json.loads(r)
    # print(r)

    r = requests.get("http://localhost/api/account").content
    r = json.loads(r)
    # print(r)
    r = requests.get("http://localhost/api/category/1/2022-01-01").content
    r = json.loads(r)
    print(f"Category balance after deleting transactions: ${r[0]['balance']}")

    r = requests.get("http://localhost/api/category/2022-01-01").content
    r = json.loads(r)
    # print(r)


if __name__ == "__main__":
    main()
