from flask import Blueprint, current_app, request, make_response, g, jsonify

from ..utils import db_utils

health = Blueprint("health", __name__, url_prefix="/health")


@health.route("", methods=("GET",))
def _health_check():
    """Simple health check"""
    db_utils.execute("SELECT * FROM db_version;")
    return make_response(jsonify("Success"), 200)
