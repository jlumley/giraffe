import pytest
import random
import uuid

from datetime import datetime

from .. import test_client


def test_create_account_success(test_client):
    """Testing successfully creating account"""
    accounts = [
        {"name": uuid.uuid4().hex},
        {"name": uuid.uuid4().hex, "starting_balance": 100},
        {"name": uuid.uuid4().hex, "notes": uuid.uuid4().hex},
        {"name": uuid.uuid4().hex, "starting_balanace": -100},
        {"name": uuid.uuid4().hex, "credit_card": True},
    ]
    for account in accounts:
        create_response = test_client.post("/account/create", json=account)
        assert create_response.status_code == 201
        assert "id" in create_response.json.keys()
        if account.get("starting_balance"):
            assert create_response.json.get("cleared_balance") == account.get(
                "starting_balance"
            )


def test_create_account_fail(test_client):
    """Testing unsuccessfully creating account"""
    accounts = [
        {"nam": uuid.uuid4().hex},
        {"nsame": uuid.uuid4().hex, "starting_balance": 100},
        {"notes": uuid.uuid4().hex},
        {"starting_balanace": -100},
        {},
    ]
    for account in accounts:
        create_response = test_client.post("/account/create", json=account)
        assert create_response.status_code == 400


def test_get_account(test_client):
    """Testing get as single account by id"""

    create_response = test_client.post(
        "/account/create", json=dict(name=uuid.uuid4().hex)
    )
    account_id = create_response.json.get("id")

    account_response = test_client.get(f"/account/{account_id}")

    assert account_response.status_code == 200
    assert set(account_response.json.keys()) == set(
        [
            "id",
            "notes",
            "credit_card",
            "reconciled_date",
            "created_date",
            "hidden",
            "uncleared_balance",
            "name",
            "cleared_balance",
        ]
    )


def test_get_accounts(test_client):
    """Testing get all accounts"""

    account_response = test_client.get(f"/account")
    assert account_response.status_code == 200
    for account in account_response.json:
        assert set(account.keys()) == set(
            [
                "id",
                "notes",
                "credit_card",
                "reconciled_date",
                "created_date",
                "hidden",
                "uncleared_balance",
                "name",
                "cleared_balance",
            ]
        )


def test_reconcile_account(test_client):
    """Testing account reconciliation"""
    create_response = test_client.post(
        "/account/create", json=dict(name=uuid.uuid4().hex)
    )
    account_id = create_response.json.get("id")
    reconcile_amount = random.randint(100, 10000)
    reconcile_date = datetime.now().strftime("%Y-%m-%d")

    reconcile_response = test_client.put(
        f"/account/reconcile/{account_id}",
        json=dict(balance=reconcile_amount, date=reconcile_date),
    )
    assert reconcile_response.status_code == 200
    assert reconcile_response.json.get("reconciled_date") == reconcile_date
    assert reconcile_response.json.get("cleared_balance") == reconcile_amount


def test_hide_account(test_client):
    """Testing hiding an account"""
    create_response = test_client.post(
        "/account/create", json=dict(name=uuid.uuid4().hex)
    )
    account_id = create_response.json.get("id")

    hide_response = test_client.put(f"/account/hide/{account_id}")
    account_response = test_client.get(f"/account/{account_id}")

    assert account_response.json.get("hidden") == True
    assert account_response.status_code == 200
    assert hide_response.status_code == 200


def test_unhide_account(test_client):
    """Testing unhiding an account"""
    create_response = test_client.post(
        "/account/create", json=dict(name=uuid.uuid4().hex)
    )
    account_id = create_response.json.get("id")

    hide_response = test_client.put(f"/account/unhide/{account_id}")
    account_response = test_client.get(f"/account/{account_id}")

    assert account_response.json.get("hidden") == False
    assert account_response.status_code == 200
    assert hide_response.status_code == 200
