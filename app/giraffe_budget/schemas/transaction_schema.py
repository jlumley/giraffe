POST_TRANSACTION_CREATE_SCHEMA = {
    "type": "object",
    "properties": {
        "account_id": {"type": "integer"},
        "categories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "category_id": {"type": "integer"},
                    "amount": {"type": "integer"},
                },
            },
        },
        "payee_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "cleared": {"type": "boolean"},
        "amount": {"type": "integer"},
    },
    "required": ["account_id", "date", "cleared", "amount"],
}

TRANSFER_SCHEMA = {
    "type": "object",
    "properties": {
        "from_account_id": {"type": "integer"},
        "to_account_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "amount": {"type": "integer"},
    },
    "required": ["from_account_id", "to_account_id", "date", "amount"],
}

PUT_TRANSACTION_UPDATE_SCHEMA = {
    "type": "object",
    "properties": {
        "account_id": {"type": "integer"},
        "categories": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "category_id": {"type": "integer"},
                    "amount": {"type": "integer"},
                },
            },
        },
        "payee_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "cleared": {"type": "boolean"},
        "amount": {"type": "integer"},
    },
    "required": ["account_id", "categories", "date", "memo", "cleared", "amount"],
}
