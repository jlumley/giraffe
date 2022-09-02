from . import category
from . import transaction
from ..models.account import *
from ..schemas.account_schema import *
from ..sql.account_statements import *
from ..utils import db_utils, money_utils, time_utils
from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json
from flask_pydantic import validate
import datetime
import time
import uuid

account = Blueprint("account", __name__, url_prefix="/account")


@account.route("", methods=("GET",))
def _get_accounts():
    """Fetch all accounts"""
    accounts = get_accounts()
    return make_response(jsonify(accounts), 200)


@account.route("/<account_id>", methods=("GET",))
@validate()
def _get_account(account_id: str):
    """Fetch single account"""
    account = get_account(account_id)
    return make_response(jsonify(account[0]), 200)


@account.route("/create", methods=("POST",))
@validate()
def _create_account(body: CreateAccountModel):
    """Create new account"""
    name = body.name
    notes = body.notes
    credit_card = body.credit_card
    starting_balance = body.starting_balance

    date = datetime.datetime.now().strftime("%Y-%m-%d")
    date_str = time_utils.datestr_to_sqlite_date(date)

    account = create_account(
        name,
        date_str,
        notes=notes,
        starting_balance=starting_balance,
        credit_card=credit_card,
    )
    return make_response(jsonify(account[0]), 201)


@account.route("/hide/<account_id>", methods=("PUT",))
@validate()
def _hide_account(account_id: str):
    """Hide an account"""
    account = hide_account(account_id, True)
    return make_response(jsonify(account), 200)


@account.route("/unhide/<account_id>", methods=("PUT",))
@validate()
def _unhide_account(account_id: str):
    """Unhide an account"""
    account = hide_account(account_id, False)
    return make_response(jsonify(account), 200)


@account.route("/reconcile/<account_id>", methods=("PUT",))
@validate()
def _reconcile_account(account_id: str, body: ReconcileAccountModel):
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

def get_accounts_dict():
    """Create a mapping of all accounts to
       their ids

    Returns:
        dict: dict of all accounts
    """
    raw_accounts = db_utils.execute(
        "SELECT * FROM accounts;"
    )
    accounts = {}
    for a in raw_accounts:
        accounts[str(a["id"])] = a["name"]
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
        {
            "name": name,
            "notes": notes,
            "date": date,
            "account_type": account_type,
            "id": str(uuid.uuid4()),
        },
        commit=True,
    )

    # Creating starting balance transaction
    transaction.create_transaction(
        account[0]["id"],
        date,
        True,
        memo="Starting Balance",
        categories=[dict(category_id="ead604f7-d9bd-4f3e-852d-e04c2d7a71d7", amount=starting_balance)],
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
            account_id, 
            date, 
            True, 
            memo="Reconciliation Transaction", 
            categories=[
                {
                    "category_id": "7294d522-28e8-4f1d-a721-3d9f74f871a8",
                    "amount": adjustment_amount
                }
            ]
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
