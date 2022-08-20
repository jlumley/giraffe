import pytest

from .. import test_client


def test_create_transfer(test_client):
    """Test create transfer"""
    account_1 = test_client.post(
        "/account/create", json=dict(name="new_account44")
    ).json.get("id")
    account_2 = test_client.post(
        "/account/create", json=dict(name="new_account45")
    ).json.get("id")
    account_3 = test_client.post(
        "/account/create", json=dict(name="new_account46")
    ).json.get("id")

    transfers = [
        dict(
            from_account_id=account_1,
            to_account_id=account_2,
            amount=500,
            date="2022-01-01",
            memo="test transfer 1",
            cleared=False,
        )
    ]
    for transfer in transfers:
        create_response = test_client.post("/transfer/create", json=transfer)

        assert create_response.status_code == 201
        assert "id" in create_response.json.keys()


def test_get_transfer(test_client):
    """Test get a single transfer by id"""
    account_1 = test_client.post(
        "/account/create", json=dict(name="new_account66")
    ).json.get("id")
    account_2 = test_client.post(
        "/account/create", json=dict(name="new_account67")
    ).json.get("id")

    transfer = dict(
        from_account_id=account_1,
        to_account_id=account_2,
        amount=500,
        date="2022-01-01",
        memo="test transfer 1",
        cleared=False,
    )

    create_response = test_client.post("/transfer/create", json=transfer)
    transfer_id = create_response.json.get("id")

    transfer_response = test_client.get(f"/transfer/{transfer_id}")

    assert transfer_response.status_code == 200
    for transaction in transfer_response.json:
        assert transaction.get("transfer_id") == transfer_id
        assert transaction.get("categories") != None
        assert transaction.get("cleared") == False
        assert transaction.get("payee_label").startswith("Transfer to/from")


def test_delete_transfer(test_client):
    """Test delete transfer"""
    account_1 = test_client.post(
        "/account/create", json=dict(name="new_account76")
    ).json.get("id")
    account_2 = test_client.post(
        "/account/create", json=dict(name="new_account77")
    ).json.get("id")
    
    transfer = dict(
        from_account_id=account_1,
        to_account_id=account_2,
        amount=500,
        date="2022-01-01",
        memo="test transfer 1",
        cleared=False,
    )

    create_response = test_client.post("/transfer/create", json=transfer)
    transfer_id = create_response.json.get("id")

    delete_response = test_client.delete(f"/transfer/delete/{transfer_id}")
    transfer_response = test_client.get(f"/transfer/{transfer_id}")
    assert delete_response.status_code == 200
    assert transfer_response.status_code == 404
