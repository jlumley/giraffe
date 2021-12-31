import time

from datetime import datetime


def datestr_to_timestamp(datestring):
    if not datestring:
        return None
    return time.mktime(datetime.strptime(datestring, "%Y-%m-%d").timetuple())


def timestamp_to_datestr(timestamp):
    if not timestamp:
        return None
    return datetime.fromtimestamp(timestamp).strftime("%Y-%m-%d")


def diff_month(d1, d2):
    return (d1.year - d2.year) * 12 + d1.month - d2.month
