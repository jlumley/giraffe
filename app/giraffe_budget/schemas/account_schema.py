

POST_ACCOUNT_CREATE_SCHEMA = {
    'type': 'object',
    'properties': {
        'name' : {'type': 'string'},
        'notes' : {'type': 'string'},
        'credit' : {'type': 'boolean'},
        'starting_balance' : {'type': 'number'}
    },
    'required' : ['name', 'starting_balance', 'credit']
}
