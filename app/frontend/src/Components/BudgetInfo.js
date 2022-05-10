import React, { useEffect, useState } from 'react';


import '../style/BudgetInfo.css'
import { centsToMoney } from '../utils/money_utils';
import categoryRequests from '../requests/category';
import instance from '../axois';
import { MoneyInput } from './Inputs/MoneyInput';
import DatePicker from 'react-datepicker';
import { Autosuggest } from './Inputs/Autosuggest';

export function BudgetInfo({ category_ids, currentDate }) {
    const [categories, setCategories] = useState([]);
    const [totalAssigned, setTotalAssigned] = useState(0);
    const [totalAvailable, setTotalAvailable] = useState(0);

    async function fetchCategories() {
        const today = currentDate.toISOString().slice(0, 10);
        const resp = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`)
        setCategories(resp.data.filter(c => category_ids.includes(c.id)))
    }

    async function autoAssignUnderfunded() {
        const today = currentDate.toISOString().slice(0, 10);
        for (const i in categories) {
            console.log(`assigning money to category: ${categories[i].name}`)
            if (!categories[i].underfunded) continue
            await instance.put(`${categoryRequests.assignCategory}/${categories[i].id}`, { date: today, amount: categories[i].underfunded })
        }
        await fetchCategories()
    }

    const autoAssignUnderfundedButton = (_categories) => {
        const underfunded = _categories.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.underfunded
        }, 0)
        return (<div className="underfundedButton" onClick={autoAssignUnderfunded}> {`Underfunded: ${centsToMoney(underfunded)}`}</div>)
    }

    const categoryTarget = (_categories) => {
        if (_categories.length !== 1) return
        return (
            <div className="categoryTarget">
                <MoneyInput startingValue={_categories[0].target_amount} />
                <DatePicker selected={new Date(_categories[0].target_date)} />
                <Autosuggest startingValue={_categories[0].target_type} />
            </div>

        )
    }

    useEffect(() => {
        fetchCategories()
    }, [category_ids, currentDate])

    useEffect(() => {
        setTotalAvailable(categories.reduce((currentValue, { balance }) => {
            return currentValue + balance
        }, 0))
        setTotalAssigned(categories.reduce((currentValue, { assigned_this_month }) => {
            return currentValue + assigned_this_month
        }, 0))
    }, [categories])


    return (<div className="budgetInfo">
        <div className="categoryStats">
            Total Assigned
            <br />
            {centsToMoney(totalAssigned)}
            <br />
            Total Available
            <br />
            {centsToMoney(totalAvailable)}
        </div>
        <div className="autoAssign">
            {autoAssignUnderfundedButton(categories)}
        </div>
        {categoryTarget(categories)}
    </div>);
}
