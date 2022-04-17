import sqlite3
import time


from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json
from hashlib import md5

from . import category
from . import account

from ..utils import db_utils, time_utils, money_utils
from ..schemas.transfer_schema import *
from ..sql.transfer_statements import *

transfer = Blueprint("transfer", __name__, url_prefix="/transfer")

@transfer.route("/<string:transfer_id>", methods=("GET",))
def _get_transfer(transfer_id):
    """Get a transfer"""
    try:
        transfer = get_transfer(transfer_id)
        if not transfer:
            return make_response(jsonify(f"Transfer id: {transfer_id} Not Found"), 404)
    
    except (RuntimeError, TypeError, ) as e:
        return make_response(jsonify(str(e)), 400)

    return make_response(jsonify(transfer), 200)


@transfer.route("/create", methods=("POST",))
@expects_json(POST_TRANSFER_CREATE_SCHEMA)
def _create_transfer():
    """Create new transfer"""
    data = request.get_json()

    try:
        transfer_data = {**data}
        transfer_data["data"] = time_utils.datestr_to_sqlite_date(data.get("date"))
        transfer_id = create_transfer(**transfer_data)
    except (RuntimeError, TypeError, sqlite3.IntegrityError) as e:
        return make_response(jsonify(str(e)), 400)

    return make_response(jsonify({"id": transfer_id}), 201)


@transfer.route("/update/<string:transfer_id>", methods=("PUT",))
@expects_json(PUT_TRANSFER_UPDATE_SCHEMA)
def _update_transfer(transfer_id):
    """Update transfer"""
    data = request.get_json()

    try:
        transfer_id = update_transfer(
            transfer_id,
            data.get("from_account_id"),
            data.get("to_account_id"),
            data.get("amount"),
            time_utils.datestr_to_sqlite_date(data.get("date")),
            memo=data.get("memo"),
        )
    except (RuntimeError, TypeError, ) as e:
        return make_response(jsonify(str(e)), 400)

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
        amount=abs(amount),
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

    if amount:
        update_from_statement += ", amount = :amount"
        update_to_statement += ", amount = :amount"

    if memo:
        update_from_statement += ", memo = :memo"
        update_to_statement += ", memo = :memo"

    update_to_statement += " WHERE transfer_id = :transfer_id AND amount >= 0;"
    update_from_statement += " WHERE transfer_id = :transfer_id AND amount <= 0;"

    db_utils.execute(update_to_statement, update_vars)
    update_vars["amount"] *= -1
    db_utils.execute(update_from_statement, update_vars)

    db_utils.execute(GET_TRANSFER, update_vars, commit=True)

    return transfer_id


def create_transfer(**kwargs):
    """Create a new transfer between accounts

    Args:
        from_account_id (int): account id money is leaving
        to_account_id (int): account id money is going to
        amount (int): amount being transferred in cents
        date (int): date of the transfer
        cleared (bool): if the transfer has been cleared yet
        memo (str, optional): memo. Defaults to None.

    Returns:
        string: unqiue transfer id
    """
    transfer_id = md5().hexdigest()

    db_utils.execute(
        CREATE_TRANSFER,
        {
            **kwargs,
            "account_id": kwargs["from_account_id"],
            "payee_id": kwargs["to_account_id"],
            "amount": abs(kwargs["amount"]) * -1,
            "transfer_id": transfer_id,
        },
    )

    db_utils.execute(
        CREATE_TRANSFER,
        {   
            **kwargs,
            "account_id": kwargs["to_account_id"],
            "payee_id": kwargs["from_account_id"],
            "amount": abs(kwargs["amount"]),
            "transfer_id": transfer_id,
        },
    )
    db_utils.execute(GET_TRANSFER, {"transfer_id": transfer_id}, commit=True)

    return transfer_id


def get_transfer(transfer_id):
    """Get a transfer by id

    Args:
        transfer_id (string): a valid transfer id
    """
    transactions = db_utils.execute(GET_TRANSFER, {"transfer_id": transfer_id})
    for t in transactions:
        t["date"] = time_utils.sqlite_date_to_datestr(t["date"])

    return transactions
    
