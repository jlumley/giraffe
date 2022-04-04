import React, { useEffect, useState } from 'react'
import instance from '../axois';
import { CategoryGroup } from './CategoryGroup'
import ArrowLeftCircleOutlineIcon from 'mdi-react/ArrowLeftCircleOutlineIcon';
import ArrowRightCircleOutlineIcon from 'mdi-react/ArrowRightCircleOutlineIcon';
import TabPlusIcon from 'mdi-react/TabPlusIcon'

import categoryRequests from '../requests/category';

import '../style/Budget.css'
import { BudgetInfo } from './BudgetInfo';

export function Budget({ smallScreen }) {

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newCategoryGroups, setNewCategoryGroups] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchCategoryGroups()
  }, [])


  const fetchCategoryGroups = () => {
    async function _fetchCategoryGroups() {
      const resp = await instance.get(`${categoryRequests.fetchAllCategoryGroups}`)
      setCategoryGroups(resp.data)
    }
    _fetchCategoryGroups()
  }

  const categoryGroup = (name) => {
    return <CategoryGroup name={name} currentDate={currentDate} smallScreen={smallScreen} />
  }
  const createNewCategoryGroup = () => {
    const newCategoryGroupName = `New Category Group ${newCategoryGroups.length}`
    setNewCategoryGroups(newCategoryGroups.concat(categoryGroup(newCategoryGroupName)))
  }

  const budgetExtraInfo = () => {
    if (smallScreen) return
    return <BudgetInfo selectedCategories={selectedCategories} />
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
          <div className="newCategoryGroup" onClick={createNewCategoryGroup}>
            <TabPlusIcon size={16} /> Category Group
          </div>
          <div className={"monthSelector"}>
            < ArrowLeftCircleOutlineIcon onClick={prevMonth} className="arrowDiv" />
            <div className="currentMonth"> {getMonthString()} </div>
            < ArrowRightCircleOutlineIcon onClick={nextMonth} className="arrowDiv" />
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
