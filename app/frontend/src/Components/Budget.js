import React, { useState, useEffect } from 'react'
import instance from '../axois';
import { CategoryGroup } from './CategoryGroup'
import ArrowLeftCircleOutlineIcon from 'mdi-react/ArrowLeftCircleOutlineIcon';
import ArrowRightCircleOutlineIcon from 'mdi-react/ArrowRightCircleOutlineIcon';
import TabPlusIcon from 'mdi-react/TabPlusIcon'

import categoryRequests from '../requests/category';

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
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
    fetchCategoryGroups()
  }, [])

  useEffect(() => {
    fetchReadyToAssign()
    fetchUnderfunded()
  }, [categories])
  

  useEffect(() => {
    fetchCategories()
  }, [currentDate])


  async function fetchReadyToAssign() {
    setReadyToAssign(categories.reduce(
      (prev, next) => { 
        if (next.id === 1) return next.balance
        return prev
      },
      0
    ))
  }

  async function fetchUnderfunded() {
    setUnderfunded(categories.reduce((currentValue, nextValue) => {
      return currentValue + nextValue.underfunded
    }, 0))
  }

  async function fetchCategories() {
    const today = currentDate.toISOString().slice(0, 10);
    const resp = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`)
    setCategories(resp.data)
}

  async function fetchCategoryGroups() {
    const categoryGroups = await instance.get(`${categoryRequests.fetchAllCategoryGroups}`)
    setCategoryGroups(categoryGroups.data)
  }

  const categoryGroup = (name) => {
    return (<CategoryGroup
      name={name}
      categories={categories}
      fetchCategories={fetchCategories}
      currentDate={currentDate}
      smallScreen={smallScreen}
      setSelectedCategories={setSelectedCategories}
      selectedCategories={selectedCategories} />)
  }

  const createNewCategoryGroup = () => {
    const newCategoryGroupName = `New Category Group ${newCategoryGroups.length}`
    setNewCategoryGroups(newCategoryGroups.concat(categoryGroup(newCategoryGroupName)))
  }

  const budgetExtraInfo = () => {
    if (smallScreen) return
    return <BudgetInfo 
      categories={categories}
      categoryIds={selectedCategories} 
      currentDate={currentDate} 
      fetchCategories={fetchCategories}/>
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
