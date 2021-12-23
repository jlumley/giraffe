from flask import Blueprint, request, make_response
from flask_expects_json import expects_json

from .. import db
from ..schemas.account_schema import *
account = Blueprint('account', __name__, url_prefix='/account')

@account.route('')
def get_accounts():
    return "Lots of Accounts here!"

@account.route('/create', methods=('POST',))
@expects_json(POST_ACCOUNT_CREATE_SCHEMA)
def create_account():
    '''Create new account
    '''
    data = request.get_json()

    return make_response(data, 200)
