import logging
import sqlite3

from .blueprints import account, category, transaction, payee
from .db import init_db
from flask import Flask, g, current_app

def setup_logger():
    logging.basicConfig(level=logging.DEBUG)

def create_app():
    '''Instatiate Flask app and Create/Migrate Database
    '''
    
    app = Flask(__name__)
    setup_logger()
    with app.app_context():
        app.logger.info('Initializing database')
        init_db(app)
    app.register_blueprint(account.account)
    
    return app
    
   

