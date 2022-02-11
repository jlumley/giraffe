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
    accounts = get_accounts()
    return make_response(jsonify(accounts), 200)


@account.route("/create", methods=("POST",))
@expects_json(POST_ACCOUNT_CREATE_SCHEMA)
def create_account():
    """Create new account"""
    data = request.get_json()
    starting_balance = data.get("starting_balance", 0)
    date = time_utils.datestr_to_sqlite_date(data.get("date"))
    account = create_account(
        data.get("name"),
        date,
        notes=data.get("notes"),
        starting_balance=starting_balance,
    )
    return make_response(jsonify(account), 201)


@account.route("/hide/<account_id>", methods=("PUT",))
def hide_account(account_id):
    """Hide an account"""
    assert account_id == request.view_args["account_id"]

    account = hide_account(account_id, True)

    return make_response(jsonify(account), 200)


@account.route("/unhide/<account_id>", methods=("PUT",))
def unhide_account(account_id):
    """Unhide an account"""
    assert account_id == request.view_args["account_id"]

    account = hide_account(account_id, False)

    return make_response(jsonify(account), 200)


@account.route("/reconcile/<account_id>", methods=("PUT",))
@expects_json(PUT_ACCOUNT_RECONCILE_SCHEMA)
def _reconcile_account(account_id):
    """Set all cleared transactions associated
    with this account as reconciled and set the
    reconciled_date to now
    """
    assert account_id == request.view_args["account_id"]
    data = request.get_json()
    date = time_utils.datestr_to_sqlite_date(data.get("date"))
    balance = data.get("balance")
    if not balance:
        balance = 0

    account = reconcile_account(account_id, date, balance)

    return make_response(jsonify(account), 200)


def get_accounts():
    """fetch all accounts

    Returns:
        list: list of all accounts
    """
    account_ids = db_utils.execute(GET_ALL_ACCOUNTS)
    accounts = []
    for a in account_ids:
        accounts += get_account(a["id"])

    return accounts


def get_account(account_id):
    """fetch an account

    Args:
        account_id (int): account id

    Returns:
        dict: accounts dict
    """
    accounts = db_utils.execute(GET_ACCOUNT, {"account_id": account_id})
    accounts = db_utils.int_to_bool(accounts, ["hidden"])
    for a in accounts:
        a["cleared_balance"] = get_account_balance(a["id"])
        a["uncleared_balance"] = get_account_balance(a["id"], cleared=False)

    return accounts


def create_account(name, date, notes=None, starting_balance=0):
    """create new account

    Args:
        name (str): account name
        date (int): creation date
        notes (str, optional): notes for account. Defaults to None.
        starting_balance (int, optional): starting blanace. Defaults to 0.

    Returns:
        dict: account dict
    """
    account = db_utils.execute(
        CREATE_ACCOUNT, {"name": name, "notes": notes, "date": date}, commit=True
    )
    # Creating starting balance transaction
    transaction.create_transaction(
        account[0]["id"], 
        starting_balance, 
        date, 
        True,
        memo="Starting Balance",
        categories=[{
            "category_id": 0,
            "amount": starting_balance
        }]
    )
    return get_account(account[0]["id"])


def hide_account(account_id, hide=True):
    """hide or unhide account

    Args:
        account_id (int): account id
        hide (bool, optional): hidden value. Defaults to True.

    Returns:
        dict: account dict
    """

    accounts = db_utils.execute(
        HIDE_ACCOUNT, {"id": account_id, "hide": int(hide)}, commit=True
    )
    accounts = db_utils.int_to_bool(accounts, ["hidden"])

    return get_account(account_id)


def reconcile_account(account_id, date, balance):
    """reconcile account, creating neccessary transactions

    Args:
        account_id (int): account id
        balance (int): current account balance
        date (int): date of reconciliation (YYYMMDD)

    Returns:
        dict: new reconciled account balance
    """

    current_balance = get_account_balance(account_id)
    adjustment_amount = balance - current_balance
    if adjustment_amount:
        # Add transaction to match balance
        transaction.create_transaction(
            account_id,
            adjustment_amount,
            date,
            True,
            memo="Reconciliation Transaction",
            categories=[{
                "category_id": 0,
                "amount": adjustment_amount
            }]
        )

    # mark cleared transactions as reconciled
    db_utils.execute(RECONCILE_ACCOUNT_TRANSACTIONS, {"id": account_id})
    # mark account as reconciled
    db_utils.execute(RECONCILE_ACCOUNT, {"id": account_id, "now": date}, commit=True)

    return get_account(account_id)


def get_account_balance(account_id, cleared=True):
    """Get the cleard/uncleared balance for an account

    Args:
        account_id (int): account id
        cleared (bool): get cleared or uncleared balance

    Returns:
        int: sum of all cleared transactions
    """

    account = db_utils.execute(
        GET_ACCOUNT_BALANCE, {"id": account_id, "cleared": int(cleared)}
    )
    balance = account[0].get("balance")
    if balance == None:
        balance = 0
    return balance
