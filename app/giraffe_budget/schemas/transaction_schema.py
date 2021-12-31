POST_TRANSACTION_CREATE_SCHEMA = {
    "type": "object",
    "properties": {
        "account_id": {"type": "integer"},
        "category_id": {"type": "integer"},
        "payee_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "cleared": {"type": "boolean"},
        "amount": {"type": "number"},
    },
    "required": ["account_id", "date", "cleared", "amount"],
}


PUT_TRANSACTION_UPDATE_SCHEMA = {
    "type": "object",
    "properties": {
        "account_id": {"type": "integer"},
        "category_id": {"type": "integer"},
        "payee_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "cleared": {"type": "boolean"},
        "amount": {"type": "number"},
    },
}
