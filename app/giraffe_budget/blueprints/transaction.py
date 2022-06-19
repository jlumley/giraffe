import sqlite3
import time


from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json
from hashlib import md5

from . import category
from . import account
from . import payee
from ..utils import db_utils, time_utils, money_utils
from ..schemas.transaction_schema import *
from ..sql.transaction_statements import *

transaction = Blueprint("transaction", __name__, url_prefix="/transaction")


@transaction.route("/<int:transaction_id>", methods=("GET",))
def _get_transaction(transaction_id):
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
            time_utils.datestr_to_sqlite_date(data.get("date")),
            int(data.get("cleared")),
            payee_id=data.get("payee_id"),
            memo=data.get("memo"),
            categories=data.get("categories", []),
        )
    except (RuntimeError, TypeError, sqlite3.IntegrityError) as e:
        return make_response(jsonify(repr(e)), 400)

    return make_response(jsonify({"id": transaction_id}), 201)


@transaction.route("/update/<int:transaction_id>", methods=("PUT",))
@expects_json(PUT_TRANSACTION_UPDATE_SCHEMA)
def update_transaction(transaction_id):
    """Update transaction"""
    data = request.get_json()
    try:
        update_data = data | {
            "transaction_id": transaction_id,
            "date": time_utils.datestr_to_sqlite_date(data.get("date")),
        }
        transaction = update_transaction(**update_data)
    except (RuntimeError, TypeError, sqlite3.IntegrityError) as e:
        return make_response(jsonify(repr(e)), 400)

    return make_response(jsonify(transaction), 200)

# TODO: implement custom bool converter for cleared
@transaction.route("/update/cleared/<int:transaction_id>/<string:cleared>", methods=("PUT",))
def _update_transaction_cleared(transaction_id, cleared):
    """clear/unclear a transaction"""
    cleared = str2bool(cleared)
    try:
        transaction = update_transaction_cleared(transaction_id, cleared)
    except (RuntimeError) as e:
        return make_response(jsonify(repr(e)), 400)

    return make_response(jsonify(transaction), 200)


@transaction.route("/delete/<int:transaction_id>", methods=("DELETE",))
def _delete_transaction(transaction_id):
    """Delete transaction"""
    id = delete_transaction(transaction_id)
    return make_response(jsonify({"id": id}), 200)


