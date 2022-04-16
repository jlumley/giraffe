import pytest
import random
import uuid

from . import test_client

def test_create_account_success(test_client):
    """ Testing successfully creating account
    """
    accounts = [
        {"name": uuid.uuid4().hex},
        {"name": uuid.uuid4().hex, "starting_balance": 100},
        {"name": uuid.uuid4().hex, "notes": uuid.uuid4().hex},
        {"name": uuid.uuid4().hex, "starting_balanace": -100},
    ]
    for account in accounts:
        create_response = test_client.post('/account/create', json=account)
        assert create_response.status_code == 201
        assert b'id' in create_response.data


def test_create_account_fail(test_client):
    """ Testing unsuccessfully creating account
    """
    accounts = [
        {"nam": uuid.uuid4().hex},
        {"nsame": uuid.uuid4().hex, "starting_balance": 100},
        {"notes": uuid.uuid4().hex},
        {"starting_balanace": -100},
        {}
    ]
    for account in accounts:
        create_response = test_client.post('/account/create', json=account)
        assert create_response.status_code == 400

def test_hide_account(test_client):
    """Testing hiding an account
    """
    create_response = test_client.post('/account/create', json=dict(name=uuid.uuid4().hex))
    account_id = create_response.json.get('id')

    hide_response = test_client.put(f'/account/hide/{account_id}')
    account_response = test_client.get(f'/account/{account_id}')

    assert account_response.json.get("hidden") == True
    assert account_response.status_code == 200
    assert hide_response.status_code == 200

def test_unhide_account(test_client):
    """Testing unhiding an account
    """
    create_response = test_client.post('/account/create', json=dict(name=uuid.uuid4().hex))
    account_id = create_response.json.get('id')

    hide_response = test_client.put(f'/account/unhide/{account_id}')
    account_response = test_client.get(f'/account/{account_id}')

    assert account_response.json.get("hidden") == False
    assert account_response.status_code == 200
    assert hide_response.status_code == 200
        