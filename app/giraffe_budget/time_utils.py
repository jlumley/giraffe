import datetime
import time

def datestr_to_timestamp(datestring):
    return time.mktime(
        datetime.datetime.strptime(
            datestring, 
            "%d-%m-%Y"
        ).timetuple()
    )

