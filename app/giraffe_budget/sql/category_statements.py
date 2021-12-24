GET_CATEGORY_STATEMENT = '''SELECT * FROM categories;'''

POST_CATEGORY_CREATE_STATEMENT = '''INSERT INTO categories
(name, category_group, notes)
VALUES (:name, :category_group, :notes)
RETURNING id;
'''

PUT_TRANSACTION_UPDATE_STATEMENT = '''UPDATE transactions
SET id = id'''

DELETE_TRANSACTION_STATEMENT = '''DELETE FROM transactions
WHERE id = :transaction_id;'''
