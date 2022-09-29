import '../style/Category.css'
import CheckboxBlankCircleOutlineIcon from 'mdi-react/CheckboxBlankCircleOutlineIcon'
import CheckboxMarkedCircleIcon from 'mdi-react/CheckboxMarkedCircleIcon'
import MoneyInput from './Inputs/MoneyInput';
import React, { useEffect, useState } from 'react';
import categoryRequests from '../requests/category';
import instance from '../axois';
import { centsToMoney } from '../utils/money_utils'

export function Category({
    category,
    currentDate,
    mobile,
    selectedCategories,
    setSelectedCategories,
    fetchCategories
}) {
    const [categoryName, setCategoryName] = useState(category.name);
    const [categoryAssigned, setCategoryAssigned] = useState(category.assigned_this_month / 100);
    const [categoryBalance, setCategoryBalance] = useState(category.balance);
    const [categorySpent, setCategorySpent] = useState(category.spent_this_month);
    const [categoryUnderfunded, setCategoryUnderfunded] = useState(category.underfunded / 100);
    const [selected, setSelected] = useState(selectedCategories.includes(category.id));

    const [targetProgress, setTargetProgress] = useState(calculateTargetProgress());
    const [categoryBalanceColor, setCategoryBalanceColor] = useState("white")

    useEffect(() => {
        setCategoryName(category.name)
        setCategoryAssigned(category.assigned_this_month / 100)
        setCategoryBalance(category.balance)
        setCategorySpent(category.spent_this_month)
        setCategoryUnderfunded(category.underfunded / 100)
    }, [category])

    useEffect(() => {
        if (categoryBalance === 0) {
            setCategoryBalanceColor("lightblue")
        } else {
            setCategoryBalanceColor(categoryBalance > 0 ? "lightgreen" : "salmon")
        }
    }, [categoryBalance])

    useEffect(() => {
        if (categoryAssigned*100 === category.assigned_this_month) return
        fetchCategories()
        setCategoryUnderfunded(category.underfunded / 100)
    }, [categoryAssigned])

    useEffect(() => {
        setTargetProgress(calculateTargetProgress())
    }, [categoryAssigned, categoryUnderfunded])

    useEffect(() => {
        setSelected(selectedCategories.includes(category.id))
    }, [selectedCategories, category])

    function calculateTargetProgress() {
        if (categoryUnderfunded === 0) return 1
        if (categoryAssigned < 0 ) return 0
        const progress = (
            categoryAssigned
        ) / (categoryAssigned + categoryUnderfunded)
        return progress
    }

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
        let newSelections = [...selectedCategories]
        if (selectedCategories.includes(category.id)) {
            newSelections = (selectedCategories.filter(e => { return e !== category.id }))
        } else {
            newSelections.push(category.id)
        }
        setSelectedCategories(newSelections)
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
        if (Number(newValue) === categoryAssigned) return
        const req_data = {
            amount: Math.abs(Math.round((newValue - categoryAssigned) * 100)),
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

    const categoryNameInput = () => {
        return (
            <td className="categoryNameColumnStyle">
                <input className="categoryNameInputStyle" type="text" value={categoryName} onChange={handleChangeCategoryName} onBlur={updateCategoryName} />
                 <progress className="categoryTargetProgress" value={targetProgress} max={1}/> </td>
        )
    }

    return (
        <tr className="categoryRow">
            {(!mobile) && (<td className="selectedColumn">{ifSelected()}</td>)}
            {categoryNameInput()}
            <td className="categoryAmountColumnStyle"><MoneyInput startingValue={categoryAssigned} onBlur={updateCategoryAssignment} /></td>
            {(!mobile) && (<td className="categoryAmountColumnStyle">{centsToMoney(categorySpent)}</td>)}
            <td className="categoryAmountColumnStyle"><div className="categoryBalanceStyle" style={{backgroundColor: categoryBalanceColor}}>{centsToMoney(categoryBalance)}</div></td>
        </tr>
    );
}
