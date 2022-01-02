import logging
import os
import sqlite3

from .config import *
from .blueprints import account, category, transaction, payee
from .utils.db_utils import *
from flask import Flask, g, current_app

app = Flask(__name__)


def load_config(app_mode):

    if app_mode == "DEV":
        app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(ProductionConfig)


def setup_logger():
    logging.basicConfig(level=app.config["LOG_LEVEL"])


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
    """Instatiate Flask app and Create/Migrate Database"""
    app_mode = os.environ["APP_MODE"]
    load_config(app_mode)
    setup_logger()
    app.logger.info(f"App Mode: {app_mode}")
    with app.app_context():
        app.logger.info("Initializing database")
        init_db(app)

    # Register Blueprints
    app.register_blueprint(account.account)
    app.register_blueprint(transaction.transaction)
    app.register_blueprint(category.category)
    app.register_blueprint(payee.payee)


main()
