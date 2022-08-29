import pytest
import random
import uuid

from datetime import datetime

from .. import test_client


def test_assigning_money_to_category(test_client):
    """Test if money assigned this month is correct"""
    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_id = test_client.post("/category/create", json=category).json.get("id")

    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=5000, date="2022-01-01")
    )
    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=5000, date="2022-02-01")
    )

    category_response = test_client.get(f"/category/{category_id}/2022-01-31")
    assert category_response.json.get("assigned_this_month") == 5000
    assert category_response.json.get("balance") == 5000


def test_unassigning_money_to_category(test_client):
    """Test if money assigned and unassigned this month is correct"""
    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_id = test_client.post("/category/create", json=category).json.get("id")

    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=5000, date="2022-01-01")
    )
    test_client.put(
        f"/category/unassign/{category_id}", json=dict(amount=1000, date="2022-01-01")
    )

    category_response = test_client.get(f"/category/{category_id}/2022-01-31")
    assert category_response.json.get("assigned_this_month") == 4000
    assert category_response.json.get("balance") == 4000


def test_spending_money_from_category(test_client):
    """Test if money assigned and spent this month is correct"""
    account_data = {
            "name": "account 39",
            "notes": "foobar889d08",
            "starting_balance": 10000,
            "credit_card": False
        }
    account_response = test_client.post(
        "/account/create", json=account_data
    )
    account_id = account_response.json.get("id")

    payee = {"name": uuid.uuid4().hex}
    payee_id = test_client.post("/payee/create", json=payee).json.get("id")

    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_id = test_client.post("/category/create", json=category).json.get("id")

    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=5000, date="2022-01-01")
    )

    transaction = dict(
        account_id=account_id,
        payee_id=payee_id,
        date="2022-01-02",
        cleared=True,
        categories=[{"category_id": category_id, "amount": -500}],
        amount=-500,
    )
    test_client.post("/transaction/create", json=transaction)

    category_response = test_client.get(f"/category/{category_id}/2022-01-31")
    assert category_response.json.get("assigned_this_month") == 5000
    assert category_response.json.get("balance") == 4500


def test_spending_money_and_deleting_transaction_from_category(test_client):
    """Test if money assigned and spent this month is correct"""
    account_data = {
            "name": "account 39",
            "notes": "foobar889d08",
            "starting_balance": 10000,
            "credit_card": False
        }
    account_response = test_client.post(
        "/account/create", json=account_data
    )
    account_id = account_response.json.get("id")

    payee = {"name": uuid.uuid4().hex}
    payee_id = test_client.post("/payee/create", json=payee).json.get("id")

    category = {"name": uuid.uuid4().hex, "group": uuid.uuid4().hex}
    category_id = test_client.post("/category/create", json=category).json.get("id")

    test_client.put(
        f"/category/assign/{category_id}", json=dict(amount=5000, date="2022-01-01")
    )

    transaction = dict(
        account_id=account_id,
        payee_id=payee_id,
        date="2022-01-02",
        cleared=True,
        categories=[{"category_id": category_id, "amount": -500}],
        amount=-500,
    )
    transaction_id = test_client.post("/transaction/create", json=transaction).json.get(
        "id"
    )
    test_client.delete(f"/transaction/delete/{transaction_id}")

    category_response = test_client.get(f"/category/{category_id}/2022-01-31")
    assert category_response.json.get("assigned_this_month") == 5000
    assert category_response.json.get("balance") == 5000
