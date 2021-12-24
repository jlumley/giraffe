

POST_CATEGORY_CREATE_SCHEMA = {
    'type': 'object',
    'properties': {
        'name' : {'type': 'string'},
        'category_group' : {'type': 'string'},
        'notes' : {'type': 'string'}
    },
    'required' : ['name', 'category_group']
}

PUT_CATEGORY_UPDATE_SCHEMA = {
    'type': 'object',
    'properties': {
        'name' : {'type': 'string'},
        'category_group' : {'type': 'string'},
        'notes' : {'type': 'string'}
    },
    'required' : ['name', 'category_group']
}

PUT_CATEGORY_ASSIGN_SCHEMA = {
    'type': 'object',
    'properties': {
        'amount' : {'type': 'number'},
        'date' : {'type': 'string'}
    },
    'required' : ['amount', 'date']
}

PUT_CATEGORY_UNASSIGN_SCHEMA = {
    'type': 'object',
    'properties': {
        'amount' : {'type': 'number'},
        'date' : {'type': 'string'}
    },
    'required' : ['amount', 'date']
}
