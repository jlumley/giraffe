import React from 'react'
import instance from '../axois';
import { CategoryGroup } from './CategoryGroup'
import { changeScreenSize } from './Layout';

import categoryRequests from '../requests/category';

import '../style/Budget.css'

export class Budget extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screen_size: changeScreenSize(),
      categories: {},
      current_date: this.props.current_date,
    }
  }

  groupCategories(categories) {
    // Group categories by category group
    var grouped_categories = {};
    categories.map((c) => {
      if (grouped_categories[c.category_group]) {
        grouped_categories[c.category_group].push(c);
      } else {
        grouped_categories[c.category_group] = [c];
      }
    });
    return grouped_categories;
  };

  componentDidMount() {
    this.fetchData()
    window.addEventListener('resize', () => {
      this.setState({ screen_size: changeScreenSize() });
    });
  }

  fetchData() {
    const current_date = this.state.current_date.toISOString().slice(0, 10);
    instance.get(`${categoryRequests.fetchAllCategories}/${current_date}`).then(c => {
      var grouped_categories = this.groupCategories(c.data);
      this.setState({
        categories: grouped_categories,
      });
    });
  };



  render() {
    return (
      <div className="budgetContent">
        <div className="budgetHeader" />
        <div className="budgetColumnTitles">
          <div className={`budgetColumnNameCategory ${this.state.screen_size}BudgetColumnNameCategory`}>Category</div>
          <div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Assigned</div>
          {(this.state.screen_size === "largeScreen") && (<div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Spent</div>)}
          <div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Balance</div>
        </div>
        <div className="budgetCategories">
          {(Object.keys(this.state.categories).map((group) => {
            return <CategoryGroup key={this.state.current_date} name={group} categories={this.state.categories[group]} current_date={this.state.current_date} />
          }))}
        </div>

      </div>
    );
  }
}
