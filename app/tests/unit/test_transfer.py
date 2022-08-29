import pytest

from .. import test_client


def test_create_transfer(test_client):
    """Test create transfer"""
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_1 = create_response.json.get("id")
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_2 = create_response.json.get("id")
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_3 = create_response.json.get("id")

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
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_1 = create_response.json.get("id")
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_2 = create_response.json.get("id")

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
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_1 = create_response.json.get("id")
    account_data = {
            "name": "account 3n",
            "notes": "foobar88kd08",
            "starting_balance": 993411155,
            "credit_card": False
        }
    create_response = test_client.post(
        "/account/create", json=account_data
    )
    account_2 = create_response.json.get("id")

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
