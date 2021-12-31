GET_TRANSACTION_STATEMENT = """ SELECT * FROM transactions WHERE True"""

POST_TRANSACTION_CREATE_STATEMENT = """INSERT INTO transactions
(account_id, category_id, payee_id, date, memo, cleared, reconciled, amount)
VALUES (:account_id, :category_id, :payee_id, :date, :memo,
:cleared, 0, :amount)
RETURNING id;
"""

PUT_TRANSACTION_UPDATE_STATEMENT = """UPDATE transactions
SET id = id"""

DELETE_TRANSACTION_STATEMENT = """DELETE FROM transactions
WHERE id = :transaction_id;"""
