import React, { useEffect, useState } from 'react';
import instance from '../axois';
import transactionRequests from '../requests/transaction';
import categoryRequests from '../requests/category';

import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon'
import CurrencyInput from 'react-currency-input-field';
import { centsToMoney } from '../utils/money_utils'
import CheckboxBlankCircleOutlineIcon from 'mdi-react/CheckboxBlankCircleOutlineIcon'
import CheckboxMarkedCircleIcon from 'mdi-react/CheckboxMarkedCircleIcon'

import '../style/Category.css'


export function Category({ category, currentDate, screenSize }) {
    const [categoryName, setCategoryName] = useState(category.name);
    const [categoryAssigned, setCategoryAssigned] = useState(0);
    const [categorySpent, setCategorySpent] = useState(0);
    const [categoryBalance, setCategoryBalance] = useState(0);
    const [tempAssigned, setTempAssgined] = useState(category.assigned_this_month / 100);
    const [selected, setSelected] = useState(false);

    const fetchTransactions = () => {
        async function _fetchTransactions() {
            // get today's date YYYY-MM-DD
            const today = currentDate.toISOString().slice(0, 10);
            const month_start = `${currentDate.toISOString().slice(0, 8)}01`
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
        }
        _fetchTransactions()
    }

    const fetchCategory = () => {
        async function _fetchCategory() {
            const today = currentDate.toISOString().slice(0, 10);
            const resp = await instance.get(`${categoryRequests.fetchCategory}/${category.id}/${today}`)

            setCategoryBalance(resp.data[0].balance)
            setCategoryAssigned(resp.data[0].assigned_this_month)
            setTempAssgined(resp.data[0].assigned_this_month / 100)
        }
        _fetchCategory()
    };

    useEffect(() => {
        fetchTransactions()
        fetchCategory()
    }, [categoryAssigned, currentDate])


    const handleChangeCategoryName = (event) => {
        setCategoryName(event.target.value);
    }
    const handleChangeCategoryAssigned = (event) => {
        setTempAssgined(event);
    }

    const updateCategoryName = (event) => {
        instance.put(
            `${categoryRequests.updateCategory}${category.id}`,
            { name: event.target.value }
        )
    }

    function selectCategory() {
        setSelected(!selected)
    }

    const ifSelected = () => {
        if (screenSize == "smallScreen") {
            return
        }
        if (selected) {
            return <CheckboxMarkedCircleIcon className="selectedIcon" onClick={selectCategory} />
        } else {
            return <CheckboxBlankCircleOutlineIcon className="selectedIcon" onClick={selectCategory} />
        }
    }

    const updateCategoryAssignment = (event) => {
        const req_data = {
            amount: (tempAssigned * 100 - categoryAssigned),
            date: currentDate.toISOString().slice(0, 10)
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
        <div>
            <div className="baseCategory" >
                {(false) && (< DotsVerticalIcon className="categoryOptions" />)}
                {ifSelected()}
                <div className={`categoryCell ${screenSize}CategoryNameBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}><input className="categoryInput" type="text" value={categoryName} onChange={handleChangeCategoryName} onBlur={updateCategoryName} /></div></div>
                <div className={`categoryCell ${screenSize}CategoryValueBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>< CurrencyInput className="categoryInput" maxLength="8" prefix="$" value={tempAssigned} onValueChange={handleChangeCategoryAssigned} onBlur={updateCategoryAssignment} /></div></div>
                {(screenSize === "largeScreen") && (<div className={`categoryCell ${screenSize}CategoryValueBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>{centsToMoney(categorySpent)}</div></div>)}
                <div className={`categoryCell ${screenSize}CategoryValueBox`}><div className={`categoryValueOutline ${screenSize}CategoryValueOutline`}>{centsToMoney(categoryBalance)}</div></div>
            </div>
            <hr className="categoryDividingLine"></hr>
        </div>
    );
}
