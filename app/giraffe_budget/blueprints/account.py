import datetime
import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from . import transaction
from . import category

from ..utils import db_utils, money_utils, time_utils
from ..schemas.account_schema import *
from ..sql.account_statements import *

account = Blueprint("account", __name__, url_prefix="/account")


@account.route("", methods=("GET",))
def _get_accounts():
    """Fetch all accounts"""
    accounts = get_accounts()
    return make_response(jsonify(accounts), 200)


@account.route("/<int:account_id>", methods=("GET",))
def _get_account(account_id):
    """Fetch single account"""
    account = get_account(account_id)
    return make_response(jsonify(account[0]), 200)


@account.route("/create", methods=("POST",))
@expects_json(POST_ACCOUNT_CREATE_SCHEMA)
def _create_account():
    """Create new account"""
    data = request.get_json()
    starting_balance = data.get("starting_balance", 0)
    date = datetime.datetime.now().strftime("%Y-%m-%d")
    date_str = time_utils.datestr_to_sqlite_date(date)
    account = create_account(
        data.get("name"),
        date_str,
        notes=data.get("notes"),
        starting_balance=starting_balance,
        credit_card=data.get("credit_card"),
    )
    return make_response(jsonify(account[0]), 201)


@account.route("/hide/<int:account_id>", methods=("PUT",))
def _hide_account(account_id):
    """Hide an account"""
    account = hide_account(account_id, True)
    return make_response(jsonify(account), 200)


@account.route("/unhide/<int:account_id>", methods=("PUT",))
def _unhide_account(account_id):
    """Unhide an account"""
    account = hide_account(account_id, False)
    return make_response(jsonify(account), 200)


@account.route("/reconcile/<int:account_id>", methods=("PUT",))
@expects_json(PUT_ACCOUNT_RECONCILE_SCHEMA)
def _reconcile_account(account_id):
    """Set all cleared transactions associated
    with this account as reconciled and set the
    reconciled_date to now
    """
    try:
        data = request.get_json()
        date = time_utils.datestr_to_sqlite_date(data.get("date"))
        balance = data.get("balance")
        if not balance:
            balance = 0

        account = reconcile_account(account_id, date, balance)

    except TypeError as e:
        return make_response(jsonify(dict(error=str(e))), 400)

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
        a["credit_card"] = True if a["account_type"] == "credit_card" else False
        a["cleared_balance"] = get_account_balance(a["id"])
        a["uncleared_balance"] = get_account_balance(a["id"], cleared=False)
        a["reconciled_date"] = time_utils.sqlite_date_to_datestr(a["reconciled_date"])
        a["created_date"] = time_utils.sqlite_date_to_datestr(a["created_date"])
        del a["account_type"]

    return accounts


def create_account(name, date, notes=None, starting_balance=0, credit_card=False):
    """create new account

    Args:
        name (str): account name
        date (int): creation date
        notes (str, optional): notes for account. Defaults to None.
        starting_balance (int, optional): starting blanace. Defaults to 0.
        credit_card (bool, optional): if account type is credit card. Defaults to False.

    Returns:
        dict: account dict
    """
    account_type = "credit_card" if credit_card else "budget"
    account = db_utils.execute(
        CREATE_ACCOUNT,
        {"name": name, "notes": notes, "date": date, "account_type": account_type},
        commit=True,
    )
    # If credit card account create credit card category
    if credit_card:
        category.create_category(
            name=name, group="Credit Cards", category_type="credit_card"
        )

    # if it is not a credit card add balance to "ready to assign"
    categories = [] if credit_card else [dict(category_id=1, amount=starting_balance)]
    # Creating starting balance transaction
    transaction.create_transaction(
        account[0]["id"],
        starting_balance,
        date,
        True,
        memo="Starting Balance",
        categories=categories,
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

    return get_account(account_id)[0]


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
            account_id, adjustment_amount, date, True, memo="Reconciliation Transaction"
        )

    # mark cleared transactions as reconciled
    db_utils.execute(RECONCILE_ACCOUNT_TRANSACTIONS, {"id": account_id})
    # mark account as reconciled
    db_utils.execute(RECONCILE_ACCOUNT, {"id": account_id, "now": date}, commit=True)

    return get_account(account_id)[0]


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
