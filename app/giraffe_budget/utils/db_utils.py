import datetime
import json
import sqlite3

from flask import Flask, g, current_app

CREATE_DB_VERSION_TABLE = """
CREATE TABLE IF NOT EXISTS db_version (
  version integer
);
"""


def init_db(app):
    db = get_db()
    db_cur = db.cursor()
    with current_app.open_resource("sql/db_init.sql") as f:
        db_cur.execute(CREATE_DB_VERSION_TABLE)
        db_cur.execute("SELECT version FROM db_version;")
        db_version = db_cur.fetchall()
        if not db_version:
            db.executescript(f.read().decode("utf-8"))


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


def to_sqlite_bool(value):
    """Convert string value to int boolean

    Args:
        value (str): string value to convert

    Returns:
        int: boolean value as an int
    """
    if value.lower() in ("t", "true", "yes", "y"):
        return 1
    else:
        return 0


def timestamp_to_datestr(rows, cols):
    """Convert colums to date strings
    Args:
        rows        : list
        cols        : list
    Returns:
        List of rows with date strings
    """
    new_rows = list()
    for row in rows:
        date_row = dict()
        for k, v in row.items():
            if k in cols:
                v = datetime.datetime.fromtimestamp(v)
                date_row[k] = v.strftime("%d %b %Y")
            else:
                date_row[k] = v
        new_rows.append(date_row)

    return new_rows


def int_to_bool(rows, cols):
    """Convert colums to booleans
    Args:
        rows        : list
        cols        : list
    Returns:
        List of rows with booleans
    """
    new_rows = list()
    for row in rows:
        bool_row = dict()
        for k, v in row.items():
            if k in cols:
                bool_row[k] = bool(v)
            else:
                bool_row[k] = v
        new_rows.append(bool_row)

    return new_rows


def execute(stmt, stmt_vars=dict(), commit=False):
    """Execute a valid SQL statement
    Args:
        stmt        : string
        stmt_vars   : dict
        commit      : bool
    Returns:
        sql response
    """
    try:
        current_app.logger.debug(stmt)
        current_app.logger.debug(stmt_vars)
        g.db_cur.execute(stmt, stmt_vars)
        entries = g.db_cur.fetchall()

        if commit:
            g.db_con.commit()

        return entries

    except sqlite3.Error as e:
        current_app.logger.info(stmt)
        current_app.logger.error(e)
        raise e


def get_db():
    """Create new database connection
    Args:
        None
    Returns:
        Database Connection
    """
    if not "db" in g:
        db_uri = current_app.config["DATABASE_URI"]
        g.db = sqlite3.connect(db_uri, detect_types=sqlite3.PARSE_DECLTYPES)
        g.db.row_factory = dict_factory
    return g.db


def close_db():
    """Close database connection
    Args:
        None
    Returns:
        None
    """
    db = g.pop("db", None)

    if db:
        db.close()
