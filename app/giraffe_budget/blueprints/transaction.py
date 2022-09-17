from . import account
from . import category
from . import payee
from ..models.transaction import *
from ..sql.transaction_statements import *
from ..utils import db_utils, time_utils, money_utils
from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json
from flask_pydantic import validate
from hashlib import md5
import sqlite3
import time
import uuid

transaction = Blueprint("transaction", __name__, url_prefix="/transaction")


@transaction.route("/<transaction_id>", methods=("GET",))
@validate()
def _get_transaction(transaction_id: str):
    """Get transaction by id"""

    transaction = get_transaction(transaction_id)
    if not transaction:
        return make_response(jsonify("Transaction Not Found"), 404)

    return make_response(jsonify(transaction[0]), 200)


@transaction.route(
    "",
    methods=("GET",),
    defaults={
        "accounts": None,
        "categories": None,
        "payees": None,
        "memo": None,
        "before": None,
        "after": None,
        "cleared": None,
        "reconciled": None,
        "limit": 1000,
        "offset": 0,
    },
)
def _get_transactions(
    accounts, categories, payees, memo, before, after, cleared, reconciled, limit, offset
):
    """Get all transactions"""
    accounts = request.args.get("accounts", accounts)
    categories = request.args.get("categories", categories)
    payees = request.args.get("payees", payees)
    memo = request.args.get("memo", memo)
    before = request.args.get("before", before)
    after = request.args.get("after", after)
    cleared = request.args.get("cleared", cleared)
    reconciled = request.args.get("reconciled", reconciled)
    limit = request.args.get("limit", limit)
    offset = request.args.get("offset", offset)

    if accounts:
        accounts = accounts.split(",")
    if categories:
        categories = categories.split(",")
    if payees:
        payees = payees.split(",")

    transactions = get_transactions(
        accounts,
        categories,
        payees,
        memo,
        time_utils.datestr_to_sqlite_date(before),
        time_utils.datestr_to_sqlite_date(after),
        cleared,
        reconciled,
        limit,
        offset
    )

    return make_response(jsonify(transactions), 200)


@transaction.route("/create", methods=("POST",))
@validate()
def _create_transaction(body: CreateTransactionModel):
    """Create new transaction"""
    try:
        transaction_id = create_transaction(
            body.account_id,
            body.date,
            int(body.cleared),
            payee_id=body.payee_id,
            memo=body.memo,
            categories=body.categories
        )
    except (RuntimeError, TypeError, sqlite3.IntegrityError) as e:
        return make_response(jsonify(repr(e)), 400)

    return make_response(jsonify({"id": transaction_id}), 201)


@transaction.route("/update/<transaction_id>", methods=("PUT",))
@validate()
def update_transaction(transaction_id: str, body: UpdateTransactionModel):
    """Update transaction"""
    try: 
        transaction = update_transaction(
            transaction_id=transaction_id,
            account_id=body.account_id,
            payee_id=body.payee_id,
            date=body.date,
            memo=body.memo,
            cleared=body.cleared,
            categories=body.categories
        )
    except (RuntimeError, TypeError, sqlite3.IntegrityError) as e:
        return make_response(jsonify(repr(e)), 400)

    return make_response(jsonify(transaction), 200)

# TODO: implement custom bool converter for cleared
@transaction.route("/update/cleared/<transaction_id>/<cleared>", methods=("PUT",))
@validate()
def _update_transaction_cleared(transaction_id: str, cleared: str):
    """clear/unclear a transaction"""
    cleared = str2bool(cleared)
    try:
        transaction = update_transaction_cleared(transaction_id, cleared)
    except (RuntimeError) as e:
        return make_response(jsonify(repr(e)), 400)

    return make_response(jsonify(transaction), 200)


@transaction.route("/delete/<transaction_id>", methods=("DELETE",))
@validate()
def _delete_transaction(transaction_id: str):
    """Delete transaction"""
    return make_response(jsonify({"id": delete_transaction(transaction_id)}), 200)


def delete_transaction(transaction_id):
    """Delete a Transaction

    Args:
        transaction_id (int): transaction id

    Returns:
        int: id of deleted transaction
    """
    db_utils.execute(
        DELETE_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}, commit=True
    )
    db_utils.execute(
        DELETE_TRANSACTION, {"transaction_id": transaction_id}, commit=True
    )

    return transaction_id


