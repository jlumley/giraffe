import React from 'react'
import instance from '../axois';
import { CategoryGroup } from './CategoryGroup'
import { changeScreenSize } from './Layout';
import ArrowLeftCircleOutlineIcon from 'mdi-react/ArrowLeftCircleOutlineIcon';
import ArrowRightCircleOutlineIcon from 'mdi-react/ArrowRightCircleOutlineIcon';

import categoryRequests from '../requests/category';

import '../style/Budget.css'

export class Budget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screen_size: changeScreenSize(),
      groups: [],
      current_date: new Date(),
      month_string: this.getMonthStr(new Date())
    }
    this.updateDate = this.updateDate.bind(this)
    this.nextMonth = () => { this.updateDate(+1) };
    this.prevMonth = () => { this.updateDate(-1) };
  }

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
        </div>

      </div>
    );
  }
}
