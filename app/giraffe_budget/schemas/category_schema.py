

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

