import React, { useEffect, useState } from 'react';
import instance from '../axois';
import categoryRequests from '../requests/category';

import { centsToMoney } from '../utils/money_utils'
import CheckboxBlankCircleOutlineIcon from 'mdi-react/CheckboxBlankCircleOutlineIcon'
import CheckboxMarkedCircleIcon from 'mdi-react/CheckboxMarkedCircleIcon'

import '../style/Category.css'
import MoneyInput from './Inputs/MoneyInput';


export function Category({
    category,
    currentDate,
    smallScreen,
    selectCategory,
    updateAssignedTotalAssigned,
    updateUnderfunded,
}) {
    const [categoryName, setCategoryName] = useState(category.name);
    const [categoryAssigned, setCategoryAssigned] = useState(category.assigned_this_month / 100);
    const [categoryBalance, setCategoryBalance] = useState(category.balance);
    const [categorySpent, setCategorySpent] = useState(category.spent_this_month);
    const [selected, setSelected] = useState(false);

    useEffect( () => {
        setCategoryName(category.name)
        setCategoryAssigned(category.assigned_this_month / 100)
        setCategoryBalance(category.balance)
        setCategorySpent(category.spent_this_month)
    }, [category, currentDate])

    const fetchCategory = () => {
        async function _fetchCategory() {
            const today = currentDate.toISOString().slice(0, 10);
            const resp = await instance.get(`${categoryRequests.fetchCategory}/${category.id}/${today}`)

            setCategoryBalance(resp.data.balance)
            setCategorySpent(resp.data.spent_this_month)
            setCategoryAssigned(resp.data.assigned_this_month / 100)
        }
        _fetchCategory()
    };

    useEffect(() => {
        if (categoryAssigned === category.assigned_this_month/100) return
        fetchCategory()
        updateAssignedTotalAssigned()
        updateUnderfunded()
    }, [categoryAssigned])


    const handleChangeCategoryName = (event) => {
        setCategoryName(event.target.value);
    }

    const updateCategoryName = (event) => {
        if (event.target.value === category.name) return
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
        if (parseInt(newValue) === categoryAssigned) return
        const req_data = {
            amount: Math.round((newValue - categoryAssigned) * 100),
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

    return (
        <tr className="categoryRow">
            {(!smallScreen) && (<td className="selectedColumn">{ifSelected()}</td>)}
            <td className="nameColumn">
                {(!category.credit_card) && (<input className="categoryName" type="text" value={categoryName} onChange={handleChangeCategoryName} onBlur={updateCategoryName} />)}
                {(category.credit_card) && (<input className="categoryName" type="text" value={categoryName} />)}
            </td>
            <td className="assignedColumn"><MoneyInput startingValue={categoryAssigned} onBlur={updateCategoryAssignment} /></td>
            {(!smallScreen) && (<td className="spentColumn">{centsToMoney(categorySpent)}</td>)}
            <td className="balanceColumn">{centsToMoney(categoryBalance)}</td>
        </tr >
    );
}
