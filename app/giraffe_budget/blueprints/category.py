import re
from ..errors import ValidationError
from ..models.category import *
from ..sql.category_statements import *
from ..utils import db_utils, time_utils, money_utils
from datetime import datetime
from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json
from flask_pydantic import validate
import uuid

category = Blueprint("category", __name__, url_prefix="/category")

MONTHLY_SAVINGS = "monthly_savings"
SAVINGS_TARGET = "savings_target"
MAX_INT = 2 ** 31 - 1


@category.route("/groups", methods=("GET",))
def _get_category_groups():
    """Get all the category groups"""
    category_groups = get_category_groups()
    category_groups = [c["category_group"] for c in category_groups]
    return make_response(jsonify(category_groups), 200)


@category.route("/names", methods=("GET",))
def _get_category_names():
    """Get a mapping of category names to ids"""
    return make_response(jsonify(get_category_names()), 200)


@category.route("/target/types", methods=("GET",))
def _get_category_target_types():
    """Get a mapping of category names to ids"""
    return make_response(jsonify(get_target_types()), 200)


@category.route("/<date>", methods=("GET",))
@validate()
def _get_categories(date: str, query: GetCategoriesQueryParamsModel):
    """Get all categories"""
    date = time_utils.datestr_to_sqlite_date(date)
    group = query.group
    categories = get_categories(date, group=group)

    return make_response(jsonify(categories), 200)


@category.route("/<category_id>/<date>", methods=("GET",))
@validate()
def _get_category(category_id: str, date: str):
    """Get category at a given date"""
    date = time_utils.datestr_to_sqlite_date(date)
    category = get_category(category_id, date)
    if not category:
        return make_response(jsonify("Category Not Found"), 404)

    return make_response(jsonify(category[0]), 200)


@category.route("/create", methods=("POST",))
@validate()
def _create_category(body: CreateCategoryModel):
    """Create new category"""
    name = body.name
    group = body.group
    notes = body.notes
    category_type = body.category_type
    category = create_category(name, group, notes, category_type)

    return make_response(jsonify(category[0]), 201)


@category.route("/delete/<category_id>/<replacement_category>", methods=("DELETE",))
@validate()
def _delete_category(category_id: str, replacement_category: str):
    """Delete Category"""
    try:
        delete_category(
            category_id,
            replacement_category
        )
    except ValidationError as e:
        return make_response(jsonify(str(e)), 404)
    return make_response(jsonify("success"), 200)


@category.route("/update/<category_id>", methods=("PUT",))
@validate()
def _update_category(category_id: str, body: UpdateCategoryModel):
    """Update Category"""
    name = body.name
    group = body.group
    notes = body.notes
    category = update_category(
        category_id,
        name=name,
        group=group,
        notes=notes
    )
    return make_response(jsonify(category[0]), 200)


@category.route("/target/monthly_savings/<category_id>", methods=("PUT",))
@validate()
def _update_category_monthly_savings_target(category_id: str, body: UpdateCategoryMonthlySavingsTargetModel):
    """Update Category target"""
    target_amount = body.target_amount

    target = update_category_target(
        category_id,
        MONTHLY_SAVINGS,
        target_amount,
        None
    )

    return make_response(jsonify(target), 200)


@category.route("/target/savings_target/<category_id>", methods=("PUT",))
@validate()
def _update_category_savings_target_target(category_id: str, body: UpdateCategorySavingsTargetModel):
    """Update Category target"""
    target_amount = body.target_amount
    target_date = body.target_date

    target = update_category_target(
        category_id,
        SAVINGS_TARGET,
        target_amount,
        target_date
    )

    return make_response(jsonify(target), 200)


@category.route("/target/<category_id>", methods=("DELETE",))
@validate()
def delete_cateogry_target(category_id: str):
    """Remove Category target"""
    delete_cateogry_target(category_id)

    return make_response("success", 200)


@category.route("/assign/<category_id>", methods=("PUT",))
@validate()
def _category_assign(category_id: str, body: CategoryAssignMoneyModel):
    """Assign money to category"""
    amount = body.amount
    date = body.date
    balance = assign_money_to_category(category_id, amount, date)

    return make_response("success", 200)


