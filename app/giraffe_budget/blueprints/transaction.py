import time
import sqlite3

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils, time_utils, money_utils
from ..schemas.transaction_schema import *
from ..sql.transaction_statements import *

transaction = Blueprint("transaction", __name__, url_prefix="/transaction")


@transaction.route(
    "",
    methods=("GET",),
    defaults={
        "accounts": None,
        "categories": None,
        "payees": None,
        "before": None,
        "after": None,
        "cleared": None,
        "reconciled": None,
    },
)
def _get_transactions(accounts, categories, payees, before, after, cleared, reconciled):
    """Get all transactions"""
    accounts = request.args.get("accounts", accounts)
    categories = request.args.get("categories", categories)
    payees = request.args.get("payees", payees)
    before = request.args.get("before", before)
    after = request.args.get("after", after)
    cleared = request.args.get("cleared", cleared)
    reconciled = request.args.get("reconciled", reconciled)

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
        time_utils.datestr_to_timestamp(before),
        time_utils.datestr_to_timestamp(after),
        cleared,
        reconciled,
    )

    return make_response(jsonify(transactions), 200)


@transaction.route("/create", methods=("POST",))
@expects_json(POST_TRANSACTION_CREATE_SCHEMA)
def _create_transaction():
    """Create new transaction"""
    data = request.get_json()

    try:
        transaction_id = create_transaction(
            data.get("account_id"),
            data.get("amount"),
            time_utils.datestr_to_timestamp(data.get("date")),
            int(data.get("cleared")),
            payee_id=data.get("payee_id"),
            memo=data.get("memo"),
            categories=data.get("categories", []),
        )
    except Exception as e:
        return make_response(jsonify(e), 400)

    return make_response(jsonify({"id": transaction_id}), 201)


@transaction.route("/update/<transaction_id>", methods=("PUT",))
@expects_json(PUT_TRANSACTION_UPDATE_SCHEMA)
def update_transaction(transaction_id):
    """Update transaction"""
    data = request.get_json()
    update_statement = UPDATE_TRANSACTION
    update_vars = tuple()
    if "account_id" in data.keys():
        update_statement += ", account_id = ?"
        update_vars += (data["account_id"],)
    if "payee_id" in data.keys():
        update_statement += ", payee_id = ?"
        update_vars += (data["payee_id"],)
    if "date" in data.keys():
        update_statement += ", date = ?"
        update_vars += (time_utils.datestr_to_timestamp(data["date"]),)
    if "memo" in data.keys():
        update_statement += ", memo = ?"
        update_vars += (data["memo"],)
    if "amount" in data.keys():
        update_statement += ", amount = ?"
        update_vars += (data["amount"],)
    if "cleared" in data.keys():
        update_statement += ", cleared = ?"
        update_vars += (to_sqlite_bool(data["cleared"]),)

    update_statement += "WHERE id = ? RETURNING id;"
    update_vars += (transaction_id,)

    # update categories
    if "categories" in data.keys():
        db_utils.execute(
            DELETE_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}
        )
        for c in data["categories"]:
            db_utils.execute(
                POST_TRANSACTION_CATEGORIES,
                {
                    "transaction_id": transaction[0]["id"],
                    "category_id": c["category_id"],
                    "amount": c["amount"],
                },
            )

    transaction = db_utils.execute(
        GET_TRANSACTION, {"transaction_id": transaction_id}, commit=True
    )
    return make_response(jsonify(transaction[0]), 200)


@transaction.route("/delete/<transaction_id>", methods=("DELETE",))
def _delete_transaction(transaction_id):
    """Delete transaction"""
    _deleted_id = delete_transaction(transaction_id)
    return make_response(jsonify({"id": _deleted_id}), 200)


def delete_transaction(transaction_id):
    """Delete a Transaction

    Args:
        transaction_id (int): transaction id

    Returns:
        int: id of deleted transaction
    """
    db_utils.execute(DELETE_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id})
    transaction_id = db_utils.execute(
        DELETE_TRANSACTION, {"transaction_id": transaction_id}, commit=True
    )

    return transaction_id[0]["id"]


def create_transaction(
    account_id, amount, date, cleared, payee_id=None, memo=None, categories=[]
):
    """Create a new Transaction

    Args:
        account_id (int): account_id
        amount (int): total transaction amount in cents
        date (str): date of the transaction (YYY-MM-DD)
        cleared (int): whether or not the transaction has cleared
        payee_id (int, optional): payee_id. Defaults to None.
        memo (str, optional): transaction description/memos. Defaults to None.
        categories (list, optional): categories for split transactions. Defaults to [].

    Raises:
        RuntimeError: If unable to create transaction

    Returns:
        int: trnasaction id
    """
    transaction = db_utils.execute(
        CREATE_TRANSACTION,
        {
            "account_id": account_id,
            "amount": amount,
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
                "category_id": c["category_id"],
                "amount": c["amount"],
            },
        )
    transaction = db_utils.execute(
        GET_TRANSACTION, {"transaction_id": transaction[0]["id"]}, commit=True
    )

    return transaction[0]["id"]


def get_transactions(accounts, categories, payees, before, after, cleared, reconciled):
    """Query All transactions

    Args:
        accounts (list): list of account ids
        categories (list): [description]
        payees ([type]): [description]
        before ([type]): [description]
        after ([type]): [description]
        cleared ([type]): [description]
        reconciled ([type]): [description]

    Returns:
        [type]: [description]
    """

    query = GET_ALL_TRANSACTIONS
    query_vars = tuple()
    if accounts:
        query += f" AND account_id IN ({','.join('?' * len(accounts))})"
        query_vars += tuple(accounts)

    if categories:
        query += (
            f" AND transaction_id IN (SELECT transaction_id from"
            f" transaction_categories WHERE category_id IN"
            f" ({','.join('?' * len(categories))})"
        )
        query_vars += tuple(categories)

    if payees:
        query += f" AND payee_id IN ({','.join('?' * len(payees))})"
        query_vars += tuple(payees)

    if before:
        query += " AND date < ?"
        query_vars += (before,)

    if after:
        query += " AND date > ?"
        query_vars += (after,)

    if cleared is not None:
        query += " AND cleared = ?"
        query_vars += (to_sqlite_bool(cleared),)

    if reconciled is not None:
        query += " AND reconciled = ?"
        query_vars += (to_sqlite_bool(reconciled),)

    transaction_ids = db_utils.execute(query, query_vars)
    # fetching transaction data
    transactions = []
    for t in transaction_ids:
        transactions.append(get_transaction(t["id"]))

    return transactions


def get_transaction(transaction_id):
    """Get a transaction by transaction_id

    Args:
        transaction_id (int): transaction_id

    Returns:
        dict: transaction dict
    """

    transaction = db_utils.execute(GET_TRANSACTION, {"transaction_id": transaction_id})
    categories = db_utils.execute(
        GET_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}
    )
    transaction = transaction[0]
    transaction["categories"] = categories
    transaction["date"] = time_utils.timestamp_to_datestr(transaction["date"])
    return transaction


def to_sqlite_bool(value):
    """Convert string value to int boolean

    Args:
        value (str): string value to convert

    Returns:
        int: boolean value as an int
    """
    if value.lower() in ("t", "true", "yes", "y"):
        return 1
    else:
        return 0
