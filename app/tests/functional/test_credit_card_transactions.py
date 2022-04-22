import pytest
import random
import uuid

from datetime import datetime

from .. import test_client


def test_money_spent_on_credit_card_moves_to_correct_category(test_client):
    """
    Testing when a transaction on a credit card happens the correct amount of 
    money is moved to the credit card category
    """
    account = {"name": uuid.uuid4().hex, "credit_card": True, "starting_balance": -10000}
    account_id = test_client.post("/account/create", json=account).json.get('id')

    payee = {"name": uuid.uuid4().hex}
    payee_id = test_client.post("/payee/create", json=payee).json.get('id')

    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_id = test_client.post("/category/create", json=category).json.get('id')

    transaction = dict(
        account_id=account_id, 
        payee_id=payee_id, 
        date="2022-01-01", 
        cleared=True, 
        categories=[{"category_id": category_id, "amount": -500}],
        amount=-500
    )
    for i in range(10):
        test_client.post("/transaction/create", json=transaction)

    categories = test_client.get("/category/2022-01-02").json
    for c in categories:
        if c.get("id") == category_id:
            assert c.get("balance") == -5000
        if c.get("name") == account.get("name"):
            assert c.get("balance") == 5000

    
def test_deleting_credit_card_transaction_replaces_assigned_money(test_client):
    """
    Testing when a transaction on a credit card is deleted that the money is 
    put back to the category of the transaction
    """
    account = {"name": uuid.uuid4().hex, "credit_card": True, "starting_balance": -10000}
    account_id = test_client.post("/account/create", json=account).json.get('id')

    payee = {"name": uuid.uuid4().hex}
    payee_id = test_client.post("/payee/create", json=payee).json.get('id')

    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_id = test_client.post("/category/create", json=category).json.get('id')

    transaction = dict(
        account_id=account_id, 
        payee_id=payee_id, 
        date="2022-01-01", 
        cleared=True, 
        categories=[{"category_id": category_id, "amount": -500}],
        amount=-500
    )
    for i in range(1,5):
        transaction_id  = test_client.post("/transaction/create", json=transaction).json.get('id')
        test_client.delete(f"/transaction/delete/{transaction_id}").json

    categories = test_client.get("/category/2022-01-02").json
    for c in categories:
        if c.get("id") == category_id:
            assert c.get("balance") == 0
        if c.get("name") == account.get("name"):
            assert c.get("balance") == 0


def test_updating_credit_card_transaction_moves_assigned_money(test_client):
    """
    Testing when a transaction on a credit card is updating the original categories
    get their money back and everything still lines up
    """
    account = {"name": uuid.uuid4().hex, "credit_card": True, "starting_balance": -10000}
    account_id = test_client.post("/account/create", json=account).json.get('id')

    payee = {"name": uuid.uuid4().hex}
    payee_id = test_client.post("/payee/create", json=payee).json.get('id')

    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_1 = test_client.post("/category/create", json=category).json.get('id')
    category_2 = test_client.post("/category/create", json=category).json.get('id')
    category_3 = test_client.post("/category/create", json=category).json.get('id')

    transaction = dict(
        account_id=account_id, 
        payee_id=payee_id, 
        date="2022-01-01", 
        cleared=True, 
        categories=[{"category_id": category_1, "amount": -500}],
        amount=-500
    )

    update = dict(
        categories=[
            {"category_id": category_2, "amount": -500},
            {"category_id": category_3, "amount": -500}
        ],
        amount=-1000
    )
    
    transaction_id  = test_client.post("/transaction/create", json=transaction).json.get('id')
    test_client.put(f"/transaction/update/{transaction_id}", json=update)

    category_1_data = test_client.get(f"/category/{category_1}/2022-01-01").json
    category_2_data = test_client.get(f"/category/{category_2}/2022-01-01").json
    category_3_data = test_client.get(f"/category/{category_3}/2022-01-01").json

    assert category_1_data.get("balance") == 0
    assert category_2_data.get("balance") == -500
    assert category_3_data.get("balance") == -500
