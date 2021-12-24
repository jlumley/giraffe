import logging
import sqlite3

from .blueprints import account, category, transaction, payee
from .db_utils import *
from flask import Flask, g, current_app

app = Flask(__name__)


def setup_logger():
    logging.basicConfig(level=logging.DEBUG)


@app.before_request
def before_each_request():
    # Set up database connection
    g.db_con = get_db()
    g.db_cur = g.db_con.cursor()


@app.after_request
def after_each_request(response):
    # Close Database connection
    close_db()

    return response

def main():
    '''Instatiate Flask app and Create/Migrate Database
    '''
   
    setup_logger()
    app.before_request_func = []
    with app.app_context():
        app.logger.info('Initializing database')
        init_db(app)
    app.register_blueprint(account.account)    
    app.register_blueprint(transaction.transaction)
    app.register_blueprint(category.category)
    app.register_blueprint(payee.payee)

main()

