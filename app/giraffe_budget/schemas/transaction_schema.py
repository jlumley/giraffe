POST_TRANSACTION_CREATE_SCHEMA = {
    "type": "object",
    "properties": {
        "account_id": {"type": "string"},
        "categories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "category_id": {"type": "string"},
                    "amount": {"type": "integer"},
                },
            },
        },
        "payee_id": {"type": "string"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "cleared": {"type": "boolean"},
    },
    "required": ["account_id", "date", "cleared", "categories"],
}


PUT_TRANSACTION_UPDATE_SCHEMA = {
    "type": "object",
    "properties": {
        "account_id": {"type": "string"},
        "categories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "category_id": {"type": "string"},
                    "amount": {"type": "integer"},
                },
            },
        },
        "payee_id": {"type": "string"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "cleared": {"type": "boolean"},
    },
}
