import pytest
import random
import uuid

from . import test_client


def test_create_payee_success(test_client):
    """Test successfully creating new payee"""
    payees = [{"name": uuid.uuid4().hex}]

    for payee in payees:
        create_response = test_client.post("/payee/create", json=payee)
        assert create_response.status_code == 201
        assert "id" in create_response.json.keys()


def test_create_payee_fail(test_client):
    """Test unsuccessfully creating new payee"""
    payees = [{"name": 123}, {}]

    for payee in payees:
        create_response = test_client.post("/payee/create", json=payee)
        assert create_response.status_code == 400


def test_get_payees(test_client):
    """Test getting all payees"""
    test_client.post("/payee/create", json=dict(name=uuid.uuid4().hex))
    payees_response = test_client.get("/payee")
    assert payees_response.status_code == 200
    assert len(payees_response.json) > 0
    for payee in payees_response.json:
        assert type(payee.get("id")) is int
        assert type(payee.get("name")) is str


def test_get_payee(test_client):
    """Test getting single payee"""
    create_response = test_client.post(
        "/payee/create", json=dict(name=uuid.uuid4().hex)
    )
    payee_id = create_response.json.get("id")
    payee_response = test_client.get(f"/payee/{payee_id}")

    assert payee_response.status_code == 200
    assert payee_response.json.get("id") == payee_id
    assert type(payee_response.json.get("name")) is str


def test_update_payee(test_client):
    """Test updating payee"""
    create_response = test_client.post(
        "/payee/create", json=dict(name=uuid.uuid4().hex)
    )
    payee_id = create_response.json.get("id")
    new_payee_name = uuid.uuid4().hex
    update_response = test_client.put(
        f"/payee/update/{payee_id}", json=dict(name=new_payee_name)
    )
    payee_response = test_client.get(f"/payee/{payee_id}")

    assert update_response.status_code == 200
    assert payee_response.json.get("id") == payee_id
    assert payee_response.json.get("name") == new_payee_name


def test_delete_payee(test_client):
    """Test deleting payee"""
    create_response = test_client.post(
        "/payee/create", json=dict(name=uuid.uuid4().hex)
    )
    payee_id = create_response.json.get("id")
    delete_response = test_client.delete(f"/payee/delete/{payee_id}")
    payees_response = test_client.get("/payee")

    assert delete_response.status_code == 200
    assert delete_response.json.get("id") == payee_id
    assert payee_id not in [p.get("id") for p in payees_response.json]
