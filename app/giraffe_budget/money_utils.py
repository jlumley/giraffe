import re

def money_to_cents(money):
    ''' Convert money to cents int
    '''
    return int(float(money*100))

def cents_to_money(cents):
    ''' Convert cents to money
    '''
    if not cents:
        return 0.00
    return round(float(cents/100),2)

