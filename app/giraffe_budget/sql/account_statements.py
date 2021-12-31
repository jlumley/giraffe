GET_ACCOUNT_STATEMENT = """SELECT * FROM accounts;"""

POST_ACCOUNT_CREATE_STATEMENT = """INSERT INTO accounts
(name, notes, created_date, reconciled_date, hidden)
VALUES (:name, :notes, :now, :now, 0)
RETURNING id, name;
"""

PUT_ACCOUNT_HIDE_STATEMENT = """UPDATE accounts
SET hidden = 1
WHERE id = :id
RETURNING id, hidden;
"""

PUT_ACCOUNT_UNHIDE_STATEMENT = """UPDATE accounts
SET hidden = 0
WHERE id = :id
RETURNING id, hidden;
"""

PUT_ACCOUNT_RECONCILE_TRANSACTIONS_STATEMENT = """UPDATE transactions
SET reconciled = 1
WHERE reconciled = 0
AND cleared = 1
AND account_id = :id;
"""

PUT_ACCOUNT_RECONCILE_AUTO_TRANSACTION_STATEMENT = """ INSERT INTO transactions
(account_id, date, memo, amount, reconciled, cleared)
VALUES (:id, :now, 'Reconciliation Transaction',
:balance - (SELECT SUM(amount) FROM transactions WHERE cleared = 1 AND account_id = :id),
1, 1);
"""

PUT_ACCOUNT_RECONCILE_STATEMENT = """UPDATE accounts
SET reconciled_date = :now
WHERE id = :id
RETURNING id, reconciled_date;
"""

GET_ACCOUNT_CLEARED_BALANCE = """SELECT SUM(amount) AS balance
FROM transactions
WHERE cleared = 1
AND account_id = :id
"""

GET_ACCOUNT_UNCLEARED_BALANCE = """SELECT SUM(amount) AS balance
FROM transactions
WHERE cleared = 0
AND account_id = :id
"""
