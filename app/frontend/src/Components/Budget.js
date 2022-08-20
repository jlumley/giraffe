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


export function Budget({ mobile }) {

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(`${new Date().getFullYear()}-${new Date().getMonth()+1}`);
  const [newCategoryGroups, setNewCategoryGroups] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [readyToAssign, setReadyToAssign] = useState(0);
  const [underfunded, setUnderfunded] = useState(0);
  const [categories, setCategories] = useState([]);

  const categeoryNameTitleStyle = {
    minWidth: '30px',
    width: '20%',
    textAlign: 'center',
  }

  const categeoryAmountTitleStyle = {
    minWidth: '30px',
    width: '15%',
    textAlign: 'center',
  }

  useEffect(() => {
    fetchCategories()
    fetchCategoryGroups()
  }, [])

  useEffect(() => {
    fetchReadyToAssign()
    fetchUnderfunded()
  }, [categories])


  useEffect(() => {
    updateCurrentDate()
  }, [currentMonth])

  useEffect(() => {
    fetchCategories()
  }, [currentDate])

  async function updateCurrentDate(){
    const year = parseInt(currentMonth.split("-")[0])
    let month = parseInt(currentMonth.split("-")[1])-1
    let day = new Date().getDate();
      
    const diff_months = (
    //https://stackoverflow.com/questions/18624326/getmonth-in-javascript-gives-previous-month
      (year - new Date().getFullYear()) * 12 +
      (month - new Date().getMonth())
    );
    // if temp date is in the future set the day to the first date of the month
    if (diff_months > 0) {
        day = 1;
    }
    // if temp date is in the past set the day to the last date of the month
    else if (diff_months < 0) {
        day = -1;
        month += 1;
    }
    setCurrentDate(new Date(year, month, day))
  }

  async function fetchReadyToAssign() {
    setReadyToAssign(categories.reduce(
      (prev, next) => {
        if (next.id === "ead604f7-d9bd-4f3e-852d-e04c2d7a71d7") return next.balance
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
      mobile={mobile}
      setSelectedCategories={setSelectedCategories}
      selectedCategories={selectedCategories} />)
  }

  const createNewCategoryGroup = () => {
    const newCategoryGroupName = `New Category Group ${newCategoryGroups.length}`
    setNewCategoryGroups(newCategoryGroups.concat(categoryGroup(newCategoryGroupName)))
  }

  const budgetExtraInfo = () => {
    if (mobile) return
    return <BudgetInfo
      categories={categories}
      categoryIds={selectedCategories}
      currentDate={currentDate}
      fetchCategories={fetchCategories} />
  }

  function nextMonth() {
        const month = (parseInt(currentMonth.split("-")[1]) < 12) ? parseInt(currentMonth.split("-")[1]) + 1 : 1 
        const year =  (month == 1) ? parseInt(currentMonth.split("-")[0]) + 1 : parseInt(currentMonth.split("-")[0])
        setCurrentMonth(`${year}-${String(month).padStart(2, '0')}`)
  }
  
  function prevMonth() {
        const month = (parseInt(currentMonth.split("-")[1]) > 1) ? parseInt(currentMonth.split("-")[1]) - 1 : 12 
        const year =  (month == 12) ? parseInt(currentMonth.split("-")[0]) - 1 : parseInt(currentMonth.split("-")[0])
        setCurrentMonth(`${year}-${String(month).padStart(2, '0')}`)
  }

  function getBudgetStatBackgroundColor(value) {
    if (value === 0) {
      return 'var(--positive-highlight)'
    }
    else if (value > 0) {
      return 'var(--neutral-highlight)'
    }
    else {
      return 'var(--negative-highlight)'
    }
  }

  return (
    <div className="budgetWorkspace">
      <div className="budgetContent">
        <div className="budgetHeader">
          <div className="monthSelector">
            <ArrowLeftCircleOutlineIcon size={30} onClick={prevMonth} className="arrowDiv" />
            <input className="currentMonth" type="month" value={currentMonth} onChange={(e) => {setCurrentMonth(e.target.value)}}/>  
            <ArrowRightCircleOutlineIcon size={30} onClick={nextMonth} className="arrowDiv" />
          </div>
          <div className="budgetStatDiv">
            <div className="budgetStatBox" style={{backgroundColor: getBudgetStatBackgroundColor(readyToAssign)}}>
              Ready To Assign: <br /> {centsToMoney(readyToAssign)}
            </div>
            <div className="budgetStatBox" style={{backgroundColor: getBudgetStatBackgroundColor(underfunded)}}>
              Underfunded: <br /> {centsToMoney(underfunded)}
            </div>
          <div className="newCategoryGroup" onClick={createNewCategoryGroup}>
            <TabPlusIcon size={16} />
          </div>
          </div>
        </div>
        <table className="budgetColumnTitles">
          <td className="categeorySelectedColumn"></td>
          <td style={categeoryNameTitleStyle}>Category</td>
          <td style={categeoryAmountTitleStyle}>Assigned</td>
          {(!mobile) && (<td style={categeoryAmountTitleStyle}>Spent</td>)}
          <td style={categeoryAmountTitleStyle}>Available</td>
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
