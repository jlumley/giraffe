import time

from datetime import datetime


def datestr_to_timestamp(datestring):
    return time.mktime(datetime.strptime(datestring, "%d-%m-%Y").timetuple())


def diff_month(d1, d2):
    return (d1.year - d2.year) * 12 + d1.month - d2.month
