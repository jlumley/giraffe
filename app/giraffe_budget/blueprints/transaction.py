import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from .. import db_utils
from ..schemas.transaction_schema import *
from ..sql.transaction_statements import *

transaction = Blueprint('transaction', __name__, url_prefix='/transaction')

@transaction.route('', methods=('GET',))
def get_transactions():
    '''Get all transactions
    '''
    transactions = db_utils.execute_statement(
        GET_TRANSACTION_STATEMENT
    )
    return make_response(jsonify(transactions), 200)

@transaction.route('/create', methods=('POST',))
@expects_json(POST_TRANSACTION_CREATE_SCHEMA)
def create_account():
    '''Create new transaction 
    '''
    data = request.get_json()
    insert_data = {
        'account_id': data.get('account_id'),
        'category_id': data.get('category_id'),
        'payee_id': data.get('payee_id'),
        'date': data.get('date'),
        'memo': data.get('memo'),
        'cleared': int(data.get('cleared')),
        'amount': data.get('amount')
    }
    transaction = db_utils.execute_statement(
        POST_TRANSACTION_CREATE_STATEMENT, 
        insert_data, 
        commit=True
    )
    return make_response(jsonify(transaction[0]), 201)







