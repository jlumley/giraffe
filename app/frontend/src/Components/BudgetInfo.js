import React, { useEffect, useState } from 'react';

import { centsToMoney } from '../utils/money_utils';
import categoryRequests from '../requests/category';
import instance from '../axois';

import MoneyInput from './Inputs/MoneyInput';
import Autosuggest from './Inputs/Autosuggest';
import DateInput from './Inputs/DateInput';

import '../style/BudgetInfo.css'

export function BudgetInfo({ category_ids, currentDate }) {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [totalAssigned, setTotalAssigned] = useState(0);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [targetTypesArray, setTargetTypesArray] = useState([]);
    const [targetTypesObj, setTargetTypesObj] = useState({});
    const [targetDate, setTargetDate] = useState('');
    const [targetAmount, setTargetAmount] = useState(null);
    const [targetType, setTargetType] = useState('');

    async function fetchTargetTypes() {
        const _types = (await instance.get(categoryRequests.fetchTargetTypes)).data
        const _typesArray = Object.keys(_types).map((t) => { return { value: t, label: _types[t] } })
        setTargetTypesObj(_types)
        setTargetTypesArray(_typesArray)
    }


    async function fetchCategories() {
        const today = currentDate.toISOString().slice(0, 10);
        const resp = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`)
        setSelectedCategories(resp.data.filter(c => category_ids.includes(c.id)))
    }

    async function autoAssignUnderfunded() {
        const today = currentDate.toISOString().slice(0, 10);
        for (const i in selectedCategories) {
            if (!selectedCategories[i].underfunded) continue
            await instance.put(`${categoryRequests.assignCategory}/${selectedCategories[i].id}`, { date: today, amount: selectedCategories[i].underfunded })
        }
        await fetchCategories()
    }

    const autoAssignUnderfundedButton = (_categories) => {
        const underfunded = _categories.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.underfunded
        }, 0)
        return (<div className="budgetInfoButton" onClick={autoAssignUnderfunded}> {`Underfunded: ${centsToMoney(underfunded)}`}</div>)
    }

    function updateTargetType(type) {
        if (type) {
            setTargetType(type.value)
        } else {
            setTargetType(null)
        }
    }

    function updateCategoryTarget() {
        if (!category_ids) return
        if (targetType) {
            instance.put(`${categoryRequests.updateCategoryTarget}/${category_ids[0]}`, {
                target_amount: parseInt(targetAmount * 100),
                target_type: targetType,
                target_date: targetDate ? targetDate.toISOString().slice(0, 10) : ''
            })
        }
    }

    function deleteCategoryTarget() {
        instance.delete(`${categoryRequests.DeleteCategoryTarget}/${category_ids[0]}`)
        setTargetType(null)
        setTargetAmount(null)
        setTargetDate(null)
    }

    function categoryTarget() {
        if (selectedCategories.length !== 1) return
        const startingValue = selectedCategories[0].target_type;
        const startingLabel = targetTypesObj[selectedCategories[0].target_type];
        const categoryName = selectedCategories[0].name;
        return (
            <div className="categoryTarget">
                <div className="categoryTargetTitle">{categoryName} Target</div>
                <div className="categoryTargetType"> <Autosuggest startingValue={{ value: startingValue, label: startingLabel }} options={targetTypesArray} allowEmpty={true} updateMethod={updateTargetType} /> </div>
                {(targetType) && (<div className="categoryTargetAmount"> <MoneyInput startingValue={targetAmount} updateMethod={(value) => { setTargetAmount(value) }} /></div>)}
                {(targetType === "savings_target") && (<div className="categoryTargetDate"> <DateInput selected={targetDate} onChange={(date) => { setTargetDate(date) }} /></div>)}
                {(targetType) && (<div className="budgetInfoButton" onClick={deleteCategoryTarget}> Remove Target</div>)}
            </div>
        )
    }

    useEffect(() => {
        fetchCategories()
    }, [category_ids, currentDate])
    useEffect(() => {
        updateCategoryTarget()
    }, [targetType, targetAmount, targetDate])
    useEffect(() => {
        fetchTargetTypes()
    }, [])

    useEffect(() => {
        setTotalAvailable(selectedCategories.reduce((currentValue, { balance }) => {
            return currentValue + balance
        }, 0))
        setTotalAssigned(selectedCategories.reduce((currentValue, { assigned_this_month }) => {
            return currentValue + assigned_this_month
        }, 0))
        if (selectedCategories.length === 1) {
            setTargetType(selectedCategories[0].target_type)
            setTargetAmount(selectedCategories[0].target_amount / 100)
            setTargetDate(new Date(selectedCategories[0].target_date))
        } else {
            setTargetType(null)
            setTargetAmount(null)
            setTargetDate(null)
        }
    }, [selectedCategories])


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
            {autoAssignUnderfundedButton(selectedCategories)}
        </div>
        {categoryTarget(targetType, targetAmount, targetDate)}
    </div>);
}
