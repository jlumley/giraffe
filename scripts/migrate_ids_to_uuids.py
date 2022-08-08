import argparse
import os
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

def execute(db, stmt, stmt_vars=dict(), commit=True):
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


def fetch_old_payees(db):
    """
    migrate all the payees to uuids
    update all transactions to use new uuids
    """

    # fetch all payees
    payees = execute(db, "SELECT * FROM payees;")     
    
    for p in payees:
        p["new_id"] = str(uuid.uuid4())
    return payees


def fetch_old_accounts(db):
    """ 
    fetch all of the old accounts 
    """
    accounts = execute(db, "SELECT * FROM accounts;")
    # add a new uuid for each account
    for a in accounts:
        a["new_id"] = str(uuid.uuid4())
    return accounts


def fetch_old_categories(db):
    """
    fetch all of the old categories
    """
    categories = execute(db, "select * from categories;")
    for c in categories:
        c["new_id"] = str(uuid.uuid4())
    return categories


def fetch_old_transactions(db):
    """
    fetch all of the old transactions
    """
    transactions = execute(db, "select * from transactions;")
    for t in transactions:
        t["new_id"] = str(uuid.uuid4())
    return transactions


def fetch_old_transaction_categories(db):
    """
    fetch all of the old transaction categories
    """
    return execute(db, "select * from transaction_categories;")


def fetch_old_assignments(db):
    """
    fetch all of the old category assignments
    """
    return execute(db, "select * from assignments;")


def migrate_payees(db, payees):
    """
    create all of the payees in the new database
    """
    for p in payees:
        execute(
            db,
            """insert into payees (id, name, category_prediction, system_payee)
            values (:new_id, :name, :category_prediction, :system_payee)""",
            p
        )


def migrate_accounts(db, accounts):
    """
    create all of the accounts in the new database
    """
    for a in accounts:
        execute(
            db,
            """insert into accounts (id, name, account_type, created_date, reconciled_date)
            values (:new_id, :name, :account_type, :created_date, :reconciled_date)""",
            a
        )


def migrate_categories(db, categories):
    """
    create all of the categories in the new database
    """
    for c in categories:
        execute(
            db,
            """insert into categories (id, name, category_type, target_type, target_amount, target_date, category_group, notes)
            values (:new_id, :name, :category_type, :target_type, :target_amount, :target_date, :category_group, :notes)""",
            c
        )


def migrate_assignments(db, assignments, categories):
    """
    create all of the assignments in the new database
    """
    categories_dict = dict()
    for c in categories:
        categories_dict[c["id"]] = c["new_id"]

    for a in assignments:
        a["category_id"] = categories_dict[a["category_id"]]

        execute(
            db,
            """insert into assignments (amount, category_id, date)
           values (:amount, :category_id, :date)""",
           a
        )


def migrate_transactions(
    db,
    transactions,
    accounts,
    payees
): 
    """
    create all of the transactions in the new database
    """
    accounts_dict = dict()
    for a in accounts:
        accounts_dict[a["id"]] = a["new_id"]
    
    payees_dict = dict()
    for p in payees:
        payees_dict[p["id"]] = p["new_id"]

    for t in transactions:
        t["account_id"] = accounts_dict[t["account_id"]]
        if t["payee_id"]:
            if not t["transfer_id"]:
                t["payee_id"] = payees_dict[t["payee_id"]] 
            else:
                t["payee_id"] = accounts_dict[t["payee_id"]]
        execute(
            db,
            """insert into transactions (id, account_id, payee_id, date, memo, reconciled, cleared, transfer_id)
            values (:new_id, :account_id, :payee_id, :date, :memo, :reconciled, :cleared, :transfer_id)""",
            t
        )


def migrate_transaction_categories(
    db,
    transaction_categories,
    transactions,
    categories
): 
    """
    create all of the transaction_categories in the new database
    """
    categories_dict = dict()
    for c in categories:
        categories_dict[c["id"]] = c["new_id"]
    
    transactions_dict = dict()
    for t in transactions:
        transactions_dict[t["id"]] = t["new_id"]

    for t in transaction_categories:
        t["transaction_id"] = transactions_dict[t["transaction_id"]]
        t["category_id"] = categories_dict[t["category_id"]]
        execute(
            db,
            """insert into transaction_categories (transaction_id, category_id, amount)
            values (:transaction_id, :category_id, :amount)""",
            t
        )

def compare_category_assignments (
    old_db,
    new_db
):
    """
    count and sum all category assignments
    """
    query = "select sum(amount) as sum from assignments where amount > 0;"
    old_sum = execute(old_db, query)
    new_sum = execute(new_db, query)
    assert old_sum == new_sum
    print(old_sum) 

    query = "select count(*) as count from assignments;"
    old_count = execute(old_db, query)
    new_count = execute(new_db, query)
    assert old_count == new_count
    print(old_count)
    
def compare_transaction_categories(
    old_db,
    new_db
):
    """
    count and sum all transaction categories
    """
    query = "select sum(amount) as sum from transaction_categories where amount > 0;"
    old_sum = execute(old_db, query)
    new_sum = execute(new_db, query)
    assert old_sum == new_sum
    print(old_sum)

    query = "select count(*) as count from transaction_categories;"
    old_count = execute(old_db, query)
    new_count = execute(new_db, query)
    assert old_count == new_count
    print(old_count) 

def main():
    parser = argparse.ArgumentParser()
    
    parser.add_argument("old_db_file", type=str, help="db file to use")
    parser.add_argument("new_db_file", type=str, help="db file to use")

    args = parser.parse_args()
    
    # remove new db before migration
    if os.path.exists(args.new_db_file):
        os.remove(args.new_db_file)

    old_db = connect_to_db(args.old_db_file)
    new_db = connect_to_db(args.new_db_file)

    old_payees = fetch_old_payees(old_db)
    old_accounts = fetch_old_accounts(old_db)
    old_categories = fetch_old_categories(old_db)
    old_transactions = fetch_old_transactions(old_db)
    old_transaction_categories = fetch_old_transaction_categories(old_db)
    old_assignments = fetch_old_assignments(old_db)

    print(old_payees)
    print(old_accounts)
    print(old_categories)
    print(old_transactions)
    print(old_transaction_categories)
    print(old_assignments)
    
    # create all of the required tables in the new database
    with open("app/giraffe_budget/sql/db_init.sql") as f:
        execute(new_db, "create table if not exists db_version(version integer);")
        new_db.executescript(f.read())
    
    migrate_payees(new_db, old_payees)
    migrate_accounts(new_db, old_accounts)
    migrate_categories(new_db, old_categories)
     
    # create all of the tables that contain foreign keys
    migrate_assignments(new_db, old_assignments, old_categories)
    migrate_transactions(new_db, old_transactions, old_accounts, old_payees)
    migrate_transaction_categories(new_db, old_transaction_categories, old_transactions, old_categories)
    

    # validate the migration
    compare_transaction_categories(old_db, new_db) 
    compare_category_assignments(old_db, new_db) 
if __name__ == "__main__":
    main()

