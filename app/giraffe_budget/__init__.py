import logging
import os
import sqlite3

from .config import *
from .blueprints import account, category, transaction, payee, transfer, health, reports
from .utils.db_utils import *
from flask import Flask, g, current_app


# Application Factory Function
def create_app():
    app = Flask(__name__)

    load_config(app)
    register_blueprints(app)
    setup_logger(app)
    with app.app_context():
        init_db(app)

    @app.before_request
    def before_each_request():
        # Set up database connection
        g.db_con = get_db()
        g.db_cur = g.db_con.cursor()
        g.db_con.execute("PRAGMA foreign_keys = 1;")

    @app.after_request
    def after_each_request(response):
        # Close Database connection
        close_db()

        return response

    return app


def load_config(app):

    if os.environ.get("APP_MODE") == "DEV":
        app.logger.info(f"App Mode: Dev")
        app.config.from_object(DevelopmentConfig)
    if os.environ.get("APP_MODE") == "TEST":
        app.logger.info(f"App Mode: Test")
        app.config.from_object(DevelopmentConfig)
    else:
        app.logger.info(f"App Mode: Prod")
        app.config.from_object(ProductionConfig)


def setup_logger(app):
    logging.basicConfig(level=app.config["LOG_LEVEL"])


# Register Blueprints
def register_blueprints(app):
    app.register_blueprint(account.account)
    app.register_blueprint(transaction.transaction)
    app.register_blueprint(category.category)
    app.register_blueprint(payee.payee)
    app.register_blueprint(transfer.transfer)
    app.register_blueprint(health.health)
    app.register_blueprint(reports.reports)
