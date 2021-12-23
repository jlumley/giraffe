from flask import Blueprint, current_app 

from .. import db
account = Blueprint('account', __name__, url_prefix='/account')

@account.route('')
def get_accounts():
    return "Lots of Accounts here!"

@account.route('/create')
def create_account():
    return "new account!"
