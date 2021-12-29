import time

from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from .. import db_utils, time_utils, money_utils
from ..schemas.category_schema import *
from ..sql.category_statements import *

category = Blueprint('category', __name__, url_prefix='/category')

@category.route('', methods=('GET',))
def get_categories():
    '''Get all categories
    '''
    categories = db_utils.execute(
        GET_CATEGORY_STATEMENT
    )
    return make_response(jsonify(categories), 200)


@category.route('/create', methods=('POST',))
@expects_json(POST_CATEGORY_CREATE_SCHEMA)
def create_category():
    '''Create new category 
    '''
    data = request.get_json()
    insert_data = {
        'name': data.get('name'),
        'category_group': data.get('category_group'),
        'notes': data.get('notes')
    }
    category = db_utils.execute(
        POST_CATEGORY_CREATE_STATEMENT,
        insert_data, 
        commit=True
    )
    return make_response(jsonify(category[0]), 201)

@category.route('/update/<category_id>', methods=('PUT',))
@expects_json(PUT_CATEGORY_UPDATE_SCHEMA)
def update_cateogry(category_id):
    '''Update Category
    '''
    assert category_id == request.view_args['category_id']
 
    data = request.get_json()
    update_statement = PUT_CATEGORY_UPDATE_STATEMENT
    update_vars = tuple()
    if 'name' in data.keys():
        update_statement += ', name = ?'
        update_vars += (data['name'],)
    if 'category_group' in data.keys():
        update_statement += ', category_group = ?'
        update_vars += (data['category_group'],)
    if 'notes' in data.keys():
        update_statement += ', notes = ?'
        update_vars += (data['notes'],)
    
    update_statement += 'WHERE id = ? RETURNING id;'
    update_vars += (category_id,)

    category = db_utils.execute(
        update_statement,
        update_vars, 
        commit=True
    )
    return make_response(jsonify(category[0]), 200)

@category.route('/balance/<category_id>', methods=('GET',))
def get_category_balance(category_id):
    '''Get category balance
    '''
    assert category_id == request.view_args['category_id']
    

    transactions = db_utils.execute(
        GET_CATEGORY_TRANSACTIONS,
        {
            'category_id': category_id,
            'now': time.time()
        }
    )
 
    assignments = db_utils.execute(
        GET_CATEGORY_ASSIGNMENTS,
        {
            'category_id': category_id,
            'now': time.time()
        }
    )

    assigned = money_utils.cents_to_money(assignments[0]['amount'])
    spent = money_utils.cents_to_money(transactions[0]['amount'])
    
    balance =  (assigned + spent)
    return make_response(
        jsonify({
            'category_id': category_id,
            'balance': balance
        }),
        200
    )



@category.route('/assign/<category_id>', methods=('PUT',))
@expects_json(PUT_CATEGORY_ASSIGN_SCHEMA)
def category_assign(category_id):
    '''Assign money to category
    '''
    assert category_id == request.view_args['category_id']
 
    data = request.get_json()
    date = time_utils.datestr_to_timestamp(data['date'])
    db_utils.execute(
        PUT_CATEGORY_ASSIGN_STATEMENT,
        {
            'category_id': category_id,
            'amount': abs(money_utils.money_to_cents(data['amount'])),
            'date': date
        },
        commit=True
    )
    
    return get_category_balance(category_id)

@category.route('/unassign/<category_id>', methods=('PUT',))
@expects_json(PUT_CATEGORY_UNASSIGN_SCHEMA)
def category_unassign(category_id):
    '''Unassign money from category
    '''
    assert category_id == request.view_args['category_id']
 
    data = request.get_json()
    date = time_utils.datestr_to_timestamp(data['date'])
    db_utils.execute(
        PUT_CATEGORY_UNASSIGN_STATEMENT,
        {
            'category_id': category_id,
            'amount': -1 * abs(money_utils.money_to_cents(data['amount'])),
            'date': date
        },
        commit=True
    )
    return get_category_balance(category_id)


#@category.route('/delete/<category_id>', methods=('DELETE',))
#def delete_category(category_id):
#    '''Delete Category
#    '''
#    db_utils.execute(
#        DELETE_CATEGORY_STATEMENT,
#        {
#            'category_id': category_id
#        }, 
#        commit=True
#    )
#    return make_response(jsonify('success'), 200)

