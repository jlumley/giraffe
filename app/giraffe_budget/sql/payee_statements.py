GET_ALL_PAYEES = """SELECT * from payees;"""

GET_PAYEE = """ SELECT *
FROM payees
WHERE id = :payee_id;"""

CREATE_PAYEE = """INSERT INTO payees
(id, name)
VALUES (:id, :name)
RETURNING id;
"""

UPDATE_PAYEE = """UPDATE payees
SET id = id"""

DELETE_PAYEE = """DELETE FROM payees
WHERE id = :payee_id
RETURNING id;"""