def update_transaction(**kwargs):
    """update a transaction

    Kwargs:
        transaction_id (int): transaction_id
        account_id (int, optional): new account id. Defaults to None.
        payee_id (int, optional): new payee id. Defaults to None.
        date (int, optional): new sql date (YYYMMDD). Defaults to None.
        memo (str, optional): new memo. Defaults to None.
        cleared (bool, optional): new cleared value. Defaults to None.
        categories (list, optional): new categories. Defaults to [].

    Returns:
        transaction id
    """
    transaction_id = kwargs["transaction_id"]

    ## input validation stuff
    old_transaction = get_transaction(transaction_id)
    if not old_transaction:
        raise RuntimeError(f"Invalid transaction id: {transaction_id}")
    else:
        old_transaction = old_transaction[0]
    is_valid_payee_id(kwargs.get("payee_id"))
    is_valid_account_id(kwargs.get("account_id"))

    if old_transaction.get("transfer_id"):
        raise RuntimeError("Unable to update transfer transaction")

    update_statement = "UPDATE transactions SET id = :transaction_id"

    # update categories
    if kwargs.get("categories"):
        # create transaction categories
        create_transaction_categories(transaction_id, kwargs["categories"])

    if kwargs.get("payee_id"):
        update_statement += ", payee_id = :payee_id"

    if kwargs.get("account_id"):
        update_statement += ", account_id = :account_id"

    if kwargs.get("date"):
        update_statement += ", date = :date"

    if kwargs.get("memo"):
        update_statement += ", memo = :memo"

    if kwargs.get("cleared"):
        update_statement += ", cleared = :cleared"

    update_statement += " WHERE id = :transaction_id RETURNING id;"
    transaction_id = db_utils.execute(update_statement, kwargs, commit=True)

    return transaction_id[0]


def update_transaction_cleared(transaction_id, cleared):
    """update a transaction

    Kwargs:
        transaction_id (int): transaction_id
        cleared (bool, optional): new cleared value. Defaults to None.

    Returns:
        transaction
    """
    ## input validation stuff
    old_transaction = get_transaction(transaction_id)
    if not old_transaction:
        raise RuntimeError(f"Invalid transaction id: {transaction_id}")
    else:
        old_transaction = old_transaction[0]

    update_statement = """
    UPDATE transactions 
    SET cleared = :cleared
    WHERE id = :transaction_id"""

    transaction_id = db_utils.execute(
        update_statement, 
        {
            "transaction_id": transaction_id,
            "cleared": cleared,
        }, 
        commit=True
    )

    return transaction_id




def create_transaction(
    account_id, date, cleared, payee_id=None, memo=None, categories=[]
):
    """Create a new Transaction

    Args:
        account_id (int): account_id
        date (str): date of the transaction (YYY-MM-DD)
        cleared (int): whether or not the transaction has cleared
        payee_id (int, optional): payee_id. Defaults to None.
        memo (str, optional): transaction description/memos. Defaults to None.
        categories (list, optional): categories for split transactions. Defaults to [].

    Raises:
        RuntimeError: If unable to create transaction

    Returns:
        int: transaction id
    """
    is_valid_payee_id(payee_id)
    is_valid_account_id(account_id)

    transaction = db_utils.execute(
        CREATE_TRANSACTION,
        {
            "id": str(uuid.uuid4()),
            "account_id": account_id,
            "date": date,
            "cleared": cleared,
            "payee_id": payee_id,
            "memo": memo,
        },
    )

    for c in categories:
        db_utils.execute(
            CREATE_TRANSACTION_CATEGORIES,
            {
                "transaction_id": transaction[0]["id"],
                "category_id": c.category_id,
                "amount": c.amount,
            },
        )

    transaction = db_utils.execute(
        GET_TRANSACTION, {"transaction_id": transaction[0]["id"]}, commit=True
    )

    return transaction[0]["id"]


