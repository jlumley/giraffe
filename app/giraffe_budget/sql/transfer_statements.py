GET_TRANSFER = """SELECT *
FROM transactions
WHERE transfer_id = :transfer_id;
"""

GET_TRANSFER_CATEGORY = """ SELECT *
FROM transaction_categories
WHERE transaction_id = :transaction_id;
"""

CREATE_TRANSFER = """INSERT INTO transactions
(id, account_id, payee_id, date, memo, cleared, reconciled, transfer_id)
VALUES (:id, :account_id, :payee_id, :date, :memo, :cleared, false, :transfer_id)
"""

CREATE_TRANSFER_CATEGORY = """INSERT INTO transaction_categories
(transaction_id, category_id, amount)
VALUES (:transaction_id, "7294d522-28e8-4f1d-a721-3d9f74f871a8", :amount);
"""


DELETE_TRANSFER = """DELETE FROM transactions
WHERE transfer_id = :transfer_id
RETURNING id;
"""

DELETE_TRANSFER_CATEGORIES = """
DELETE FROM transaction_categories
WHERE transaction_id IN 
(
    SELECT transaction_id FROM transactions
    WHERE transfer_id = :transfer_id
);
"""


UPDATE_TRANSFER = """ UPDATE transactions
SET id = id """

UPDATE_TRANSFER_AMOUNT = """ UPDATE transaction_categories
SET amount = :amount
WHERE transaction_id = :transaction_id;
"""
