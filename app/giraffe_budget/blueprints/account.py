import datetime
import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils, money_utils, time_utils
from ..schemas.account_schema import *
from ..sql.account_statements import *

from ..dbms.rdb import db
from ..dbms.models import *

READY_TO_ASSIGN_CATEGORY = 1

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
    date_int = time_utils.datestr_to_sqlite_date(date)
    account = create_account(
        data.get("name"),
        date_int,
        notes=data.get("notes"),
        starting_balance=starting_balance,
        credit_card=data.get("credit_card"),
    )
    return make_response(jsonify(account[0]), 201)


@account.route("/hide/<int:account_id>", methods=("PUT",))
def _hide_account(account_id):
    """Hide an account"""
    hide_account(account_id, True)
    return make_response(jsonify(dict(id=account_id)), 200)


@account.route("/unhide/<int:account_id>", methods=("PUT",))
def _unhide_account(account_id):
    """Unhide an account"""
    hide_account(account_id, False)
    return make_response(jsonify(dict(id=account_id)), 200)


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
    account_ids = Account.query.all()
    accounts = []
    for a in account_ids:
        accounts += get_account(a.id)

    return accounts


def get_account(account_id):
    """fetch an account

    Args:
        account_id (int): account id

    Returns:
        dict: accounts dict
    """
    account = Account.query.filter(Account.id == account_id).one()
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
    account = Account(
        name=name,
        created_date=date,
        reconciled_date=date,
        notes=notes,
        credit_card=credit_card
    )
    db.add(account)
    # If credit card account create credit card category
    if credit_card:
        credit_card_category = Category(
            name=name,
            group="Credit Cards",
            credit_card=True
        )
        db.add(credit_card_category)

    # Creating starting balance transaction
    transaction = Transaction(
        account_id = account.id,
        amount=starting_balance,
        date=date,
        cleared=True,
        memo="Starting Balance"
    )
    if not credit_card:
        transaction_category = TransactionCategory(
            transaction_id=transaction.id,
            category_id = READY_TO_ASSIGN_CATEGORY,
            amount=starting_balance
        )

    db.commit()
    return get_account(account.id)


def hide_account(account_id, hide=True):
    """hide or unhide account

    Args:
        account_id (int): account id
        hide (bool, optional): hidden value. Defaults to True.

    Returns:
        dict: account dict
    """
    db.merge(Account(id=account_id, hidden=hide))
    db.commit()


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
    transactions = (Transaction.query
        .filter(Transaction.account_id == account_id)
        .filter(Transaction.cleared == cleared)
        )
    balance = sum([t.amount for t in transactions])
    return balance
