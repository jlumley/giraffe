from flask import Blueprint, current_app, request, make_response, g, jsonify

from ..utils import db_utils

reports = Blueprint("reports", __name__, url_prefix="/reports")


@reports.route("/category_groups", methods=("GET",))
def _spent_in_category_groups():
    """return amount spent from each category group between two dates"""
    stats = db_utils.execute("""
    SELECT SUM(amount) as amount, categories.category_group from transaction_categories
    INNER JOIN categories
    ON transaction_categories.category_id = categories.id
    WHERE category_type = 'budget'
    GROUP BY category_group;
    """)
    stats = [s for s in stats if s["category_group"]]
    return make_response(jsonify(stats), 200)


@reports.route("/category", methods=("GET",))
def _spent_in_categories():
    """return amount spent from each category between two dates"""
    stats = db_utils.execute("""
    SELECT SUM(amount) as amount, categories.name from transaction_categories
    INNER JOIN categories
    ON transaction_categories.category_id = categories.id
    WHERE category_type = 'budget'
    GROUP BY name;
    """)
    return make_response(jsonify(stats), 200)
