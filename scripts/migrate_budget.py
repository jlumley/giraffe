import argparse
import json
import requests

from datetime import datetime

TODAY = datetime.today().strftime('%Y-%m-%d')

def fetch_payees(old_url):

    return requests.get(f"{old_url}/api/payee").json()


def fetch_categories(old_url):

    return requests.get(f"{old_url}/api/category/{TODAY}").json()


def fetch_accounts(old_url):
    
    return requests.get(f"{old_url}/api/account").json()


def fetch_transactions(old_url):
    
    return requests.get(f"{old_url}/api/transaction").json()

def main():
    parser = argparse.ArgumentParser()
    
    parser.add_argument("old_url", type=str, help="where to fetch data")
    parser.add_argument("new_url", type=str, help="where to push data")

    args = parser.parse_args()
    

    payees = fetch_payees(args.old_url)
    accounts = fetch_accounts(args.old_url)
    categories = fetch_categories(args.old_url)
    transactions = fetch_transactions(args.old_url) 
    
    

    print(payees)

    print()
    print(accounts)
    ## when parsing transactions skip transfers!!!!!!!!!!!!!!!!
    

    pass 


if __name__ == "__main__":
    main()

