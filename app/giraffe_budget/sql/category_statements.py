GET_CATEGORY_STATEMENT = """SELECT * FROM categories;"""

POST_CATEGORY_CREATE_STATEMENT = """INSERT INTO categories
(name, category_group, notes)
VALUES (:name, :category_group, :notes)
RETURNING id;
"""

PUT_CATEGORY_UPDATE_STATEMENT = """UPDATE categories
SET id = id
"""

GET_GATEGORY_TARGET_STATEMENT = """SELECT
target_type,
target_amount,
target_date
FROM categories
WHERE id = :id;
"""

PUT_CATEGORY_UPDATE_TARGET_STATEMENT = """UPDATE categories
SET id = id
target_creation_date = ?
"""

DELETE_CATEGORY_TARGET_STATMENT = """ UPDATE categories
SET target_type=null,
target_date=null,
target_amount=null,
target_creation_date=null,
WHERE id = :category_id;
"""

DELETE_CATEGORY_STATEMENT = """DELETE FROM categories
WHERE id = :category_id;
"""

GET_CATEGORY_TRANSACTIONS = """SELECT
SUM(amount) AS amount FROM transactions
WHERE date < :now
AND category_id = :category_id;
"""

GET_CATEGORY_ASSIGNMENTS = """SELECT
SUM(amount) AS amount FROM assignments
WHERE date < :now
AND category_id = :category_id;
"""

PUT_CATEGORY_ASSIGN_STATEMENT = """INSERT INTO assignments
(category_id, amount, date)
VALUES (:category_id, :amount, :date);
"""

PUT_CATEGORY_UNASSIGN_STATEMENT = """INSERT INTO assignments
(category_id, amount, date)
VALUES (:category_id, :amount, :date);
"""
