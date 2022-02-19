import React, { useEffect, useState } from 'react'
import instance from '../axois';
import { CategoryGroup } from './CategoryGroup'
<<<<<<< HEAD
import ArrowLeftCircleOutlineIcon from 'mdi-react/ArrowLeftCircleOutlineIcon';
import ArrowRightCircleOutlineIcon from 'mdi-react/ArrowRightCircleOutlineIcon';
import TabPlusIcon from 'mdi-react/TabPlusIcon'
=======
import { changeScreenSize } from './Layout';
import ArrowLeftCircleOutlineIcon from 'mdi-react/ArrowLeftCircleOutlineIcon';
import ArrowRightCircleOutlineIcon from 'mdi-react/ArrowRightCircleOutlineIcon';
>>>>>>> d917c69b2ce90816808120cacce7e329ab8398fa

import categoryRequests from '../requests/category';

import '../style/Budget.css'
import { BudgetInfo } from './BudgetInfo';

export function Budget({ screenSize }) {

  const [categoryGroups, setCategoryGroups] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newCategoryGroups, setNewCategoryGroups] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    fetchCategoryGroups()
  }, [])


  const fetchCategoryGroups = () => {
    async function _fetchCategoryGroups() {
      const today = currentDate.toISOString().slice(0, 10);
      const resp = await instance.get(`${categoryRequests.fetchAllCategoryGroups}`)
      setCategoryGroups(resp.data)
    }
    _fetchCategoryGroups()
  }

  const categoryGroup = (name) => {
    return <CategoryGroup name={name} currentDate={currentDate} screenSize={screenSize} />
  }
  const createNewCategoryGroup = () => {
    const newCategoryGroupName = `New Category Group ${newCategoryGroups.length}`
    setNewCategoryGroups(newCategoryGroups.concat(categoryGroup(newCategoryGroupName)))
  }

  const budgetExtraInfo = () => {
    if (screenSize === "largeScreen") {
      return <BudgetInfo selectedCategories={selectedCategories} />
    }
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
    this.updateDate = this.updateDate.bind(this)
    this.nextMonth = () => { this.updateDate(+1) };
    this.prevMonth = () => { this.updateDate(-1) };
  }

<<<<<<< HEAD
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
        <div className="newCategoryGroup">
          <TabPlusIcon onClick={createNewCategoryGroup} />
        </div>
        <div className={`monthSelector ${screenSize}MonthSelector`}>
          < ArrowLeftCircleOutlineIcon onClick={prevMonth} className="arrowDiv" />
          <div className="currentMonth"> {getMonthString()} </div>
          < ArrowRightCircleOutlineIcon onClick={nextMonth} className="arrowDiv" />
        </div>
=======
  updateDate(month_adjustment) {
    var tmp_date = new Date(this.state.current_date.setDate(1));
        tmp_date = new Date(tmp_date.setMonth(tmp_date.getMonth() + month_adjustment));

        const diff_months = (
        (tmp_date.getFullYear() - new Date().getFullYear()) * 12 +
        (tmp_date.getMonth() - new Date().getMonth())
        );

        var current_date = new Date();
    // if temp date is in the future set the day to the first date of the month
    if (diff_months > 0) {
          current_date = new Date(tmp_date.getFullYear(), tmp_date.getMonth(), 1)
        }
    // if temp date is in the past set the day to the last date of the month
        else if (diff_months < 0) {
          current_date = new Date(tmp_date.getFullYear(), tmp_date.getMonth() + 1, 0)
        }
        this.setState({
          current_date: current_date,
        month_string: this.getMonthStr(current_date)
    })
  }

        getMonthStr(current_date) {
    return `${current_date.toLocaleString('default', { month: 'short' })} ${current_date.getFullYear()}`
  }

        componentDidMount() {
          this.fetchData()
    window.addEventListener('resize', () => {
          this.setState({ screen_size: changeScreenSize() });
    });
  }

        fetchData() {
    const current_date = this.state.current_date.toISOString().slice(0, 10);
        instance.get(`${categoryRequests.fetchAllCategories}/${current_date}`).then(c => {
          this.setState({
            groups: [...new Set((c.data).map(c => { return c.category_group }))]
          });
    });
  };

        render() {
    return (
        <div className="budgetContent">
          <div className="budgetHeader">
            <div className={`monthSelector ${this.state.screen_size}MonthSelector`}>
              < ArrowLeftCircleOutlineIcon onClick={this.prevMonth} className="arrowDiv" />
              <div className="currentMonth"> {this.state.month_string} </div>
              < ArrowRightCircleOutlineIcon onClick={this.nextMonth} className="arrowDiv" />
            </div>
          </div>
          <div className="budgetColumnTitles">
            <div className={`budgetColumnNameCategory ${this.state.screen_size}BudgetColumnNameCategory`}>Category</div>
            <div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Assigned</div>
            {(this.state.screen_size === "largeScreen") && (<div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Spent</div>)}
            <div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Balance</div>
          </div>
          <div className="budgetCategories">
            {(this.state.groups.map((group) => {
              const key = `${this.state.current_date}${group}`
              return <CategoryGroup key={key} name={group} currentDate={this.state.current_date} screen_size={this.state.screen_size} />
            }))}
>>>>>>> d917c69b2ce90816808120cacce7e329ab8398fa
          </div>
          <div className="budgetColumnTitles">
            <div className={`budgetColumnNameCategory ${screenSize}BudgetColumnNameCategory`}>Category</div>
            <div className={`budgetColumnName ${screenSize}BudgetColumnName`}>Assigned</div>
            {(screenSize === "largeScreen") && (<div className={`budgetColumnName ${screenSize}BudgetColumnName`}>Spent</div>)}
            <div className={`budgetColumnName ${screenSize}BudgetColumnName`}>Balance</div>
          </div>
          <div className="budgetCategories">
            {(categoryGroups.map((name) => {
              return categoryGroup(name)
            }))}
            {newCategoryGroups}
          </div>
        </div>
        {budgetExtraInfo()}
      </div>
  );


<<<<<<< HEAD
=======
      </div>
    );
  }
>>>>>>> d917c69b2ce90816808120cacce7e329ab8398fa
}
