GET_ALL_TRANSACTIONS = """SELECT id
FROM transactions
WHERE True
"""

GET_TRANSACTION = """SELECT *
FROM transactions
WHERE id = :transaction_id;
"""

GET_TRANSACTION_CATEGORIES = """SELECT *
FROM transaction_categories
WHERE transaction_id = :transaction_id;
"""

CREATE_TRANSACTION = """INSERT INTO transactions
(account_id, payee_id, date, memo, cleared, reconciled, amount)
VALUES (:account_id, :payee_id, :date, :memo, :cleared, 0, :amount)
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

DELETE_TRANSACTION_ASSIGNMENTS = """DELETE FROM assignments
WHERE transaction_id = :transaction_id;
"""

IS_CREDIT_CARD_TRANSACTION = """ SELECT account_type
FROM accounts
WHERE id = :account_id
AND account_type = "credit_card";
"""
