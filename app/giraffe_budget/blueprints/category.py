import re

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils, time_utils, money_utils
from ..schemas.category_schema import *
from ..sql.category_statements import *

category = Blueprint("category", __name__, url_prefix="/category")

ALLOWED_TARGET_TYPES = ["monthly_savings", "savings_target", "spending_target"]
MAX_INT = 2 ** 31 - 1


@category.route("/names", methods=("GET",))
def _get_category_names():
    """Get a mapping of category names to ids

    Returns:
        [type]: [description]
    """
    return make_response(jsonify(get_category_names()), 200)


@category.route("/<date>", methods=("GET",))
def _get_categories(date):
    """Get all categories"""
    assert date == request.view_args["date"]
    date = time_utils.datestr_to_sqlite_date(date)
    categories = get_categories(date)

    return make_response(jsonify(categories), 200)


@category.route("/<category_id>/<date>", methods=("GET",))
def _get_category(category_id, date):
    """Get category at a given date"""
    assert category_id == request.view_args["category_id"]
    assert date == request.view_args["date"]
    date = time_utils.datestr_to_sqlite_date(date)
    resp = get_category(category_id, date)

    return make_response(jsonify(resp), 200)


@category.route("/create", methods=("POST",))
@expects_json(POST_CATEGORY_CREATE_SCHEMA)
def _create_category():
    """Create new category"""
    data = request.get_json()
    resp = create_category(data.get("name"), data.get("group"), notes=data.get("notes"))

    return make_response(jsonify(resp), 201)


@category.route("/update/<category_id>", methods=("PUT",))
@expects_json(PUT_CATEGORY_UPDATE_SCHEMA)
def _update_category(category_id):
    """Update Category"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    category = update_category(
        category_id,
        name=data.get("name"),
        group=data.get("group"),
        notes=data.get("notes"),
    )
    return make_response(jsonify(category[0]), 200)


@category.route("/update/<category_id>/target", methods=("PUT",))
@expects_json(PUT_CATEGORY_UPDATE_TARGET_SCHEMA)
def _update_category_target(category_id):
    """Update Category target"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    if data["target_type"] not in ALLOWED_TARGET_TYPES:
        return make_response(
            jsonify(
                f"Target type not allow, must be one of"
                f"{','.join(ALLOWED_TARGET_TYPES)}"
            ),
            400,
        )
    if not data["target_amount"]:
        return make_response(jsonify("Missing target amount"), 400)

    if "target_date" in data.keys() and data["target_type"] in ["savings_target"]:
        if not data["target_date"]:
            return make_response(jsonify("Missing target date"), 400)

    target = update_category_target(
        category_id,
        data.get("target_type"),
        data.get("target_amount"),
        time_utils.datestr_to_sqlite_date(data.get("target_date")),
    )

    return make_response(jsonify(target), 200)


@category.route("/delete/<category_id>/target", methods=("DELETE",))
def delete_cateogry_target(category_id):
    """Remove Category target"""
    assert category_id == request.view_args["category_id"]

    delete_cateogry_target(category_id)

    return make_response(jsonify({"id": category_id}), 200)


@category.route("/assign/<category_id>", methods=("PUT",))
@expects_json(PUT_CATEGORY_ASSIGN_SCHEMA)
def _category_assign(category_id):
    """Assign money to category"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    date = time_utils.datestr_to_sqlite_date(data["date"])
    amount = abs(data["amount"])
    balance = assign_money_to_category(category_id, amount, date)

    return make_response(
        jsonify({"balance": balance, "date": data["date"], "category_id": category_id}),
        200,
    )


@category.route("/unassign/<category_id>", methods=("PUT",))
@expects_json(PUT_CATEGORY_UNASSIGN_SCHEMA)
def _category_unassign(category_id):
    """Unassign money from category"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    date = time_utils.datestr_to_sqlite_date(data["date"])
    amount = abs(data["amount"]) * -1
    balance = assign_money_to_category(category_id, amount, date)

    return make_response(
        jsonify({"balance": balance, "date": data["date"], "category_id": category_id}),
        200,
    )


def create_category(name, group, notes=None):
    """create new category

    Args:
        name (str): Category name
        group (str): Category group
        notes (str), optional): Category notes. Defaults to None.

    Returns:
        dict: created category
    """
    data = request.get_json()
    insert_data = {"name": name, "category_group": group, "notes": notes}
    category = db_utils.execute(CREATE_CATEGORY, insert_data, commit=True)
    return category[0]


def update_category(category_id, name=None, group=None, notes=None):
    """Update category

    Args:
        category_id (int): category_id
        name (str, optional): Category name. Defaults to None.
        group (str, optional): Category group. Defaults to None.
        notes (str, optional): Category notes. Defaults to None.

    Returns:
        dict: updated category dict
    """

    update_statement = UPDATE_CATEGORY
    update_vars = {
        "name": name,
        "category_group": group,
        "notes": notes,
        "category_id": category_id,
    }
    if name:
        update_statement += ", name = :name"
    if group:
        update_statement += ", category_group = :category_group"
    if notes:
        update_statement += ", notes = :notes"

    update_statement += " WHERE id = :category_id RETURNING *;"

    category = db_utils.execute(update_statement, update_vars, commit=True)

    return category


