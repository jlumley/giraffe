POST_ACCOUNT_CREATE_SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "notes": {"type": "string"},
        "date": {"type": "string"},
        "starting_balance": {"type": "number"},
    },
    "required": ["name"],
}

PUT_ACCOUNT_RECONCILE_SCHEMA = {
    "type": "object",
    "properties": {"balance": {"type": "number"}, "date": {"type": "string"}},
    "required": ["balance"],
}
