import React, { useEffect, useState } from 'react';
import { Text } from 'react';

import '../style/BudgetInfo.css'
import { centsToMoney } from '../utils/money_utils';
import categoryRequests from '../requests/category';
import instance from '../axois';

export function BudgetInfo({ category_ids, currentDate }) {
    const [categories, setCategories] = useState([]);
    const [totalAssigned, setTotalAssigned] = useState(0);
    const [totalAvailable, setTotalAvailable] = useState(0);

    async function fetchCategories() {
        const today = currentDate.toISOString().slice(0, 10);
        const resp = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`)
        setCategories(resp.data.filter(c => category_ids.includes(c.id)))
    }

    const autoAssignUnderfundedButton = (_categories) => {
        const underFunded = _categories.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.underfunded
        }, 0)
        return (<div> {`Underfunded: ${centsToMoney(underFunded)}`}</div>)
    }

    const categoryTarget = (_categories) => {
        if (_categories.length !== 1) return
        return (
            `Target Amount: ${centsToMoney(_categories[0].target_amount)}`
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
        <div className="categoryTarget">
            {categoryTarget(categories)}
        </div>
    </div>);
}
