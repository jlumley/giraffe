import datetime
import json
import sqlite3

from flask import Flask, g, current_app


def init_db(app):
    db = get_db()
    with current_app.open_resource("sql/create_tables.sql") as f:
        db.executescript(f.read().decode("utf-8"))


def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d


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

        g.db_cur.execute(stmt, stmt_vars)
        entries = g.db_cur.fetchall()

        if commit:
            g.db_con.commit()

        return entries

    except sqlite3.Error as e:
        current_app.logger.debug(stmt)
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
        g.db = sqlite3.connect("/data/budget.db", detect_types=sqlite3.PARSE_DECLTYPES)
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
