import React, { useEffect, useState } from 'react';
import instance from '../axois';
import transactionRequests from '../requests/transaction';
import categoryRequests from '../requests/category';


import CurrencyInput from 'react-currency-input-field';
import { centsToMoney } from '../utils/money_utils'

import '../style/Category.css'


export function Category({ category, current_date, screen_size }) {
    const [categoryName, setCategoryName] = useState(category.name);
    const [categoryAssigned, setCategoryAssigned] = useState(0);
    const [categorySpent, setCategorySpent] = useState(0);
    const [categoryBalance, setCategoryBalance] = useState(0);
    const [tempAssigned, setTempAssgined] = useState(category.assigned_this_month / 100);

    const fetchTransactions = () => {
        async function _fetchTransactions() {
            // get today's date YYYY-MM-DD
            const today = current_date.toISOString().slice(0, 10);
            const month_start = `${current_date.toISOString().slice(0, 8)}01`
            // get all transactions for this category
            const params = {
                categories: category.id,
                after: month_start,
                before: today
            };
            const resp = await instance.get(transactionRequests.fetchTransactions, { params });
            var parsed_transactions = [];
            resp.data.forEach(t => {
                var amount = 0;
                t.categories.forEach(c => {
                    if (c.category_id === category.id) {
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
            setCategorySpent(parsed_transactions.reduce((a, b) => a + b.amount, 0));
            console.log(categorySpent)
        }
        _fetchTransactions()
    }

    const fetchCategory = () => {
        async function _fetchCategory() {
            const today = current_date.toISOString().slice(0, 10);
            const resp = await instance.get(`${categoryRequests.fetchCategory}/${category.id}/${today}`)

            setCategoryBalance(resp.data[0].balance)
        }
        _fetchCategory()
    };

    useEffect(() => {
        fetchTransactions()
        fetchCategory()
    }, [categoryAssigned, current_date])


    const handleChangeCategoryName = (event) => {
        setCategoryName(event.target.value);
    }
    const handleChangeCategoryAssigned = (event) => {
        setTempAssgined(event);
    }

    const updateCategoryName = (event) => {
        instance.put(
            `${categoryRequests.updateCategory}${category.id}`,
            {
                'name': category.name
            }
        )
    }

    const updateCategoryAssignment = (event) => {
        const req_data = {
            'amount': (tempAssigned * 100 - categoryAssigned),
            'date': current_date.toISOString().slice(0, 10)
        }
        if (req_data.amount < 0) {
            instance.put(`${categoryRequests.unassignCategory}${category.id}`, req_data)
        }
        else if (req_data.amount > 0) {
            instance.put(`${categoryRequests.assignCategory}${category.id}`, req_data)
        }
        setCategoryAssigned(tempAssigned)
    }


    return (
        <div className="baseCategory" >
            <div className={`categoryCell ${screen_size}CategoryNameBox`}><div className={`categoryValueOutline ${screen_size}CategoryValueOutline`}><input className="categoryInput" type="text" value={categoryName} onChange={handleChangeCategoryName} onBlur={updateCategoryName} /></div></div>
            <div className={`categoryCell ${screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${screen_size}CategoryValueOutline`}>< CurrencyInput className="categoryInput" maxLength="8" prefix="$" value={tempAssigned} onValueChange={handleChangeCategoryAssigned} onBlur={updateCategoryAssignment} /></div></div>
            {(screen_size === "largeScreen") && (<div className={`categoryCell ${screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${screen_size}CategoryValueOutline`}>{centsToMoney(categorySpent)}</div></div>)}
            <div className={`categoryCell ${screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${screen_size}CategoryValueOutline`}>{centsToMoney(categoryBalance)}</div></div>
        </div>
    );
}
