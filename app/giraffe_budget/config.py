import logging


class Config(object):
    TESTING = False


class ProductionConfig(Config):
    DATABASE_URI = "/data/budget-sql.db"
    SQLALCHEMY_DATABASE_URI ="sqlite:////data/budget.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LOG_LEVEL = logging.INFO


class DevelopmentConfig(Config):
    DATABASE_URI = "/tmp/budget-sql.db"
    SQLALCHEMY_DATABASE_URI = "sqlite:////tmp/test.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = True
    LOG_LEVEL = logging.DEBUG