def delete_transaction(transaction_id):
    """Delete a Transaction

    Args:
        transaction_id (int): transaction id

    Returns:
        int: id of deleted transaction
    """
    db_utils.execute(
        DELETE_TRANSACTION_ASSIGNMENTS, {"transaction_id": transaction_id}, commit=True
    )
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
    if "categories" in kwargs:
        # unfund credit cards
        unassign_credit_card_category(transaction_id)
        # create transaction categories
        create_transaction_categories(transaction_id, kwargs["categories"])
        # fund credit cards (if neccessary)
        payee_id = kwargs.get("payee_id", old_transaction.get("payee_id"))
        account_id = kwargs.get("account_id", old_transaction.get("account_id"))
        date = kwargs.get("date") if kwargs.get("date") else old_transaction.get("date")

        if is_credit_card_transaction(account_id) and payee_id:
            move_funds_to_credit_card_category(
                account_id,
                transaction_id,
                kwargs["categories"],
                date,
            )

    if "payee_id" in kwargs:
        update_statement += ", payee_id = :payee_id"

    if "account_id" in kwargs:
        update_statement += ", account_id = :account_id"

    if "date" in kwargs and kwargs.get("date"):
        update_statement += ", date = :date"

    if "memo" in kwargs:
        update_statement += ", memo = :memo"

    if "cleared" in kwargs:
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
        int: trnasaction id
    """
    is_valid_payee_id(payee_id)
    is_valid_account_id(account_id)

    transaction = db_utils.execute(
        CREATE_TRANSACTION,
        {
            "account_id": account_id,
            "date": date,
            "cleared": cleared,
            "payee_id": payee_id,
            "memo": memo,
        },
    )

    if is_credit_card_transaction(account_id) and categories:
        move_funds_to_credit_card_category(
            account_id, transaction[0]["id"], categories, date
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
    accounts_dict = account.get_accounts_dict()
    categories_dict = category.get_categories_dict()
    payees_dict = payee.get_payees_dict()
    for t in transaction_ids:
        transactions += get_transaction(t["id"], accounts_dict, payees_dict, categories_dict)

    return transactions


def get_transaction(transaction_id, accounts_map=None, payees_map=None, categories_map=None):
    """Get a transaction by transaction_id

    Args:
        transaction_id (int): transaction_id
        accounts (dict) : mapping for account ids to names
        payees (dict) : mapping for payees ids to names
        categories (dict) : mapping for category ids to names

    Returns:
        dict: transaction dict
    """
    if not accounts_map:
        accounts_map = account.get_accounts_dict()
    if not payees_map:
        payees_map = payee.get_payees_dict()
    if not categories_map:
        categories_map = category.get_categories_dict()

    transactions = db_utils.execute(GET_TRANSACTION, {"transaction_id": transaction_id})
    categories = db_utils.execute(
        GET_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}
    )
    transactions = db_utils.int_to_bool(transactions, ["cleared", "reconciled"])

    for c in categories:
        c["category_label"] = categories_map[str(c["category_id"])]
        del c["transaction_id"]
    for t in transactions:
        t["payee_label"] = generate_payee_label(t, accounts_map, payees_map)
        t["account_label"] = accounts_map[str(t["account_id"])]
        t["categories"] = categories
        t["date"] = time_utils.sqlite_date_to_datestr(t["date"])
        t["search_str"] = generate_search_str(t)
    return transactions


def is_credit_card_transaction(account_id):
    """Return True if the transaction was made with a Credit card account

    Args:
        account_id (int): account id that was used for the transaction

    Returns:
        bool: true if it is a credit card transaction
    """
    credit_card_transaction = db_utils.execute(
        IS_CREDIT_CARD_TRANSACTION, {"account_id": account_id}
    )
    return bool(credit_card_transaction)


def move_funds_to_credit_card_category(account_id, transaction_id, categories, date):
    """Move funds from transaction categories to credit card category

    Args:
        account_id (int): Credit Card account id
        transaction_id (int): Transaction id  associated with the assignments
        categories (list): transaction categories
    """
    # remove money from categories to fund credit card account
    for c in categories:
        category.assign_money_to_category(
            c["category_id"], c["amount"], date, transaction_id=transaction_id
        )

    amount = sum([c["amount"] for c in categories])
    # get the category id that corresponds to the credit card account
    account_name = account.get_account(account_id)[0].get("name")
    category_names = category.get_credit_card_category_names()
    category_id = [c["id"] for c in category_names if c["name"] == account_name][0]
    category.assign_money_to_category(
        category_id, amount * -1, date, transaction_id=transaction_id
    )


def unassign_credit_card_category(transaction_id):
    """Remove assignments to credit card for the given transaction

    Args:
        transaction_id (int): transaction id
    """
    db_utils.execute(DELETE_TRANSACTION_ASSIGNMENTS, {"transaction_id": transaction_id})


def create_transaction_categories(transaction_id, categories):
    """Create transaction categories

    Args:
        transaction_id (int): transaction id
        categories (list): list of categories and amounts
    """
    # remove old transaction categories
    db_utils.execute(
        DELETE_TRANSACTION_CATEGORIES, {"transaction_id": transaction_id}, commit=True
    )
    # create new tranasaction categories
    for c in categories:
        db_utils.execute(
            CREATE_TRANSACTION_CATEGORIES,
            {
                "transaction_id": transaction_id,
                "category_id": c["category_id"],
                "amount": c["amount"],
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


def generate_payee_label(transaction, accounts, payees):
    """generate appropriate payee label for transaction

    Args:
        transaction (dict): transaction data
        accounts (dict): account ids to names mapping
        payees (dict): payee ids to names mapping

    Returns:
        string: transaction payee label
    """
    if not transaction['payee_id']:
        return ""
    if (transaction["transfer_id"]):
        return f"Transfer to/from {accounts[str(transaction['payee_id'])]}"
    else:
        return f"{payees[str(transaction['payee_id'])]}"


def generate_search_str(transaction):
    """generate a search string for a transaction

    Args:
        transaction (dict): transaction data

    Returns:
        str: search string
    """

    search_str = ""
    search_str += transaction["account_label"]
    search_str += transaction["payee_label"]
    search_str += transaction["memo"] if transaction["memo"] else ""
    for c in transaction["categories"]:
        search_str += c["category_label"]


    return search_str.lower()


def str2bool(v):
  return v.lower() in ("yes", "true", "t", "1")