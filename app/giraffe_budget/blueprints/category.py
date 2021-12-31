import time

from datetime import datetime
from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils, time_utils, money_utils
from ..schemas.category_schema import *
from ..sql.category_statements import *

category = Blueprint("category", __name__, url_prefix="/category")

ALLOWED_TARGET_TYPES = ["monthly_savings", "savings_target", "spending_target"]


@category.route("", methods=("GET",))
def get_categories():
    """Get all categories"""
    categories = db_utils.execute(GET_CATEGORY_STATEMENT)
    for c in categories:
        c["balance"] = get_category_balance(c["id"])
        monthly_target, assigned_this_month = get_category_target_requirement(c["id"])
        c["monthly_target"] = monthly_target
        c["assigned_this_month"] = assigned_this_month
        c["target_amount"] = money_utils.cents_to_money(c["target_amount"])
        c["target_date"] = time_utils.timestamp_to_datestr(c["target_date"])
    return make_response(jsonify(categories), 200)


@category.route("/create", methods=("POST",))
@expects_json(POST_CATEGORY_CREATE_SCHEMA)
def create_category():
    """Create new category"""
    data = request.get_json()
    insert_data = {
        "name": data.get("name"),
        "category_group": data.get("category_group"),
        "notes": data.get("notes"),
    }
    category = db_utils.execute(
        POST_CATEGORY_CREATE_STATEMENT, insert_data, commit=True
    )
    return make_response(jsonify(category[0]), 201)


@category.route("/update/<category_id>", methods=("PUT",))
@expects_json(PUT_CATEGORY_UPDATE_SCHEMA)
def update_cateogry(category_id):
    """Update Category"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    update_statement = PUT_CATEGORY_UPDATE_STATEMENT
    update_vars = tuple()
    if "name" in data.keys():
        update_statement += ", name = ?"
        update_vars += (data["name"],)
    if "category_group" in data.keys():
        update_statement += ", category_group = ?"
        update_vars += (data["category_group"],)
    if "notes" in data.keys():
        update_statement += ", notes = ?"
        update_vars += (data["notes"],)

    update_statement += "WHERE id = ? RETURNING id;"
    update_vars += (category_id,)

    category = db_utils.execute(update_statement, update_vars, commit=True)
    return make_response(jsonify(category[0]), 200)


@category.route("/update/<category_id>/target", methods=("PUT",))
@expects_json(PUT_CATEGORY_UPDATE_TARGET_SCHEMA)
def update_cateogry_target(category_id):
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

    update_statement = PUT_CATEGORY_UPDATE_TARGET_STATEMENT
    update_vars = {
        "target_amount": money_utils.money_to_cents(data["target_amount"]),
        "target_type": data["target_type"],
    }
    if "target_date" in data.keys() and data["target_type"] in ["savings_target"]:
        if not data["target_date"]:
            return make_response(jsonify("Missing target date"), 400)

        update_statement += ", target_date = :target_date "
        update_vars["target_date"] = time_utils.datestr_to_timestamp(
            data["target_date"]
        )

    update_statement += "WHERE id = :category_id RETURNING id;"
    update_vars["category_id"] = category_id

    category = db_utils.execute(update_statement, update_vars, commit=True)
    return make_response(jsonify(category[0]), 200)


@category.route("/delete/<category_id>/target", methods=("DELETE",))
def delete_cateogry_target(category_id):
    """Remove Category target"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()

    category = db_utils.execute(
        DELETE_CATEGORY_TARGET_STATEMENT, {"category_id": category_id}, commit=True
    )
    return make_response(jsonify(category[0]), 200)


