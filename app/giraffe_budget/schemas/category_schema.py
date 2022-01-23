POST_CATEGORY_CREATE_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "group": {"type": "string"},
        "notes": {"type": "string"},
    },
    "required": ["name", "group"],
}

PUT_CATEGORY_UPDATE_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "group": {"type": "string"},
        "notes": {"type": "string"},
    },
}

PUT_CATEGORY_UPDATE_TARGET_SCHEMA = {
    "type": "object",
    "properties": {
        "target_type": {"type": "string"},
        "target_amount": {"type": "integer"},
        "target_date": {"type": "string"},
    },
    "required": ["target_type"],
}
PUT_CATEGORY_ASSIGN_SCHEMA = {
    "type": "object",
    "properties": {"amount": {"type": "integer"}, "date": {"type": "string"}},
    "required": ["amount", "date"],
}

PUT_CATEGORY_UNASSIGN_SCHEMA = {
    "type": "object",
    "properties": {"amount": {"type": "integer"}, "date": {"type": "string"}},
    "required": ["amount", "date"],
}
