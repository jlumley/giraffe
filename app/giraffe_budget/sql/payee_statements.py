GET_ALL_PAYEES = """SELECT id from payees;"""

GET_PAYEE = """ SELECT *
FROM payees
WHERE id = :payee_id;"""

CREATE_PAYEE = """INSERT INTO payees
(name)
VALUES (:name)
RETURNING id;
"""

UPDATE_PAYEE = """UPDATE payees
SET id = id
RETURNING *;"""

DELETE_PAYEE = """DELETE FROM payees
WHERE id = :payee_id
RETURNING id;"""
