
GET_TRANSFER = """SELECT *
FROM transactions
WHERE transfer_id = :transfer_id
AND amount > 0;
"""

CREATE_TRANSFER = """INSERT INTO transactions
(account_id, payee_id, date, memo, amount, cleared, transfer_id)
VALUES (:account_id, :payee_id, :date, :memo, :amount, :cleared, :transfer_id)
RETURNING *;
"""


DELETE_TRANSFER = """DELETE FROM transactions
WHERE transfer_id = :transfer_id
RETURNING id;
"""

UPDATE_TRANSFER = """ UPDATE transactions
SET id = id """