@category.route("/unassign/<string:category_id>", methods=("PUT",))
@validate()
def _category_unassign(category_id: str, body: CategoryAssignMoneyModel):
    """ unassign money from category"""
    amount = body.amount * -1
    date = body.date
    balance = assign_money_to_category(category_id, amount, date)

    return make_response("success", 200)


def create_category(name, group, category_type, notes=None):
    """create new category

    Args:
        name (str): Category name
        group (str): Category group
        category_type (str): Category Type
        notes (str, optional): Category notes. Defaults to None.

    Returns:
        dict: created category
    """
    data = request.get_json()
    category_id = str(uuid.uuid4())
    insert_data = {
        "id": category_id,
        "name": name,
        "category_group": group,
        "notes": notes,
        "category_type": category_type,
    }
    db_utils.execute(CREATE_CATEGORY, insert_data, commit=True)
    return get_category(category_id, datetime.today().strftime('%Y%m%d'))


def update_category(category_id, name=None, group=None, notes=None):
    """Update category

    Args:
        category_id (str): category_id
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
        category_id (str): category id
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
        category_id (str): category id
    """
    db_utils.execute(DELETE_CATEGORY_TARGET, {"category_id": category_id}, commit=True)


def get_category_target_data(category, sql_date):
    """Get target data for category at a given date

    Args:
        category (dict): category
        sql_date (int): sql date YYYMMDD

    Returns:
        dict: target_data
    """
    target_type = category.get("target_type")

    if target_type == MONTHLY_SAVINGS:
        return get_monthly_savings_target(category, sql_date)

    elif target_type == SAVINGS_TARGET:
        return get_savings_target(category, sql_date)

    # if no target is set
    else:
        return dict(underfunded=0)


def get_monthly_savings_target(category, sql_date):
    """Get target data for monthly savings target

    Args:
        category (dict): category
        sql_date (int): in representing date (YYYMMDD)

    Returns:
        dict: target_data
    """
    monthly_target = category.get("target_amount")
    underfunded = max(monthly_target - category.get("assigned_this_month"), 0)

    return dict(
        monthly_target=monthly_target,
        underfunded=underfunded,
    )


def get_savings_target(category, sql_date):
    """Get target data for a savings target

    Args:
        category (dict): category
        sql_date (int): in representing date (YYYMMDD)

    Returns:
        dict: target_data
    """
    months_left = time_utils.diff_month(category.get("target_date"), sql_date)
    target_amount = category.get("target_amount")
    assigned_this_month = category.get("assigned_this_month")
    balance = category.get("balance")
    monthly_target = int((target_amount - balance + assigned_this_month) / months_left)
    underfunded = max(monthly_target - assigned_this_month, 0)

    return dict(
        monthly_target=monthly_target,
        underfunded=underfunded,
    )


def get_category_balance(category_id, sql_date):
    """Get category balance at a give date

    Args:
        category_id (str): category id
        sql_date (int): sql date YYYMMDD

    Returns:
        int: category balance at given date
    """
    total_assigned = get_category_assignments_sum(
        category_id, before=sql_date
    )
    total_transacted = get_category_transactions_sum(category_id, before=sql_date)
    return total_assigned + total_transacted


def assign_money_to_category(category_id, amount, date):
    """Assign money to category

    Args:
        category_id (str): category id
        amount (int): amount to assign (negative to unassign)
        date (int): assignment date

    Returns:
        int : category balance after money is assigned
    """
    # remove money from ready to assign
    db_utils.execute(
        ASSIGN_CATEGORY,
        {
            "category_id": "ead604f7-d9bd-4f3e-852d-e04c2d7a71d7",
            "amount": amount * -1,
            "date": date
        },
        commit=True,
    )
    db_utils.execute(
        ASSIGN_CATEGORY,
        {
            "category_id": category_id,
            "amount": amount,
            "date": date
        },
        commit=True,
    )

    return get_category_balance(category_id, date)


