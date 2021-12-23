GET_TRANSACTION_STATEMENT = ''' SELECT * FROM transactions;
'''

POST_TRANSACTION_CREATE_STATEMENT = '''INSERT INTO transactions
(account_id, category_id, payee_id, date, memo, cleared, reconciled, amount)
VALUES (:account_id, :category_id, :payee_id, :date, :memo,
:cleared, 0, :amount)
RETURNING id;
'''
