import pytest

from .. import test_client

def test_create_transaction_success(test_client):
    """Test successfully creating transaction"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transactions = [
        dict(
            payee_id=payee_id,
            account_id=account_id,
            categories=[dict(category_id=category_id, amount=-5000)],
            date="2022-04-22",
            cleared=True,
            memo="testing new transaction",
        )
    ]
    for transaction in transactions:
        create_response = test_client.post("/transaction/create", json=transaction)
        transaction_id = create_response.json.get("id")
        transaction_response = test_client.get(f"/transaction/{transaction_id}")
        assert create_response.status_code == 201
        assert transaction_response.json.get("date") == transaction.get("date")
        assert transaction_response.json.get("cleared") == transaction.get("cleared")


def test_create_transaction_fail(test_client):
    """Test successfully creating transaction"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transactions = [
        dict(
            payee_id=payee_id,
            account_id=99999,
            date="2022-04-22",
            cleared=True,
        ),
        dict(
            payee_id=99999,
            account_id=account_id,
            date="2022-04-22",
            cleared=True,
            amount=500,
        ),
        dict(payee_id=99999, account_id=account_id, date="2022-04-22", cleared=True),
    ]
    for transaction in transactions:
        create_response = test_client.post("/transaction/create", json=transaction)
        assert create_response.status_code == 400


def test_update_transaction(test_client):
    """Test successfully updating transaction"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_cat2")
    ).json.get("id")

    new_payee_id = test_client.post(
        "/payee/create", json=dict(name="amazontest2")
    ).json.get("id")
    new_account_id = test_client.post(
        "/account/create", json=dict(name="new_account12")
    ).json.get("id")
    new_category_id = test_client.post(
        "/category/create", json=dict(group="new_group12", name="new_cat00")
    ).json.get("id")
    new_memo = "some new memo"
    new_date = "2022-05-22"
    new_categories = [dict(category_id=new_category_id, amount=50)]
    new_amount = 50

    transaction = dict(
        payee_id=payee_id,
        account_id=account_id,
        categories=[dict(category_id=category_id, amount=-5000)],
        date="2022-04-22",
        cleared=True,
        memo="testing new transaction",
    )
    create_response = test_client.post("/transaction/create", json=transaction)
    transaction_id = create_response.json.get("id")

    updates = [
        dict(payee_id=new_payee_id),
        dict(account_id=new_account_id),
        dict(categories=new_categories, amount=new_amount),
        dict(memo=new_memo),
        dict(date=new_date),
    ]

    for update in updates:
        update_response = test_client.put(
            f"/transaction/update/{transaction_id}", json=update
        )
        assert update_response.status_code == 200
        assert update_response.json.get("id") == transaction_id

    transaction_response = test_client.get(f"/transaction/{transaction_id}")
    assert transaction_response.status_code == 200
    assert transaction_response.json.get("payee_id") == new_payee_id
    assert transaction_response.json.get("account_id") == new_account_id
    assert transaction_response.json.get("memo") == new_memo
    assert transaction_response.json.get("date") == new_date
    assert transaction_response.json.get("categories") == [dict(category_id=new_category_id, amount=50, category_label="new_cat00")]


def test_delete_transaction(test_client):
    """Test deleting transaction"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transaction = dict(
        payee_id=payee_id,
        account_id=account_id,
        categories=[dict(category_id=category_id, amount=99)],
        date="2022-04-26",
        cleared=True,
        memo="testing deleting transaction",
    )
    create_response = test_client.post("/transaction/create", json=transaction)
    transaction_id = create_response.json.get("id")

    delete_response = test_client.delete(f"/transaction/delete/{transaction_id}")
    assert delete_response.status_code == 200

    transaction_response = test_client.get(f"/transaction/{transaction_id}")
    assert transaction_response.status_code == 404
    assert b"Transaction Not Found" in transaction_response.data