def get_category_assignments_sum(
    category_id, before=MAX_INT, after=0
):
    """Get the sum of all category assignmtnts between two dates

    Args:
        category_id (str): category id
        before (int, optional): fetch assignments before date. Defaults to MAX_INT.
        after (int, optional): fetch assignments before date. Defaults to 0.

    Returns:
        int: sum of assignments
    """
    statement = GET_CATEGORY_ASSIGNMENTS
    assigned_cents = db_utils.execute(
        statement, {"category_id": category_id, "before": before, "after": after}
    )
    amount = assigned_cents[0]["amount"]
    return amount if amount else 0


def get_category_transactions_sum(category_id, before=MAX_INT, after=0):
    """Get the sum of all category transactions between two dates

    Args:
        category_id (str): category id
        before (int, optional): fetch transactions before date. Defaults to MAX_INT.
        after (int, optional): fetch transactions after date. Defaults to 0.

    Returns:
        int: sum of transactions
    """

    transacted_cents = db_utils.execute(
        GET_CATEGORY_TRANSACTIONS,
        {"category_id": category_id, "before": before, "after": after},
    )
    amount = transacted_cents[0]["amount"]
    return amount if amount else 0


def get_categories(sql_date, group):
    """get all categories

    Args:
        date   (int): sql date (YYYMMDD)
        groups (str): filter categories by group

    Returns:
        list: list of all categories
    """
    select = GET_ALL_CATEGORIES
    select_values = {}

    if group:
        select += " AND category_group = :group"
        select_values["group"] = group
    
    categories = db_utils.execute(select, select_values)

    return parse_categories(categories, sql_date)


def get_category(category_id, sql_date):
    """Fetch a category by id

    Args:
        category_id (str): category id
        sql_date (int): sql date YYYMMDD

    Returns:
        dict: category dict
    """
    categories = db_utils.execute(GET_CATEGORY, {"category_id": category_id})
    return parse_categories(categories, sql_date)


def delete_category(category_id, replacement_category):
    """
    Delete a category by id

    Args:
        category_id (str): category id to be deleted
        replacement_category (str): move all old transactions and assignments to this category
        
    Returns:
        none
    """
    update_vars = dict(
        category_id=category_id,
        replacement_category=replacement_category
    )
    category_id = db_utils.execute(GET_CATEGORY, {"category_id": category_id})
    if not category_id:
        raise ValidationError("Category ID Not Found")
    
    category_id = db_utils.execute(GET_CATEGORY, {"category_id": replacement_category})
    if not category_id:
        raise ValidationError("Replacement Category ID Not Found")
    
    db_utils.execute(REPLACE_CATEGORY_IN_ASSIGNMENTS, update_vars, commit=True)
    db_utils.execute(REPLACE_CATEGORY_IN_TRANSACTIONS, update_vars, commit=True)
    db_utils.execute(DELETE_CATEGORY, update_vars, commit=True)

def get_category_names():
    """Fetch all the category names and ids"""
    return db_utils.execute(GET_CATEGORY_NAMES)

def get_categories_dict():
    """Create a mapping of all categories to
       their ids
    """
    raw_categories = db_utils.execute(
        "SELECT * FROM categories;"
    )
    categories = {}
    for c in raw_categories:
        categories[str(c["id"])] = c["name"]
    return categories

def get_category_groups():
    """Fetch all the category groups"""
    return db_utils.execute(GET_CATEGORY_GROUPS)


def get_target_types():
    """return dict of all category target types """
    return dict(
        monthly_savings="Monthly Savings",
        savings_target="Savings Target"
    )


def parse_categories(categories, date):
    """
    parse categories
    """
    start_date = time_utils.get_first_of_the_month(date)
    end_date = date
    
    parsed_categories=[]
    for c in categories:
        category_id = c["id"]
        c["balance"] = get_category_balance(category_id, date)
        c["group"] = c["category_group"]
        del c["category_group"]
        c["assigned_this_month"] = get_category_assignments_sum(
                category_id,
                after=start_date,
                before=end_date,
            )
        c["spent_this_month"] = get_category_transactions_sum(
                category_id,
                after=start_date,
                before=end_date,
            )
        c = c | get_category_target_data(c, date)
        parsed_categories.append(c)
        c["target_date"] = time_utils.sqlite_date_to_datestr(c["target_date"])

    return parsed_categories

