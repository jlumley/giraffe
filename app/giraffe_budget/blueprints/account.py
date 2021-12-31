import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils, money_utils, request_utils
from ..schemas.account_schema import *
from ..sql.account_statements import *

account = Blueprint("account", __name__, url_prefix="/account")


@account.route("", methods=("GET",))
def get_accounts():
    """Fetch all accounts"""
    accounts = db_utils.execute(GET_ACCOUNT_STATEMENT)
    accounts = db_utils.int_to_bool(accounts, ["hidden", "credit_account"])
    for account in accounts:
        account["cleared_balance"] = get_account_cleared_balance(account["id"])
        account["uncleared_balance"] = get_account_uncleared_balance(account["id"])
    return make_response(jsonify(accounts), 200)


@account.route("/create", methods=("POST",))
@expects_json(POST_ACCOUNT_CREATE_SCHEMA)
def create_account():
    """Create new account"""
    data = request.get_json()
    insert_data = {
        "name": data.get("name"),
        "notes": data.get("notes"),
        "now": time.time(),
        "balance": data.get("starting_balance", 0.00),
    }
    account = db_utils.execute(POST_ACCOUNT_CREATE_STATEMENT, insert_data, commit=True)
    return make_response(jsonify(account[0]), 201)


@account.route("/hide/<account_id>", methods=("GET",))
def hide_account(account_id):
    """Hide an account"""
    assert account_id == request.view_args["account_id"]

    accounts = db_utils.execute(
        PUT_ACCOUNT_HIDE_STATEMENT, {"id": account_id}, commit=True
    )
    accounts = db_utils.int_to_bool(accounts, ["hidden"])

    return make_response(jsonify(accounts[0]), 200)


@account.route("/unhide/<account_id>", methods=("GET",))
def unhide_account(account_id):
    """Unhide an account"""
    assert account_id == request.view_args["account_id"]

    accounts = db_utils.execute(
        PUT_ACCOUNT_UNHIDE_STATEMENT, {"id": account_id}, commit=True
    )
    accounts = db_utils.int_to_bool(accounts, ["hidden"])

    return make_response(jsonify(accounts[0]), 200)


@account.route("/reconcile/<account_id>", methods=("PUT",))
@expects_json(PUT_ACCOUNT_RECONCILE_SCHEMA)
def reconcile_account(account_id):
    """Set all cleared transactions associated
    with this account as reconciled and set the
    reconciled_date to now
    """
    assert account_id == request.view_args["account_id"]
    data = request.get_json()
    current_balance = get_account_cleared_balance(account_id)

    db_utils.execute(PUT_ACCOUNT_RECONCILE_TRANSACTIONS_STATEMENT, {"id": account_id})
    db_utils.execute(
        PUT_ACCOUNT_RECONCILE_STATEMENT,
        {"id": account_id, "now": time.time()},
        commit=True,
    )

    if data["balance"] != current_balance:
        # Add transaction to match balance
        db_utils.execute(
            PUT_ACCOUNT_RECONCILE_AUTO_TRANSACTION_STATEMENT,
            {"id": account_id, "balance": data["balance"], "now": time.time()},
            commit=True,
        )

    return make_response(
        jsonify({"id": account_id, "balance": get_account_cleared_balance(account_id)}),
        200,
    )


def get_account_cleared_balance(account_id):
    """Get the cleared balance for an account"""

    account = db_utils.execute(GET_ACCOUNT_CLEARED_BALANCE, {"id": account_id})
    balance = account[0].get("balance")

    return money_utils.cents_to_money(balance)


def get_account_uncleared_balance(account_id):
    """Get the uncleared balance for an account"""

    account = db_utils.execute(GET_ACCOUNT_UNCLEARED_BALANCE, {"id": account_id})
    balance = account[0].get("balance")
    return money_utils.cents_to_money(balance)
