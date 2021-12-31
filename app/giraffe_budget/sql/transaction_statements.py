GET_ALL_TRANSACTIONS_STATEMENT = """SELECT *
FROM transactions
WHERE True
"""


GET_TRANSACTION_STATEMENT = """SELECT *
FROM transactions
WHERE id = :transaction_id;
"""


POST_TRANSACTION_CREATE_STATEMENT = """INSERT INTO transactions
(account_id, payee_id, date, memo, cleared, reconciled, amount)
VALUES (:account_id, :payee_id, :date, :memo,
:cleared, 0, :amount)
RETURNING id;
"""

POST_TRANSACTION_CATEGORIES_STATEMENT = """INSERT INTO transaction_categories
(transaction_id, category_id, amount)
VALUES (:transaction_id, :category_id, :amount);
"""

DELETE_TRANSACTION_CATEGORIES_STATEMENT = """DELETE FROM transaction_categories
WHERE transaction_id = :transaction_id;
"""

PUT_TRANSACTION_UPDATE_STATEMENT = """UPDATE transactions
SET id = id
"""

DELETE_TRANSACTION_STATEMENT = """DELETE FROM transactions
WHERE id = :transaction_id;
"""
