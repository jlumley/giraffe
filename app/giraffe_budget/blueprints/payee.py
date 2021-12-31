from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils
from ..schemas.payee_schema import *
from ..sql.payee_statements import *

payee = Blueprint("payee", __name__, url_prefix="/payee")


@payee.route("", methods=("GET",))
def get_payees():

    payees = db_utils.execute(GET_PAYEE_STATEMENT)
    return make_response(jsonify(payees), 200)


@payee.route("/create", methods=("POST",))
@expects_json(POST_PAYEE_CREATE_SCHEMA)
def create_payee():
    """Create new payee"""
    data = request.get_json()
    insert_data = {"name": data.get("name")}
    payee = db_utils.execute(POST_PAYEE_CREATE_STATEMENT, insert_data, commit=True)
    return make_response(jsonify(payee[0]), 201)


@payee.route("/update/<payee_id>", methods=("PUT",))
@expects_json(PUT_PAYEE_UPDATE_SCHEMA)
def update_payee(payee_id):
    """Update payee"""
    data = request.get_json()
    update_statement = PUT_PAYEE_UPDATE_STATEMENT
    update_vars = tuple()
    if "name" in data.keys():
        update_statement += ", name = ?"
        update_vars += (data["name"],)

    update_statement += "WHERE id = ? RETURNING id;"
    update_vars += (payee_id,)

    payee = db_utils.execute(update_statement, update_vars, commit=True)
    return make_response(jsonify(payee[0]), 200)


@payee.route("/delete/<payee_id>", methods=("DELETE",))
def delete_payee(payee_id):
    """Delete payee"""
    db_utils.execute(DELETE_PAYEE_STATEMENT, {"payee_id": payee_id}, commit=True)
    return make_response(jsonify("success"), 200)
