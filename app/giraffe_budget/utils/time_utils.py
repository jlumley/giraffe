import datetime
import re

def is_valid_date(date_str):
    """
    date must be in format YYYY-MM-DD
    """
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", date_str)
    if not m:
        raise ValueError(f"date: {date_str} does not match format YYYY-MM-DD")
    
    year = m.group(1)
    month = m.group(2)
    day = m.group(3)
    datetime.datetime(year, month, day)

def datestr_to_sqlite_date(date_str):
    return re.sub("-", "", date_str)


def sqlite_date_to_datestr(sql_date):
    if not sql_date:
        return None
    sql_date = str(sql_date)
    return f"{sql_date[:4]}-{sql_date[4:6]}-{sql_date[6:8]}"


def get_first_of_the_month(sql_date):
    m = re.search(r"(\d{4})(\d{2})(\d{2})", str(sql_date))
    year = m.group(1)
    month = m.group(2)
    return int(f"{year}{month}01")


def diff_month(sql_date1, sql_date2):
    m1 = re.search(r"(\d{4})(\d{2})(\d{2})", str(sql_date1))
    m2 = re.search(r"(\d{4})(\d{2})(\d{2})", str(sql_date2))
    x = (int(m1.group(1)) * 12) + int(m1.group(2))
    y = (int(m2.group(1)) * 12) + int(m2.group(2))
    return abs(x - y) + 1
