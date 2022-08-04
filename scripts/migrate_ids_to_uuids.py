import argparse
import sqlite3
import uuid

# script to migrate all of the int ids for the following tables to uuids
# - transactions
# - accounts
# - payees
# - categories

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def connect_to_db(db_file):
    """
    return database connection
    """

    db = sqlite3.connect(db_file, detect_types=sqlite3.PARSE_DECLTYPES)
    db.row_factory = dict_factory

    return db



def execute(db, stmt, stmt_vars=dict(), commit=False):
    """Execute a valid SQL statement
    Args:
        stmt        : string
        stmt_vars   : dict
        commit      : bool
    Returns:
        sql response
    """
    db_cur = db.cursor()
    
    print(stmt)
    print(stmt_vars)
    db_cur.execute(stmt, stmt_vars)
    entries = db_cur.fetchall()

    if commit:
        db.commit()

    return entries



def migrate_payees(db):
    """
    migrate all the payees to uuids
    update all transactions to use new uuids
    """

    # fetch all payees
    payees = execute(db, "SELECT * FROM payees;")     
    
    for p in payees:
        stmt_vars = dict(
            old_payee_id=p.get("id"),
            new_payee_id=str(uuid.uuid4())
        )

        execute(db, "UPDATE transactions SET payee_id = :new_payee_id WHERE payee_id = :old_payee_id AND transfer_id is null;", stmt_vars=stmt_vars, commit=True) 
        execute(db, "UPDATE payees  SET id = :new_payee_id WHERE id = :old_payee_id;", stmt_vars=stmt_vars, commit=True) 


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("db_file", type=str, help="db file to use")
    args = parser.parse_args()

    
    db = connect_to_db(args.db_file)
    migrate_payees(db)

if __name__ == "__main__":
    main()

