from functools import wraps
from flask import request, current_app


def validate_request_body(schema=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Do something with your request here
            data = request.get_json()

            current_app.logger.info("Inside decorator")

            return f(*args, **kwargs)

        return decorated_function

    return decorator
