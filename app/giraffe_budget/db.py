import sqlite3

from flask import Flask, g, current_app

def init_db(app):
    db = get_db()
    with current_app.open_resource('sql/create_tables.sql') as f:
        db.executescript(f.read().decode('utf-8'))

def get_db():
    '''Create new database connection
    '''
    if not 'db' in g:
        g.db = sqlite3.connect(
            '/data/budget.db',
            detect_types= sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db():
    '''Close database connection
    '''
    db = g.pop('db', None)
    
    if db:
        db.close()


