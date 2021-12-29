import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from .. import db_utils, time_utils, money_utils
from ..schemas.transaction_schema import *
from ..sql.transaction_statements import *

transaction = Blueprint('transaction', __name__, url_prefix='/transaction')

@transaction.route('', 
    methods=('GET',),
    defaults={
        'accounts': None,
        'categories': None,
        'payees': None,
        'before': None,
        'after': None,
        'cleared': None,
        'reconciled': None,
    })
def get_transactions(
    accounts,
    categories,
    payees,
    before,
    after,
    cleared,
    reconciled):
    '''Get all transactions
    '''
    accounts    = request.args.get('accounts', accounts)
    categories  = request.args.get('categories', categories)
    payees      = request.args.get('payees', payees)
    before      = request.args.get('before', before)
    after       = request.args.get('after', after)
    cleared     = request.args.get('cleared', cleared)
    reconciled  = request.args.get('reconciled', reconciled)

    query_statement = GET_TRANSACTION_STATEMENT
    query_vars = tuple()

    # build query statement
    if accounts is not None:
        query_statement += (' AND account_id IN (%s)' %
            ','.join('?'*len(accounts.split(','))))
        query_vars += tuple(accounts.split(','))
  
    if categories is not None:
        query_statement += (' AND category_id IN (%s)' %
            ','.join('?'*len(categories.split(','))))
        query_vars += tuple(categories.split(','))

    if payees is not None:
        query_statement += (' AND payee_id IN (%s)' %
            ','.join('?'*len(payees.split(','))))
        query_vars += tuple(payees.split(','))
    
    if before is not None:
        query_statement += (' AND date < ?')
        query_vars += (time_utils.datestr_to_timestamp(before),)

    if after is not None:
        query_statement += (' AND date > ?')
        query_vars += (time_utils.datestr_to_timestamp(after),)
    
    if cleared is not None:
        query_statement += (' AND cleared = ?')
        query_vars += (to_sqlite_bool(cleared),)

    if reconciled is not None:
        query_statement += (' AND reconciled = ?')
        query_vars += (to_sqlite_bool(reconciled),)


    transactions = db_utils.execute(
        query_statement,
        query_vars
    )
    for t in transactions:
        t['amount'] = money_utils.cents_to_money(t['amount'])
    return make_response(jsonify(transactions), 200)


@transaction.route('/create', methods=('POST',))
@expects_json(POST_TRANSACTION_CREATE_SCHEMA)
def create_transaction():
    '''Create new transaction 
    '''
    data = request.get_json()
    date = time_utils.datestr_to_timestamp(data['date'])
    insert_data = {
        'account_id': data.get('account_id'),
        'category_id': data.get('category_id'),
        'payee_id': data.get('payee_id'),
        'date': date,
        'memo': data.get('memo'),
        'cleared': int(data.get('cleared')),
        'amount': money_utils.money_to_cents(data.get('amount'))
    }
    transaction = db_utils.execute(
        POST_TRANSACTION_CREATE_STATEMENT, 
        insert_data, 
        commit=True
    )
    return make_response(jsonify(transaction[0]), 201)

@transaction.route('/update/<transaction_id>', methods=('PUT',))
@expects_json(PUT_TRANSACTION_UPDATE_SCHEMA)
def update_transaction(transaction_id):
    '''Update transaction 
    '''
    data = request.get_json()
    update_statement = PUT_TRANSACTION_UPDATE_STATEMENT
    update_vars = tuple()
    if 'account_id' in data.keys():
        update_statement += ', account_id = ?'
        update_vars += (data['account_id'],)
    if 'category_id' in data.keys():
        update_statement += ', category_id = ?'
        update_vars += (data['category_id'],)
    if 'payee_id' in data.keys():
        update_statement += ', payee_id = ?'
        update_vars += (data['payee_id'],)
    if 'date' in data.keys():
        update_statement += ', date = ?'
        update_vars += (time_utils.datestr_to_timestamp(data['date']),)
    if 'memo' in data.keys():
        update_statement += ', memo = ?'
        update_vars += (data['memo'],)
    if 'amount' in data.keys():
        update_statement += ', amount = ?'
        update_vars += (money_utils.money_to_cents(data['amount']),)
    if 'cleared' in data.keys():
        update_statement += ', cleared = ?'
        update_vars += (to_sqlite_bool(data['cleared']),)
    
    update_statement += 'WHERE id = ? RETURNING id;'
    update_vars += (transaction_id,)

    transaction = db_utils.execute(
        update_statement,
        update_vars, 
        commit=True
    )
    return make_response(jsonify(transaction[0]), 200)

@transaction.route('/delete/<transaction_id>', methods=('DELETE',))
def delete_transaction(transaction_id):
    '''Delete transaction 
    '''
    db_utils.execute(
        DELETE_TRANSACTION_STATEMENT,
        {
            'transaction_id': transaction_id
        }, 
        commit=True
    )
    return make_response(jsonify('success'), 200)




def to_sqlite_bool(value):
    '''quick and dirty function to handle
    boolean request params
    '''
    if value.lower() in ('t', 'true', 'yes', 'y'):
        return 1
    else:
        return 0