def update_category_target(category_id, target_type, amount, date=None):
    """Update target for category

    Args:
        category_id (int): category id
        target_type (str): target type
        amount (int): target amount
        date (int), optional): target date (YYYMMDD). Defaults to None.

    Returns:
        dict: updated category dict
    """

    update_statement = UPDATE_CATEGORY_TARGET
    update_vars = {
        "target_amount": amount,
        "target_type": target_type,
        "category_id": category_id,
        "target_date": date,
    }
    if date and target_type in ["savings_target"]:
        update_statement += ", target_date = :target_date "

    update_statement += "WHERE id = :category_id RETURNING *;"
    category = db_utils.execute(update_statement, update_vars, commit=True)

    return category[0]


def delete_cateogry_target(category_id):
    """Delete category target

    Args:
        category_id (int): category id
    """
    db_utils.execute(DELETE_CATEGORY_TARGET, {"category_id": category_id}, commit=True)
    return


def get_category_target_data(category_id, sql_date):
    """Get target data for category at a given date

    Args:
        category_id (int): category id
        sql_date (int): sql date YYYMMDD

    Returns:
        dict: target_data
    """
    target_data = {"monthly_target": 0, "assigned_this_month": 0}
    target = db_utils.execute(GET_CATEGORY_TARGET, {"category_id": category_id})
    target = target[0]
    month_start = time_utils.get_month_start(sql_date)

    target_data["assigned_this_month"] = get_category_assignments_sum(
        category_id, after=month_start, before=sql_date
    )

    # Monthly Savings
    if target["target_type"] == "monthly_savings":
        target_data["monthly_target"] = target["target_amount"]

    # Savings Target
    elif target["target_type"] == "savings_target":
        months_left = time_utils.diff_month(target["target_date"], month_start)
        target_data["monthly_target"] = int(
            (target["target_amount"] - get_category_balance(category_id, month_start))
            / months_left
        )

    # Spending Target
    elif target["target_type"] == "spending_target":
        pass

    return target_data


def get_category_balance(category_id, sql_date):
    """Get category balance at a give date

    Args:
        category_id (int): category id
        sql_date (int): sql date YYYMMDD

    Returns:
        int: category balance at given date
    """

    total_assigned = get_category_assignments_sum(category_id, before=sql_date)
    total_transacted = get_category_transactions_sum(category_id, before=sql_date)

    return total_assigned + total_transacted


def assign_money_to_category(category_id, amount, date):
    """Assign money to category

    Args:
        category_id (int): category id
        amount (int): amount to assign (negative to unassign)
        date (int): assignment date

    Returns:
        int : category balance after money is assigned
    """
    db_utils.execute(
        ASSIGN_CATEGORY,
        {"category_id": category_id, "amount": amount, "date": date},
        commit=True,
    )

    return get_category_balance(category_id, date)


def get_category_assignments_sum(category_id, before=MAX_INT, after=0):
    """Get the sum of all category assignmtnts between two dates

    Args:
        category_id (int): category id
        before (int, optional): fetch assignments before date. Defaults to MAX_INT.
        after (int, optional): fetch assignments before date. Defaults to 0.

    Returns:
        int: sum of assignments
    """
    assigned_cents = db_utils.execute(
        GET_CATEGORY_ASSIGNMENTS,
        {"category_id": category_id, "before": before, "after": after},
    )
    assigned = 0
    if assigned_cents[0]["amount"]:
        assigned = assigned_cents[0]["amount"]

    return assigned


def get_category_transactions_sum(category_id, before=MAX_INT, after=0):
    """Get the sum of all category transactions between two dates

    Args:
        category_id (int): category id
        before (int, optional): fetch transactions before date. Defaults to MAX_INT.
        after (int, optional): fetch transactions after date. Defaults to 0.

    Returns:
        int: sum of transactions
    """

    transacted_cents = db_utils.execute(
        GET_CATEGORY_TRANSACTIONS,
        {"category_id": category_id, "before": before, "after": after},
    )
    transacted = 0
    if transacted_cents[0]["amount"]:
        transacted = transacted_cents[0]["amount"]

    return transacted


def get_categories(date):
    """get all categories

    Args:
        date (int): sql date (YYYMMDD)

    Returns:
        list: list of all categories
    """

    category_ids = db_utils.execute(GET_ALL_CATEGORIES)
    categories = []
    for c in category_ids:
        categories += get_category(c["id"], date)

    return categories


def get_category(category_id, sql_date):
    """Fetch a category by id

    Args:
        category_id (int): category id
        sql_date (int): sql date YYYMMDD

    Returns:
        dict: category dict
    """
    categories = db_utils.execute(GET_CATEGORY, {"category_id": category_id})

    for c in categories:
        target_data = get_category_target_data(category_id, sql_date)
        c["balance"] = get_category_balance(category_id, sql_date)
        c["target_date"] = time_utils.sqlite_date_to_datestr(c["target_date"])
        c["monthly_target"] = target_data["monthly_target"]
        c["assigned_this_month"] = target_data["assigned_this_month"]

    return categories


def get_category_names():
    """ Fetch all the category names and ids
    """
    return db_utils.execute(GET_CATEGORY_NAMES)
