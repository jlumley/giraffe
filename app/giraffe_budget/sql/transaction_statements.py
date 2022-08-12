GET_ALL_TRANSACTIONS = """SELECT 
transactions.id as id,
transactions.account_id as account_id,
transactions.payee_id as payee_id,
transactions.date as date,
transactions.memo as memo,
transactions.reconciled as reconciled,
transactions.cleared as cleared,
transactions.transfer_id as transfer_id,
accounts.name as account_label,
payees.name as payee_label
FROM transactions
LEFT JOIN accounts ON transactions.account_id = accounts.id
LEFT JOIN payees ON transactions.payee_id = payees.id
WHERE True
"""

GET_TRANSACTION = """SELECT 
transactions.id as id,
transactions.account_id as account_id,
transactions.payee_id as payee_id,
transactions.date as date,
transactions.memo as memo,
transactions.reconciled as reconciled,
transactions.cleared as cleared,
transactions.transfer_id as transfer_id,
accounts.name as account_label,
payees.name as payee_label
FROM transactions
LEFT JOIN accounts ON transactions.account_id = accounts.id
LEFT JOIN payees ON transactions.payee_id = payees.id
WHERE transactions.id = :transaction_id;
"""

GET_TRANSACTION_CATEGORIES = """SELECT category_id, amount,
categories.name as category_label
FROM transaction_categories
LEFT JOIN categories ON transaction_categories.category_id = categories.id
WHERE transaction_id = :transaction_id;
"""

CREATE_TRANSACTION = """INSERT INTO transactions
(id, account_id, payee_id, date, memo, cleared, reconciled)
VALUES (:id, :account_id, :payee_id, :date, :memo, :cleared, 0)
RETURNING id;
"""

CREATE_TRANSACTION_CATEGORIES = """INSERT INTO transaction_categories
(transaction_id, category_id, amount)
VALUES (:transaction_id, :category_id, :amount);
"""

DELETE_TRANSACTION_CATEGORIES = """DELETE FROM transaction_categories
WHERE transaction_id = :transaction_id;
"""

DELETE_TRANSACTION = """DELETE FROM transactions
WHERE id = :transaction_id
RETURNING id;
"""

IS_CREDIT_CARD_TRANSACTION = """ SELECT account_type
FROM accounts
WHERE id = :account_id
AND account_type = "credit_card";
"""