def test_get_transaction(test_client):
    """Test get single transaction by id"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transaction = dict(
        payee_id=payee_id,
        account_id=account_id,
        categories=[dict(category_id=category_id, amount=99)],
        date="2022-08-26",
        cleared=True,
        memo="testing deleting transaction",
    )
    create_response = test_client.post("/transaction/create", json=transaction)
    transaction_id = create_response.json.get("id")

    transaction_response = test_client.get(f"/transaction/{transaction_id}")
    assert transaction_response.status_code == 200
    assert transaction_response.json.get("id") == transaction_id

def test_transaction_reconciled(test_client):
    """Test the reconciled option when fetching transactions"""

    request_args = dict(reconciled=True) 
    transaction_response = test_client.get(f"/transaction", query_string=request_args)
       
    assert transaction_response.status_code == 200
    assert [t for t in transaction_response.json if t["reconciled"] == False] == [] 

    request_args = dict(reconciled=False) 
    transaction_response = test_client.get(f"/transaction", query_string=request_args)
       
    assert transaction_response.status_code == 200
    assert [t for t in transaction_response.json if t["reconciled"] == True] == [] 

def test_transaction_cleared(test_client):
    """Test the cleared option when fetching transactions"""

    request_args = dict(cleared=True) 
    transaction_response = test_client.get(f"/transaction", query_string=request_args)
       
    assert transaction_response.status_code == 200
    assert [t for t in transaction_response.json if t["cleared"] == False] == [] 

    request_args = dict(cleared=False) 
    transaction_response = test_client.get(f"/transaction", query_string=request_args)
       
    assert transaction_response.status_code == 200
    assert [t for t in transaction_response.json if t["cleared"] == True] == [] 

def test_transaction_limit(test_client):
    """Test the limit option when fetching transactions"""

    request_args = dict(limit=3) 
    transaction_response = test_client.get(f"/transaction", query_string=request_args)
       
    assert transaction_response.status_code == 200
    assert len(transaction_response.json) == 3

def test_transaction_pagination(test_client):
    """Test the offset option when fetching transactions"""

    transaction_response = test_client.get(f"/transaction")
    
    request_args = dict(offset=5) 
    transaction_pagination_response = test_client.get(f"/transaction", query_string=request_args)
       
    assert transaction_pagination_response.status_code == 200
    assert transaction_pagination_response.json[0]["id"] == transaction_response.json[5]["id"]
    
def test_put_transaction_update_cleared(test_client):
    """Test get single transaction by id"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transaction = dict(
        payee_id=payee_id,
        account_id=account_id,
        categories=[dict(category_id=category_id, amount=99)],
        date="2022-08-26",
        cleared=True,
        memo="testing jjjjj transaction",
    )
    create_response = test_client.post("/transaction/create", json=transaction)
    transaction_id = create_response.json.get("id")

    test_client.put(f"/transaction/update/cleared/{transaction_id}/false")

    transaction_response = test_client.get(f"/transaction/{transaction_id}")
    assert transaction_response.status_code == 200
    assert transaction_response.json.get("id") == transaction_id
    assert transaction_response.json.get("cleared") == False

def test_put_transaction_update_cleared_invalid_id(test_client):
    """Test get single transaction by id"""
    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transaction = dict(
        payee_id=payee_id,
        account_id=account_id,
        categories=[dict(category_id=category_id, amount=99)],
        date="1222-08-10",
        cleared=True,
        memo="testing deleting asdfg",
    )
    create_response = test_client.post("/transaction/create", json=transaction)
    transaction_id = create_response.json.get("id")

    update_response = test_client.put(f"/transaction/update/cleared/99999/false")
    assert update_response.status_code == 400


def test_get_transactions(test_client):
    """Test get all transactions"""

    transaction_response = test_client.get(f"/transaction")
    assert transaction_response.status_code == 200

def test_get_transactions_memo_arg(test_client):
    """ Test get all transaction matching a memo search"""

    payee_id = test_client.post("/payee/create", json=dict(name="amazontest")).json.get(
        "id"
    )
    account_id = test_client.post(
        "/account/create", json=dict(name="new_account1")
    ).json.get("id")
    category_id = test_client.post(
        "/category/create", json=dict(group="new_group1", name="new_account1")
    ).json.get("id")

    transactions = [
        dict(
            payee_id=payee_id,
            account_id=account_id,
            categories=[dict(category_id=category_id, amount=-5000)],
            date="2022-04-22",
            cleared=True,
            memo="foo_qwerty444999_bar",
        )
    ]
    for transaction in transactions:
        create_response = test_client.post("/transaction/create", json=transaction)
        transaction_id = create_response.json.get("id")
        request_args = dict(memo="qwerty444999") 
        transaction_response = test_client.get(f"/transaction", query_string=request_args)
        assert transaction_response.status_code == 200
        assert transaction_id in [t["id"] for t in transaction_response.json]
        assert len(transaction_response.json) == 1
