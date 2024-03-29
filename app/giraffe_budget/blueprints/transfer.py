from . import account
from . import category
from ..models.transfer import *
from ..sql.transfer_statements import *
from ..utils import db_utils, time_utils, money_utils
from .transaction import parse_transactions
from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json
from flask_pydantic import validate
from hashlib import md5
import sqlite3
import time
import uuid

transfer = Blueprint("transfer", __name__, url_prefix="/transfer")

@transfer.route("/<transfer_id>", methods=("GET",))
@validate()
def _get_transfer(transfer_id: str):
    """Get a transfer"""
    try:
        transfer = get_transfer(transfer_id)
        if not transfer:
            return make_response(jsonify(f"Transfer id: {transfer_id} Not Found"), 404)

    except (
        RuntimeError,
        TypeError,
    ) as e:
        return make_response(jsonify(str(e)), 400)

    return make_response(jsonify(transfer), 200)


@transfer.route("/create", methods=("POST",))
@validate()
def _create_transfer(body: CreateTransferModel):
    """Create new transfer"""
    date = body.date
    from_account_id = body.from_account_id
    to_account_id = body.to_account_id
    amount = body.amount
    memo = body.memo
    cleared = body.cleared
    try:
        transfer_id = create_transfer(
            date=date,
            from_account_id=from_account_id,
            to_account_id=to_account_id,
            amount=amount,
            memo=memo,
            cleared=cleared
        )
    except (RuntimeError, TypeError, sqlite3.IntegrityError) as e:
        return make_response(jsonify(str(e)), 400)

    return make_response(jsonify({"id": transfer_id}), 201)


@transfer.route("/update/<transfer_id>", methods=("PUT",))
@validate()
def _update_transfer(transfer_id: str, body: UpdateTransferModel):
    """Update transfer"""
    from_account_id = body.from_account_id
    to_account_id = body.to_account_id
    amount = body.amount
    date = body.date
    memo = body.memo
    transfer_id = update_transfer(
        transfer_id,
        from_account_id,
        to_account_id,
        amount,
        date,
        memo=memo
    )

    return make_response(jsonify(transfer_id), 200)


@transfer.route("/delete/<string:transfer_id>", methods=("DELETE",))
def _delete_transfer(transfer_id):
    """Delete transfer"""
    deleted_ids = delete_transfer(transfer_id)
    if not deleted_ids:
        return make_response(jsonify(f"Transfer id: {transfer_id} Not Found"), 404)

    return make_response(jsonify(deleted_ids), 200)


def delete_transfer(transfer_id):
    """Delete a transfer

    Args:
        transfer_id (int): transfer id

    Returns:
        int: id of deleted transfer
    """
    db_utils.execute(
        DELETE_TRANSFER_CATEGORIES,
        {"transfer_id": transfer_id}
    )
    transactions = db_utils.execute(
        DELETE_TRANSFER, {"transfer_id": transfer_id}, commit=True
    )

    return [t["id"] for t in transactions]


def update_transfer(
    transfer_id, from_account_id, to_account_id, amount, date, memo=None
):
    """update existing transfer

    Args:
        transfer_id (string): existing transfer id
        from_account_id (int): account id where money is coming from
        to_account_id (int): account id where money is going to
        amount (int): amount of money in cents
        date (int): date of transfer (YYYMMDD).
        memo (str, optional): memo. Defaults to None.
    """

    # update transaction of account money is leaving

    update_vars = dict(
        transfer_id=transfer_id,
        from_account_id=from_account_id,
        to_account_id=to_account_id,
        date=date,
        memo=memo,
    )

    update_from_statement = UPDATE_TRANSFER
    update_to_statement = UPDATE_TRANSFER
    if from_account_id:
        update_from_statement += ", account_id = :from_account_id"
        update_to_statement += ", payee_id = :from_account_id"

    if to_account_id:
        update_from_statement += ", payee_id = :to_account_id"
        update_to_statement += ", account_id = :to_account_id"

    if date:
        update_from_statement += ", date = :date"
        update_to_statement += ", date = :date"

    if memo:
        update_from_statement += ", memo = :memo"
        update_to_statement += ", memo = :memo"

    update_to_statement += """ 
    WHERE transfer_id = :transfer_id AND
    id IN (
        SELECT transaction_id FROM transaction_categories WHERE amount > 0
    ) RETURNING id;"""
    update_from_statement += """ 
    WHERE transfer_id = :transfer_id AND
    id IN (
        SELECT transaction_id FROM transaction_categories WHERE amount < 0
    ) RETURNING id;"""

    to_transaction_id = db_utils.execute(update_to_statement, update_vars)[0]["id"]
    from_transaction_id = db_utils.execute(update_from_statement, update_vars)[0]["id"]

    # update transfer amount
    if amount:
        db_utils.execute(UPDATE_TRANSFER_AMOUNT, {"transaction_id": to_transaction_id, "amount": abs(amount)})
        db_utils.execute(UPDATE_TRANSFER_AMOUNT, {"transaction_id": from_transaction_id, "amount": -abs(amount)})

    db_utils.execute(GET_TRANSFER, update_vars, commit=True)

    return transfer_id


def create_transfer(**kwargs):
    """Create a new transfer between accounts

    Args:
        from_account_id (str): account id money is leaving
        to_account_id (str): account id money is going to
        amount (int): amount being transferred in cents
        date (int): date of the transfer
        cleared (bool): if the transfer has been cleared yet
        memo (str, optional): memo. Defaults to None.

    Returns:
        string: unqiue transfer id
    """
    transfer_id = str(uuid.uuid4())
    transaction_a = str(uuid.uuid4())
    transaction_b = str(uuid.uuid4())

    db_utils.execute(
        CREATE_TRANSFER,
        {
            **kwargs,
            "id": transaction_a,
            "account_id": kwargs["from_account_id"],
            "payee_id": kwargs["to_account_id"],
            "transfer_id": transfer_id,
        },
    )
    db_utils.execute(
        CREATE_TRANSFER_CATEGORY,
        {
            "transaction_id": transaction_a,
            "amount": abs(kwargs["amount"]) * -1
        }
    )

    db_utils.execute(
        CREATE_TRANSFER,
        {
            **kwargs,
            "id": transaction_b,
            "account_id": kwargs["to_account_id"],
            "payee_id": kwargs["from_account_id"],
            "transfer_id": transfer_id,
        },
    )
    db_utils.execute(
        CREATE_TRANSFER_CATEGORY,
        {
            "transaction_id": transaction_b,
            "amount": abs(kwargs["amount"])
        }
    )
    db_utils.execute(GET_TRANSFER, {"transfer_id": transfer_id}, commit=True)

    return transfer_id


def get_transfer(transfer_id):
    """Get a transfer by id

    Args:
        transfer_id (string): a valid transfer id
    """
    transactions = db_utils.execute(GET_TRANSFER, {"transfer_id": transfer_id})
    return parse_transactions(transactions) 
