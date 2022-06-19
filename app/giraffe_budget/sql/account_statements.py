GET_ALL_ACCOUNTS = """SELECT id FROM accounts;"""

GET_ACCOUNT = """SELECT *
FROM accounts
WHERE id = :account_id"""


CREATE_ACCOUNT = """INSERT INTO accounts
(name, notes, created_date, reconciled_date, hidden, account_type)
VALUES (:name, :notes, :date, :date, 0, :account_type)
RETURNING id, name;
"""

HIDE_ACCOUNT = """UPDATE accounts
SET hidden = :hide
WHERE id = :id
RETURNING id, hidden;
"""

RECONCILE_ACCOUNT_TRANSACTIONS = """UPDATE transactions
SET reconciled = 1
WHERE cleared = 1
AND account_id = :id;
"""

RECONCILE_ACCOUNT = """UPDATE accounts
SET reconciled_date = :now
WHERE id = :id
RETURNING id, reconciled_date;
"""

GET_ACCOUNT_BALANCE = """SELECT SUM(amount) AS balance
FROM transaction_categories
WHERE transaction_id in (
    SELECT id FROM transactions
    WHERE cleared = :cleared
    AND account_id = :id
);
"""
