import React, { useState, useEffect } from 'react'
import instance from '../axois';
import { CategoryGroup } from './CategoryGroup'
import ArrowLeftCircleOutlineIcon from 'mdi-react/ArrowLeftCircleOutlineIcon';
import ArrowRightCircleOutlineIcon from 'mdi-react/ArrowRightCircleOutlineIcon';
import TabPlusIcon from 'mdi-react/TabPlusIcon'

import categoryRequests from '../requests/category';
import accountRequests from '../requests/account';

import '../style/Budget.css'
import { BudgetInfo } from './BudgetInfo';
import { centsToMoney } from '../utils/money_utils'


export function Budget({ smallScreen }) {

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newCategoryGroups, setNewCategoryGroups] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [readyToAssign, setReadyToAssign] = useState(0);
  const [underfunded, setUnderfunded] = useState(0);

  useEffect(() => {
    fetchCategoryGroups()
    fetchReadyToAssign()
  }, [])
  useEffect(() => { fetchReadyToAssign() }, [currentDate])


  const fetchReadyToAssign = () => {
    async function _fetchReadyToAssign() {
      const category = await instance.get(`${categoryRequests.fetchCategory}/1/${currentDate.toISOString().slice(0, 10)}`)
      setReadyToAssign(category.data.balance)
    }
    _fetchReadyToAssign()
  }

  const fetchUnderfunded = () => {
    async function _fetchUnderfunded() {
      const categories = await instance.get(`${categoryRequests.fetchCategory}/${currentDate.toISOString().slice(0, 10)}`)
      const underfunded = categories.data.reduce((currentValue, nextValue) => {
        return currentValue + nextValue.underfunded
      }, 0)
      setUnderfunded(underfunded)
    }
    _fetchUnderfunded()
  }

  const fetchCategoryGroups = () => {
    async function _fetchCategoryGroups() {
      const categoryGroups = await instance.get(`${categoryRequests.fetchAllCategoryGroups}`)
      setCategoryGroups(categoryGroups.data)
    }
    _fetchCategoryGroups()
  }

  const selectCategory = (category_id) => {
    let newSelections = [...selectedCategories]
    if (selectedCategories.includes(category_id)) {
      newSelections = (selectedCategories.filter(e => { return e !== category_id }))
    } else {
      newSelections.push(category_id)
    }
    setSelectedCategories(newSelections)
  }

  const categoryGroup = (name) => {
    return (<CategoryGroup
      name={name}
      currentDate={currentDate}
      smallScreen={smallScreen}
      updateAssignedTotalAssigned={fetchReadyToAssign}
      updateUnderfunded={fetchUnderfunded}
      selectCategory={selectCategory} />)
  }

  const createNewCategoryGroup = () => {
    const newCategoryGroupName = `New Category Group ${newCategoryGroups.length}`
    setNewCategoryGroups(newCategoryGroups.concat(categoryGroup(newCategoryGroupName)))
  }

  const budgetExtraInfo = () => {
    if (smallScreen) return
    return <BudgetInfo category_ids={selectedCategories} currentDate={currentDate} />
  }

  function updateDate(monthAdjustment) {
    var tmp_date = new Date(currentDate.setDate(1));
    tmp_date = new Date(tmp_date.setMonth(tmp_date.getMonth() + monthAdjustment));

    const diff_months = (
      (tmp_date.getFullYear() - new Date().getFullYear()) * 12 +
      (tmp_date.getMonth() - new Date().getMonth())
    );

    var newCurrentDate = new Date();
    // if temp date is in the future set the day to the first date of the month
    if (diff_months > 0) {
      newCurrentDate = new Date(tmp_date.getFullYear(), tmp_date.getMonth(), 1)
    }
    // if temp date is in the past set the day to the last date of the month
    else if (diff_months < 0) {
      newCurrentDate = new Date(tmp_date.getFullYear(), tmp_date.getMonth() + 1, 0)
    }

    if (newCurrentDate !== currentDate) {
      setCurrentDate(newCurrentDate);
    }
  }

  function prevMonth() {
    updateDate(-1)
  }
  function nextMonth() {
    updateDate(1)
  }

  const getMonthString = () => {
    return `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`
  }

  return (
    <div className="budgetWorkspace">
      <div className="budgetContent">
        <div className="budgetHeader">
          <div className="monthSelector">
            < ArrowLeftCircleOutlineIcon onClick={prevMonth} className="arrowDiv" />
            <div className="currentMonth"> {getMonthString()} </div>
            < ArrowRightCircleOutlineIcon onClick={nextMonth} className="arrowDiv" />
          </div>
          <div className="newCategoryGroup" onClick={createNewCategoryGroup}>
            <TabPlusIcon size={16} />&nbsp;Category Group
          </div>
          <div className="budgetStatDiv">
            <div className={`budgetStatBox ${readyToAssign < 0 ? 'negativeToBeAssigned' : ''} ${readyToAssign === 0 ? 'neutralToBeAssigned' : ''} ${readyToAssign > 0 ? 'positiveToBeAssigned' : ''}`}>
              Ready To Assign: <br /> {centsToMoney(readyToAssign)}
            </div>
            <div className={`budgetStatBox`}>
              Underfunded: <br /> {centsToMoney(underfunded)}
            </div>
          </div>
        </div>
        <table className="budgetColumnTitles">
          <td className="categeorySelectedColumn"></td>
          <td className="categeoryNameColumn">Category</td>
          <td className="categeoryAssignedColumn">Assigned</td>
          {(!smallScreen) && (<td className="categeorySpentColumn">Spent</td>)}
          <td className="categeoryAvailableColumn">Available</td>
        </table>
        <div className="budgetCategories">
          {(categoryGroups.map((name) => {
            return categoryGroup(name)
          }))}
          {newCategoryGroups}
        </div>
      </div>
      {budgetExtraInfo()}
    </div >
  );


}
