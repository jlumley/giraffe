GET_ALL_CATEGORIES = """SELECT * FROM categories;"""

POST_CATEGORY_CREATE = """INSERT INTO categories
(name, category_group, notes)
VALUES (:name, :category_group, :notes)
RETURNING id;
"""

PUT_CATEGORY_UPDATE = """UPDATE categories
SET id = id
"""

GET_CATEGORY_TARGET = """SELECT
target_type,
target_amount,
target_date
FROM categories
WHERE id = :category_id;
"""

PUT_CATEGORY_UPDATE_TARGET = """UPDATE categories
SET id = id,
target_type = :target_type,
target_amount = :target_amount
"""

DELETE_CATEGORY_TARGET_STATMENT = """ UPDATE categories
SET target_type=null,
target_date=null,
target_amount=null,
WHERE id = :category_id;
"""

DELETE_CATEGORY = """DELETE FROM categories
WHERE id = :category_id;
"""

GET_CATEGORY_TRANSACTIONS = """SELECT
SUM(amount) AS amount FROM transaction_categories
WHERE category_id = :category_id
AND transaction_id IN (
SELECT id FROM transactions WHERE date < :now
);
"""

GET_CATEGORY_ASSIGNMENTS = """SELECT
SUM(amount) AS amount FROM assignments
WHERE date < :now
AND category_id = :category_id;
"""

PUT_CATEGORY_ASSIGN = """INSERT INTO assignments
(category_id, amount, date)
VALUES (:category_id, :amount, :date);
"""

PUT_CATEGORY_UNASSIGN = """INSERT INTO assignments
(category_id, amount, date)
VALUES (:category_id, :amount, :date);
"""
