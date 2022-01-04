import React, { useState, useEffect} from 'react'
import instance from './axois';
import categoryRequests from './requests/category';
import transactionRequests from './requests/transaction';

function Category({categoryId}) {
    const [category, setCategory] = useState([]);
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchData(){
            // get today's date YYYY-MM-DD
            const today = new Date().toISOString().slice(0, 10);
            const month_start = `${new Date().toISOString().slice(0, 8)}01`
            // get category data
            const category = await instance.get(`${categoryRequests.fetchCategory}/${categoryId}/${today}`);
            // get all transactions for this category
            const params = {
                categories: categoryId,
                after: month_start,
                before: today,
                limit: 500
            };
            const transactions = await instance.get(transactionRequests.fetchTransactions, {params});
            setCategory(category.data[0])
            // parse transactions
            var parsed_transactions = [];
            console.log(transactions);
            transactions.data.forEach(t => {
                var amount = 0;
                t.categories.forEach(c => {
                    if (c.category_id == categoryId){

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
    }, [categoryId]);

    console.log(category);
    console.log(transactions);
    console.log(transactions.reduce((a, b) => a + b.amount , 0 ));
    return (
        <div>
            {/**category name */}
            {"Name: "}
            {category.name}
            {" Assigned this month: "}
            {/** category assigned this month  */}
            {category.assigned_this_month}
            {" Spent this month: "}
            {/**category transactions this month */}
            { transactions.reduce((a, b) => a + b.amount, 0)}
            {" Current Balance: "}
            {/**category available */}
            {category.balance}
        </div>
    )
}

export default Category
