GET_ALL_CATEGORIES = """SELECT id
FROM categories
WHERE true """

GET_CATEGORY = """SELECT *
FROM CATEGORIES
WHERE id = :category_id;
"""

CREATE_CATEGORY = """INSERT INTO categories
(id, name, category_type, category_group, notes)
VALUES (:id, :name, :category_type, :category_group, :notes)
RETURNING *;
"""

UPDATE_CATEGORY = """UPDATE categories
SET id = id"""

GET_CATEGORY_TARGET = """SELECT
target_type,
target_amount,
target_date
FROM categories
WHERE id = :category_id;
"""

UPDATE_CATEGORY_TARGET = """UPDATE categories
SET id = id,
target_type = :target_type,
target_amount = :target_amount
"""

DELETE_CATEGORY_TARGET = """ UPDATE categories
SET target_type=null,
target_date=null,
target_amount=null
WHERE id = :category_id;
"""

DELETE_CATEGORY = """DELETE FROM categories
WHERE id = :category_id;
"""

GET_CATEGORY_TRANSACTIONS = """SELECT
SUM(amount) AS amount FROM transaction_categories
WHERE category_id = :category_id
AND transaction_id IN (
SELECT id FROM transactions
WHERE date <= :before
AND date >= :after
);
"""

GET_CATEGORY_ASSIGNMENTS = """SELECT
SUM(amount) AS amount FROM assignments
WHERE date <= :before
AND date >= :after
AND category_id = :category_id
"""

ASSIGN_CATEGORY = """INSERT INTO assignments
(category_id, transaction_id, amount, date)
VALUES (:category_id, :transaction_id, :amount, :date);
"""

GET_CATEGORY_NAMES = """SELECT id, name
FROM categories
WHERE category_type in ('budget','system');
"""

GET_CREDIT_CARD_CATEGORY_NAMES = """SELECT id, name, category_type
FROM categories WHERE category_type="credit_card";
"""

GET_CATEGORY_GROUPS = """SELECT DISTINCT category_group
FROM categories WHERE category_group IS NOT NULL;
"""