def get_category_target_requirement(category_id, timestamp=time.time()):
    """Get target requirement for this month"""
    monthly_target = 0
    assigned_this_month = 0
    required_amounts = {"monthly_target": 0, "assigned_this_month": 0}
    target = db_utils.execute(
        GET_CATEGORY_TARGET_STATEMENT, {"category_id": category_id}
    )
    target = target[0]

    month_start = datetime.fromtimestamp(timestamp)
    month_start = month_start.replace(day=1, hour=0, minute=0, second=0)

    month_start_assignments = get_category_assignments_sum(
        category_id, timestamp=datetime.timestamp(month_start)
    )
    month_start_transactions = get_category_transactions_sum(
        category_id, timestamp=datetime.timestamp(month_start)
    )
    current_assignments = get_category_assignments_sum(category_id, timestamp=timestamp)
    current_transactions = get_category_transactions_sum(
        category_id, timestamp=timestamp
    )

    # current amount assigned this month
    assigned_this_month = current_assignments - month_start_assignments

    if target["target_type"] == "monthly_savings":
        monthly_target = target["target_amount"]

    elif target["target_type"] == "savings_target":
        target_date = datetime.fromtimestamp(target["target_date"])
        months_left = time_utils.diff_month(target_date, month_start) + 1
        monthly_target = int(
            (
                target["target_amount"]
                - get_category_balance(category_id, datetime.timestamp(month_start))
            )
            / months_left
        )

    elif target["target_type"] == "spending_target":
        pass
    else:
        pass
    return (monthly_target, assigned_this_month)


@category.route("/balance/<category_id>", methods=("GET",))
def _get_category_balance(category_id, timestamp=time.time()):
    """Get category balance at a given timestamp"""
    assert category_id == request.view_args["category_id"]

    balance = get_category_balance(category_id, timestamp)

    return make_response(jsonify({"category_id": category_id, "balance": balance}), 200)


def get_category_balance(category_id, timestamp=time.time()):
    """Get the Category balance at a given timestamp
    """

    total_assigned = get_category_assignments_sum(category_id, timestamp)
    total_transacted = get_category_transactions_sum(category_id, timestamp)

    return total_assigned + total_transacted


@category.route("/assign/<category_id>", methods=("PUT",))
@expects_json(PUT_CATEGORY_ASSIGN_SCHEMA)
def category_assign(category_id):
    """Assign money to category"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    date = time_utils.datestr_to_timestamp(data["date"])
    db_utils.execute(
        PUT_CATEGORY_ASSIGN_STATEMENT,
        {"category_id": category_id, "amount": abs(data["amount"]), "date": date},
        commit=True,
    )

    return make_response(jsonify({"balance": get_category_balance(category_id)}), 200)


@category.route("/unassign/<category_id>", methods=("PUT",))
@expects_json(PUT_CATEGORY_UNASSIGN_SCHEMA)
def category_unassign(category_id):
    """Unassign money from category"""
    assert category_id == request.view_args["category_id"]

    data = request.get_json()
    date = time_utils.datestr_to_timestamp(data["date"])
    db_utils.execute(
        PUT_CATEGORY_UNASSIGN_STATEMENT,
        {"category_id": category_id, "amount": -1 * abs(data["amount"]), "date": date},
        commit=True,
    )
    return make_response(jsonify({"balance": get_category_balance(category_id)}), 200)


def get_category_assignments_sum(category_id, timestamp=time.time()):
    """Get the sum of all category assignments at a given timestamp"""
    assigned_cents = db_utils.execute(
        GET_CATEGORY_ASSIGNMENTS, {"category_id": category_id, "now": timestamp}
    )
    assigned = 0
    if assigned_cents[0]["amount"]:
        assigned = assigned_cents[0]["amount"]

    return assigned


def get_category_transactions_sum(category_id, timestamp=time.time()):
    """Get the sum of all category transactions at a given timestamp"""
    transacted_cents = db_utils.execute(
        GET_CATEGORY_TRANSACTIONS, {"category_id": category_id, "now": timestamp}
    )
    transacted = 0
    if transacted_cents[0]["amount"]:
        transacted = transacted_cents[0]["amount"]

    return transacted


# @category.route('/delete/<category_id>', methods=('DELETE',))
# def delete_category(category_id):
#    '''Delete Category
#    '''
#    db_utils.execute(
#        DELETE_CATEGORY_STATEMENT,
#        {
#            'category_id': category_id
#        },
#        commit=True
#    )
#    return make_response(jsonify('success'), 200)
