

POST_ACCOUNT_CREATE_SCHEMA = {
    'type': 'object',
    'properties': {
        'name' : {'type': 'string'},
        'notes' : {'type': 'string'},
        'starting_balance' : {'type': 'number'}
    },
    'required' : ['name', 'starting_balance']
}

PUT_ACCOUNT_RECONCILE_SCHEMA = {
    'type': 'object',
    'properties': {
        'balance' : {'type': 'number'}
    },
    'required' : ['balance']
}
