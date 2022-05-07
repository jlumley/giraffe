import React, { useEffect, useState } from 'react';
import instance from '../axois';
import transactionRequests from '../requests/transaction';
import categoryRequests from '../requests/category';

import { centsToMoney } from '../utils/money_utils'
import CheckboxBlankCircleOutlineIcon from 'mdi-react/CheckboxBlankCircleOutlineIcon'
import CheckboxMarkedCircleIcon from 'mdi-react/CheckboxMarkedCircleIcon'

import '../style/Category.css'
import { MoneyInput } from './Inputs/MoneyInput';


export function Category({
    category,
    currentDate,
    smallScreen,
    updateAssignedTotalAssigned,
    updateUnderfunded,
    selectCategory
}) {
    const [categoryName, setCategoryName] = useState(category.name);
    const [categoryAssigned, setCategoryAssigned] = useState(category.assigned_this_month / 100);
    const [categorySpent, setCategorySpent] = useState(0);
    const [categoryBalance, setCategoryBalance] = useState(0);
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

            setCategoryBalance(resp.data.balance)
            setCategoryAssigned(resp.data.assigned_this_month / 100)
        }
        _fetchCategory()
    };

    useEffect(() => {
        fetchTransactions()
        fetchCategory()
        updateAssignedTotalAssigned()
        updateUnderfunded()
    }, [categoryAssigned, currentDate])


    const handleChangeCategoryName = (event) => {
        setCategoryName(event.target.value);
    }

    const updateCategoryName = (event) => {
        instance.put(
            `${categoryRequests.updateCategory}${category.id}`,
            { name: event.target.value }
        )
    }

    function selectCurrentCategory() {
        setSelected(!selected)
        selectCategory(category.id)
    }

    const ifSelected = () => {
        if (category.credit_card) return
        if (selected) {
            return <CheckboxMarkedCircleIcon size={15} className="selectedIcon" onClick={selectCurrentCategory} />
        } else {
            return <CheckboxBlankCircleOutlineIcon size={15} className="selectedIcon" onClick={selectCurrentCategory} />
        }
    }

    const updateCategoryAssignment = (newValue) => {

        const req_data = {
            amount: (newValue - categoryAssigned) * 100,
            date: currentDate.toISOString().slice(0, 10)
        }
        if (req_data.amount < 0) {
            instance.put(`${categoryRequests.unassignCategory}${category.id}`, req_data)
        }
        else if (req_data.amount > 0) {
            instance.put(`${categoryRequests.assignCategory}${category.id}`, req_data)
        }
        setCategoryAssigned(newValue)
    }


    const category_amount = (amount) => {
        return centsToMoney(amount)
    }


    return (
        <tr className="categoryRow">
            {(!smallScreen) && (<td className="selectedColumn">{ifSelected()}</td>)}
            <td className="nameColumn">
                {(!category.credit_card) && (<input className="categoryName" type="text" value={categoryName} onChange={handleChangeCategoryName} onBlur={updateCategoryName} />)}
                {(category.credit_card) && (<input className="categoryName" type="text" value={categoryName} />)}
            </td>
            <td className="assignedColumn"><MoneyInput startingValue={categoryAssigned} updateMethod={updateCategoryAssignment} /></td>
            {(!smallScreen) && (<td className="spentColumn">{category_amount(categorySpent)}</td>)}
            <td className="balanceColumn">{category_amount(categoryBalance)}</td>
        </tr >
    );
}
