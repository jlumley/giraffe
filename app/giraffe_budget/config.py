import logging


class Config(object):
    TESTING = False


class ProductionConfig(Config):
    DATABASE_URI = "/data/budget.db"
    LOG_LEVEL = logging.INFO


class DevelopmentConfig(Config):
    DATABASE_URI = "/tmp/budget.db"
    TESTING = True
    LOG_LEVEL = logging.DEBUG
