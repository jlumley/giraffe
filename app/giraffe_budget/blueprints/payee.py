from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from ..utils import db_utils
from ..schemas.payee_schema import *
from ..sql.payee_statements import *

payee = Blueprint("payee", __name__, url_prefix="/payee")


@payee.route("", methods=("GET",))
def _get_payees():
    """Get all payees"""
    payees = get_payees()
    return make_response(jsonify(payees), 200)


@payee.route("/create", methods=("POST",))
@expects_json(POST_PAYEE_CREATE_SCHEMA)
def _create_payee():
    """Create new payee"""
    data = request.get_json()
    payee = create_payee(data.get("name"))
    return make_response(jsonify(payee), 201)


@payee.route("/update/<payee_id>", methods=("PUT",))
@expects_json(PUT_PAYEE_UPDATE_SCHEMA)
def update_payee(payee_id):
    """Update payee"""
    try:
        payee_id = int(payee_id)
    except ValueError:
        return make_response("payee id must be type int", 400)
    data = request.get_json()
    payee = update_payee(payee_id, name=data.get("name"))
    return make_response(jsonify(payee), 200)


@payee.route("/delete/<payee_id>", methods=("DELETE",))
def delete_payee(payee_id):
    """Delete payee"""

    try:
        payee_id = int(payee_id)
    except ValueError:
        return make_response("payee id must be type int", 400)
    payee = delete_payee(payee_id)
    return make_response(jsonify(payee), 200)


def get_payees():
    """Get all Payees

    Returns:
        list: list of all payes
    """
    payee_ids = db_utils.execute(GET_ALL_PAYEES)
    payees = []
    for p in payee_ids:
        payees += get_payee(p["id"])

    return payees


def get_payee(payee_id):
    """Get a Payee by id

    Args:
        payee_id (int): payee id

    Returns:
        list: list of payees with id
    """
    payee = db_utils.execute(GET_PAYEE, {"payee_id": payee_id})
    return payee


def create_payee(name):
    """Create new payee

    Args:
        name (str): name for new payee

    Returns:
        list: new payee
    """
    payee = db_utils.execute(CREATE_PAYEE, {"name": name}, commit=True)
    return payee


def delete_payee(payee_id):
    """delete a payee

    Args:
        payee_id (int): payee id

    Returns:
        lsit: list of deleted payee ids
    """
    payee = db_utils.execute(DELETE_PAYEE, {"payee_id": payee_id}, commit=True)
    return payee


def update_payee(payee_id, name=None):
    """update a payee

    Args:
        payee_id (int): payee id
        name (str, optional): new payee name. Defaults to None.

    Returns:
        list: new updated payee
    """
    query = UPDATE_PAYEE

    if name:
        query += ", name = :name"
    query += " WHERE id = :payee_id RETURNING *;"

    payee = db_utils.execute(query, {"payee_id": payee_id, "name": name}, commit=True)
    return payee
