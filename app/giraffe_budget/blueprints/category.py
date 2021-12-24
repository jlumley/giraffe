from flask import Blueprint, current_app, request, make_response, g, jsonify
from flask_expects_json import expects_json

from .. import db_utils
from .. import time_utils
from ..schemas.category_schema import *
from ..sql.category_statements import *

category = Blueprint('category', __name__, url_prefix='/category')

@category.route('', methods=('GET',))
def get_categories():
    '''Get all categories
    '''
    categories = db_utils.execute_statement(
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
    category = db_utils.execute_statement(
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

    category = db_utils.execute_statement(
        update_statement,
        update_vars, 
        commit=True
    )
    return make_response(jsonify(category[0]), 200)

#@category.route('/delete/<category_id>', methods=('DELETE',))
#def delete_category(category_id):
#    '''Delete Category
#    '''
#    db_utils.execute_statement(
#        DELETE_CATEGORY_STATEMENT,
#        {
#            'category_id': category_id
#        }, 
#        commit=True
#    )
#    return make_response(jsonify('success'), 200)

