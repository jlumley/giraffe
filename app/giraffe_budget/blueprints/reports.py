from ..models.reports import *
from ..utils import db_utils, time_utils
from datetime import datetime
from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_pydantic import validate

reports = Blueprint("reports", __name__, url_prefix="/reports")

@reports.route(
    "/category_groups", 
    methods=("GET",)
)
@validate()
def _spent_in_category_groups(body: ReportsQueryParamsModel):
    """return amount spent from each category group between two dates"""
    
    query_params = dict(
        start_date=body.start_date,
        end_date=body.end_date
    )
    stats = db_utils.execute("""
    SELECT SUM(amount) as amount, categories.category_group from transaction_categories
    INNER JOIN categories
    ON transaction_categories.category_id = categories.id
    WHERE category_type = 'budget' AND transaction_id in (select id from transactions where
    date <= :end_date AND date >= :start_date)
    GROUP BY category_group;""",
    query_params) 
    stats = [s for s in stats if s["category_group"]]
    return make_response(jsonify(stats), 200)


@reports.route("/category", methods=("GET",))
def _spent_in_categories(body: ReportsQueryParamsModel):
    """return amount spent from each category between two dates"""
    query_params = dict(
        start_date=body.start_date,
        end_date=body.end_date
    )
    stats = db_utils.execute("""
    SELECT SUM(amount) as amount, categories.name from transaction_categories
    INNER JOIN categories
    ON transaction_categories.category_id = categories.id
    WHERE category_type = 'budget' AND transaction_id in (select id from transactions where
    date <= :end_date AND date >= :start_date)
    GROUP BY name;""",
    query_params)
    return make_response(jsonify(stats), 200)
