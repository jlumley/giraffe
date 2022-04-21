POST_TRANSFER_CREATE_SCHEMA = {
    "type": "object",
    "properties": {
        "from_account_id": {"type": "integer"},
        "to_account_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "amount": {"type": "integer"},
        "cleared": {"type": "boolean"},
    },
    "required": ["from_account_id", "to_account_id", "date", "amount", "cleared"],
}

PUT_TRANSFER_UPDATE_SCHEMA = {
    "type": "object",
    "properties": {
        "from_account_id": {"type": "integer"},
        "to_account_id": {"type": "integer"},
        "date": {"type": "string"},
        "memo": {"type": "string"},
        "amount": {"type": "integer"},
        "cleared": {"type": "boolean"},
    },
}
