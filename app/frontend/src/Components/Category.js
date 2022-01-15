import React, { useState, useEffect} from 'react'
import instance from '../axois';
import transactionRequests from '../requests/transaction';

import '../style/Category.css'

import {centsToMoney} from '../utils/money_utils'


function Category({category, screenSize}) {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchData(){
            // get today's date YYYY-MM-DD
            const today = new Date().toISOString().slice(0, 10);
            const month_start = `${new Date().toISOString().slice(0, 8)}01`
            // get all transactions for this category
            const params = {
                categories: category.id,
                after: month_start,
                before: today
            };
            const transactions = await instance.get(transactionRequests.fetchTransactions, {params});
            // parse transactions
            var parsed_transactions = [];
            transactions.data.forEach(t => {
                var amount = 0;
                t.categories.forEach(c => {
                    if (c.category_id == category.id){

                        amount += c.amount;
                    }
                });
                parsed_transactions.push(
                    {
                        date: t.date,
                        payee: t.payee_id,
                        amount: amount
                    }
                )
            });
            setTransactions(parsed_transactions)

        }
        fetchData()
    }, [category]);

    return (
        <div>
            <div className="baseCategory">
            <div className={`categoryNameBox ${screenSize}CategoryNameBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>{category.name}</div></div>
            <div className={`categoryValueBox ${screenSize}CategoryValueBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>{centsToMoney(category.assigned_this_month)}</div></div>
            {(screenSize == "largeScreen") && (<div className={`categoryValueBox ${screenSize}CategoryValueBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>{centsToMoney(transactions.reduce((a, b) => a + b.amount, 0))}</div></div> )}
            <div className={`categoryValueBox ${screenSize}CategoryValueBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>{centsToMoney(category.balance)}</div></div>
            </div>
        </div>
    )
}

export default Category
