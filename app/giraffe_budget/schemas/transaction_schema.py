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

TRANSFER_SCHEMA = {
    "type": "object",
    "properties": {
        "from_account_id": {"type": "string"},
        "to_account_id": {"type": "string"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
    },
    "required": ["from_account_id", "to_account_id", "date", "categories"],
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
