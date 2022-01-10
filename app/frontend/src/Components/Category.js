import React, { useState, useEffect} from 'react'
import instance from '../axois';
import transactionRequests from '../requests/transaction';

import {centsToMoney} from '../utils/money_utils'

function Category({category}) {
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

//    console.log(category);
//    console.log(transactions);

    return (
        <div>
            {/**category name */}
            {"Name: "}
            {category.name}
            {" Assigned this month: "}
            {/** category assigned this month  */}
            {centsToMoney(category.assigned_this_month)}
            {" Spent this month: "}
            {/**category transactions this month */}
            {centsToMoney(transactions.reduce((a, b) => a + b.amount, 0)) }
            {" Current Balance: "}
            {/**category available */}
            {centsToMoney(category.balance)}
        </div>
    )
}

export default Category
