import uuid

from flask_pydantic import validate
from flask import Blueprint, current_app, request, make_response, g, jsonify

from ..models.payee import *
from ..sql.payee_statements import *
from ..utils import db_utils

payee = Blueprint("payee", __name__, url_prefix="/payee")


@payee.route("", methods=("GET",))
def _get_payees():
    """Get all payees"""
    return make_response(jsonify(get_payees()), 200)


@payee.route("/<payee_id>", methods=("GET",))
@validate()
def _get_payee(payee_id: str):
    """Get single payee by id"""
    payee = get_payee(payee_id)[0]
    return make_response(jsonify(payee), 200)


@payee.route("/create", methods=("POST",))
@validate()
def _create_payee(body: CreatePayeeModel):
    """Create new payee"""
    name = body.name
    payee = create_payee(name)
    return make_response(jsonify(payee), 201)


@payee.route("/update/<payee_id>", methods=("PUT",))
@validate()
def update_payee(payee_id: str, body: UpdatePayeeModel):
    """Update payee"""
    name = body.name
    payee = update_payee(payee_id, name=name)
    return make_response(jsonify(payee), 200)


@payee.route("/delete/<payee_id>", methods=("DELETE",))
@validate()
def delete_payee(payee_id: str):
    """Delete payee"""

    payee = delete_payee(payee_id)
    return make_response(jsonify(payee), 200)


def get_payees():
    """Get all Payees

    Returns:
        list: list of all payes
    """
    return db_utils.execute(GET_ALL_PAYEES)


def get_payee(payee_id):
    """Get a Payee by id

    Args:
        payee_id (str): payee id

    Returns:
        list: list of payees with id
    """
    return db_utils.execute(GET_PAYEE, {"payee_id": payee_id})

def get_payees_dict():
    """Create a mapping of all payees to
       their ids

    Returns:
        dict: dict of all payees
    """
    raw_payees = db_utils.execute(
        "SELECT * FROM payees;"
    )
    payees = {}
    for p in raw_payees:
        payees[str(p["id"])] = p["name"]
    return payees

def create_payee(name):
    """Create new payee

    Args:
        name (str): name for new payee

    Returns:
        list: new payee
    """
    payee = db_utils.execute(
                CREATE_PAYEE, 
                {
                    "name": name,
                    "id": str(uuid.uuid4())
                }, 
                commit=True
            )
    return payee[0]


def delete_payee(payee_id):
    """delete a payee

    Args:
        payee_id (int): payee id

    Returns:
        lsit: list of deleted payee ids
    """
    payee = db_utils.execute(DELETE_PAYEE, {"payee_id": payee_id}, commit=True)
    return payee[0]


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
