import React from 'react'

import { changeScreenSize } from './Layout'
import { mdiArrowLeftCircleOutline, mdiArrowRightCircleOutline } from '@mdi/js';

import '../style/Header.css'

export class Header extends React.Component {
  constructor(props) {
    super(props);
    this.toggleSidebar = this.props.toggleSidebar;
    this.state = {
      screen_size: changeScreenSize(),
      current_date: this.props.current_date,
      month_string: this.props.current_date.toLocaleString('default', { month: 'long' }),
    }
    this.updateDate = this.updateDate.bind(this)
    this.nextMonth = () => { this.updateDate(+1) };
    this.prevMonth = () => { this.updateDate(-1) };
    this.updateParentDate = (current_date) => { this.props.updateDate(current_date) };
    this.updateDate(0);

  }

  componentDidMount() {
    window.addEventListener('resize', () => {
      this.setState({ screen_size: changeScreenSize() });
    });
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
      month_string: current_date.toLocaleString('default', { month: 'long' })
    })
    this.updateParentDate(current_date)

  }

  render() {
    return (
      <div className="header">
        <div className="headerRow">
          <div className="headerLogo"></div>
          {(this.state.screen_size === "smallScreen") && (
            <div className="menu-button-div" onClick={this.toggleSidebar}>
              <div className="bar1"></div>
              <div className="bar2"></div>
              <div className="bar3"></div>
            </div>)}
          <div className="monthSelector">
            <button className="prevMonth" onClick={this.prevMonth}></button>
            <div> {this.state.month_string} </div>
            <button className="nextMonth" onClick={this.nextMonth}></button>
          </div>
        </div>
      </div>
    );
  }
}
