import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from . import transaction

from ..utils import db_utils, money_utils, time_utils
from ..schemas.account_schema import *
from ..sql.account_statements import *

account = Blueprint("account", __name__, url_prefix="/account")


@account.route("", methods=("GET",))
def get_accounts():
    """Fetch all accounts"""
    accounts = db_utils.execute(GET_ALL_ACCOUNTS)
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
    starting_balance = data.get("starting_balance", 0)
    date = time_utils.datestr_to_sqlite_date(data.get("date"))
    insert_data = {"name": data.get("name"), "notes": data.get("notes"), "now": date}
    account = db_utils.execute(POST_ACCOUNT_CREATE, insert_data, commit=True)
    # Creating starting balance transaction
    transaction.create_transaction(
        account[0]["id"], starting_balance, date, True, memo="Starting Balance"
    )
    return make_response(jsonify(account[0]), 201)


@account.route("/hide/<account_id>", methods=("GET",))
def hide_account(account_id):
    """Hide an account"""
    assert account_id == request.view_args["account_id"]

    accounts = db_utils.execute(PUT_ACCOUNT_HIDE, {"id": account_id}, commit=True)
    accounts = db_utils.int_to_bool(accounts, ["hidden"])

    return make_response(jsonify(accounts[0]), 200)


@account.route("/unhide/<account_id>", methods=("GET",))
def unhide_account(account_id):
    """Unhide an account"""
    assert account_id == request.view_args["account_id"]

    accounts = db_utils.execute(PUT_ACCOUNT_UNHIDE, {"id": account_id}, commit=True)
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
    date = time_utils.datestr_to_sqlite_date(data.get("date"))

    db_utils.execute(PUT_ACCOUNT_RECONCILE_TRANSACTIONS, {"id": account_id})
    db_utils.execute(
        PUT_ACCOUNT_RECONCILE, {"id": account_id, "now": date}, commit=True
    )

    if data["balance"] != current_balance:
        # Add transaction to match balance
        db_utils.execute(
            PUT_ACCOUNT_RECONCILE_AUTO_TRANSACTION,
            {"id": account_id, "balance": data["balance"], "now": date},
            commit=True,
        )

    return make_response(
        jsonify({"id": account_id, "balance": get_account_cleared_balance(account_id)}),
        200,
    )


def get_account_cleared_balance(account_id):
    """Get the cleared balance for an account"""

    account = db_utils.execute(GET_ACCOUNT_CLEARED_BALANCE, {"id": account_id})
    return account[0].get("balance")


def get_account_uncleared_balance(account_id):
    """Get the uncleared balance for an account"""

    account = db_utils.execute(GET_ACCOUNT_UNCLEARED_BALANCE, {"id": account_id})
    return account[0].get("balance")