def get_transactions(
    accounts, categories, payees, memo, before, after, cleared, reconciled, limit, offset
):
    """Query All transactions

    Args:
        accounts (list): list of account ids
        categories (list): list of category ids
        payees (list): list of payee ids
        memo (str): a search string for memos
        before (int): get transactions before date (YYYYMMDD)
        after (int): get transactions after date (YYYYMMDD)
        cleared (bool): get cleared transactions
        reconciled (bool): get reconciled transactions
        limit (int): limit number of transactions returned
        offset (int): offset the query results by n 

    Returns:
        list: list of transactions
    """

    query = GET_ALL_TRANSACTIONS
    query_vars = tuple()
    if accounts:
        query += f" AND account_id IN ({','.join('?' * len(accounts))})"
        query_vars += tuple(accounts)

    if categories:
        query += (
            f" AND id IN (SELECT transaction_id from"
            f" transaction_categories WHERE category_id IN"
            f" ({','.join('?' * len(categories))}))"
        )
        query_vars += tuple(categories)

    if payees:
        query += f" AND payee_id IN ({','.join('?' * len(payees))})"
        query_vars += tuple(payees)

    if memo:
        query += " AND memo LIKE ?"
        query_vars += (f"%{memo}%",)

    if before is not None:
        query += " AND date <= ?"
        query_vars += (before,)

    if after is not None:
        query += " AND date >= ?"
        query_vars += (after,)

    if cleared is not None:
        query += " AND cleared = ?"
        query_vars += (db_utils.to_sqlite_bool(cleared),)

    if reconciled is not None:
        query += " AND reconciled = ?"
        query_vars += (db_utils.to_sqlite_bool(reconciled),)

    query += " ORDER BY date DESC LIMIT ? OFFSET ?;"
    query_vars += (limit, offset,)
    transactions = db_utils.execute(query, query_vars)

    return parse_transactions(transactions)    

def get_transaction(transaction_id):
    """Get a transaction by transaction_id

    Args:
        transaction_id (int): transaction_id

    Returns:
        dict: transaction dict
    """

    transactions = db_utils.execute(GET_TRANSACTION, {"transaction_id": transaction_id})
    categories = db_utils.execute(
        GET_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}
    )
    transactions = db_utils.int_to_bool(transactions, ["cleared", "reconciled"])
    
    return parse_transactions(transactions)    

def create_transaction_categories(transaction_id, categories):
    """Create transaction categories

    Args:
        transaction_id (int): transaction id
        categories (list): list of categories and amounts
    """
    # remove old transaction categories
    db_utils.execute(
        DELETE_TRANSACTION_CATEGORIES, {
        "transaction_id": transaction_id}, commit=True
    )
    # create new tranasaction categories
    for c in categories:
        db_utils.execute(
            CREATE_TRANSACTION_CATEGORIES,
            {
                "transaction_id": transaction_id,
                "category_id": c.category_id,
                "amount": c.amount,
            },
            commit=True,
        )


def is_valid_account_id(account_id):
    """returns true if account id exists

    Args:
        account_id (int): account id to be tested
    """
    if not account_id:
        return None
    if db_utils.execute(
        "SELECT id FROM accounts WHERE id = :account_id;", dict(account_id=account_id)
    ):
        return True
    raise RuntimeError(f"Account id: {account_id} Not Found")


def is_valid_payee_id(payee_id):
    """returns true if payee id exists

    Args:
        payee_id (int): payee id to be tested
    """
    if not payee_id:
        return None
    if db_utils.execute(
        "SELECT id FROM payees WHERE id = :payee_id;", dict(payee_id=payee_id)
    ):
        return True

    raise RuntimeError(f"Payee id: {payee_id} Not Found")


def generate_transfer_payee_label(transaction):
    """generate payee label for transfer transaction

    Args:
        transaction (dict): transaction data

    Returns:
        string: transaction payee label
    """
    account = db_utils.execute("SELECT name FROM accounts WHERE id = :account",
            dict(account=transaction["payee_id"]))[0]["name"]
    return f"Transfer to/from {account}"


def generate_search_str(transaction):
    """generate a search string for a transaction

    Args:
        transaction (dict): transaction data

    Returns:
        str: search string
    """
    current_app.logger.info(transaction)
    search_str = ""
    search_str += transaction["account_label"]
    search_str += transaction["payee_label"] if transaction["payee_label"] else ""
    search_str += transaction["memo"] if transaction["memo"] else ""
    for c in transaction["categories"]:
        search_str += c["category_label"]


    return search_str.lower()


def str2bool(v):
  return v.lower() in ("yes", "true", "t", "1")


def parse_transactions(transactions):
    """
    parse a list of transactions
    """
    transactions = db_utils.int_to_bool(transactions, ["cleared", "reconciled"])
        
    for t in transactions:
        t["categories"] = db_utils.execute(
            GET_TRANSACTION_CATEGORIES, {"transaction_id": t["id"]}
        )
        if t["transfer_id"]:
            t["payee_label"] = generate_transfer_payee_label(t)
        t["date"] = time_utils.sqlite_date_to_datestr(t["date"])
        t["search_str"] = generate_search_str(t)

    return transactions
