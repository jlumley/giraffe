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
        "limit": 1000,
    },
)
def _get_transactions(
    accounts, categories, payees, before, after, cleared, reconciled, limit
):
    """Get all transactions"""
    accounts = request.args.get("accounts", accounts)
    categories = request.args.get("categories", categories)
    payees = request.args.get("payees", payees)
    before = request.args.get("before", before)
    after = request.args.get("after", after)
    cleared = request.args.get("cleared", cleared)
    reconciled = request.args.get("reconciled", reconciled)
    limit = request.args.get("limit", limit)

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
        time_utils.datestr_to_sqlite_date(before),
        time_utils.datestr_to_sqlite_date(after),
        cleared,
        reconciled,
        limit,
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
            time_utils.datestr_to_sqlite_date(data.get("date")),
            int(data.get("cleared")),
            payee_id=data.get("payee_id"),
            memo=data.get("memo"),
            categories=data.get("categories", []),
        )
    except RuntimeError as e:
        return make_response(jsonify(str(e)), 400)

    return make_response(jsonify({"id": transaction_id}), 201)


@transaction.route("/update/<int:transaction_id>", methods=("PUT",))
@expects_json(PUT_TRANSACTION_UPDATE_SCHEMA)
def update_transaction(transaction_id):
    """Update transaction"""
    data = request.get_json()
    try:
        transaction = update_transaction(
            transaction_id,
            account_id=data.get("account_id"),
            payee_id=data.get("payee_id"),
            date=time_utils.datestr_to_sqlite_date(data.get("date")),
            memo=data.get("memo"),
            amount=data.get("amount"),
            cleared=data.get("cleared"),
            categories=data.get("categories"),
        )
    except Exception as e:
        return make_response(jsonify(e), 400)

    return make_response(jsonify(transaction), 200)


@transaction.route("/delete/<int:transaction_id>", methods=("DELETE",))
def _delete_transaction(transaction_id):
    """Delete transaction"""
    deleted_id = delete_transaction(transaction_id)
    return make_response(jsonify({"id": deleted_id}), 200)


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


def update_transaction(
    transaction_id,
    account_id=None,
    payee_id=None,
    date=None,
    memo=None,
    amount=None,
    cleared=None,
    categories=[],
):
    """update a transaction

    Args:
        transaction_id (int): transaction_id
        account_id (int, optional): new account id. Defaults to None.
        payee_id (int, optional): new payee id. Defaults to None.
        date (int, optional): new sql date (YYYMMDD). Defaults to None.
        memo (str, optional): new memo. Defaults to None.
        amount (int, optional): new amount. Defaults to None.
        cleared (bool, optional): new cleared value. Defaults to None.
        categories (list, optional): new categories. Defaults to [].

    Returns:
        dict: new transaction dict
    """

    update_statement = UPDATE_TRANSACTION
    update_vars = {
        "transaction_id": transaction_id,
        "account_id": account_id,
        "payee_id": payee_id,
        "date": date,
        "memo": memo,
        "amount": amount,
        "cleared": cleared,
        "categories": categories,
    }
    if account_id:
        update_statement += ", account_id = :account_id"
    if payee_id:
        update_statement += ", payee_id = :apyee_id"
    if date:
        update_statement += ", date = :date"
    if memo:
        update_statement += ", memo = :memo"
    if amount:
        update_statement += ", amount = :amount"
    if cleared:
        update_statement += ", cleared = :cleared"

    update_statement += "WHERE id = :transaction_id RETURNING id;"

    # update categories
    if categories:
        db_utils.execute(
            DELETE_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}
        )
        for c in categories:
            db_utils.execute(
                CREATE_TRANSACTION_CATEGORIES,
                {
                    "transaction_id": transaction_id,
                    "category_id": c["category_id"],
                    "amount": c["amount"],
                },
            )

    transaction = get_transaction(transaction_id)

    return transaction


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
    if len(categories) < 1:
        raise RuntimeError("Missing transaction categories")
    sum_cat_amount = 0
    for c in categories:
        sum_cat_amount += c['amount']
    if sum_cat_amount != amount:
        raise RuntimeError("Category amounts do not match transaction amount")
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


def get_transactions(
    accounts, categories, payees, before, after, cleared, reconciled, limit
):
    """Query All transactions

    Args:
        accounts (list): list of account ids
        categories (list): list of category ids
        payees (list): list of payee ids
        before (int): get transactions before date (YYYYMMDD)
        after (int): get transactions after date (YYYYMMDD)
        cleared (bool): get cleared transactions
        reconciled (bool): get reconciled transactions
        limit (int): limit number of transactions returned

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
            f" AND id IN (SELECT transaction_id from"
            f" transaction_categories WHERE category_id IN"
            f" ({','.join('?' * len(categories))}))"
        )
        query_vars += tuple(categories)

    if payees:
        query += f" AND payee_id IN ({','.join('?' * len(payees))})"
        query_vars += tuple(payees)

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

    query += " LIMIT ?;"
    query_vars += (limit,)
    transaction_ids = db_utils.execute(query, query_vars)
    # fetching transaction data
    transactions = []
    for t in transaction_ids:
        transactions += get_transaction(t["id"])

    return transactions


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
    for t in transactions:
        t["categories"] = categories
        t["date"] = time_utils.sqlite_date_to_datestr(t["date"])
    return transactions
