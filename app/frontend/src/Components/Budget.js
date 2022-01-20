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
        categories: {}
      }
    }

    groupCategories(categories){
      // Group categories by category group
      var grouped_categories = {};
      categories.map((c)=>{
        if (grouped_categories[c.category_group]){
          grouped_categories[c.category_group].push(c);
        } else {
          grouped_categories[c.category_group] = [];
        }
      });
      return grouped_categories;
    };

    componentDidMount(){
      this.fetchData()
      window.addEventListener('resize', ()=>{
        this.setState({screen_size: changeScreenSize()});
      });
    }

    fetchData(){
      // get today's date YYYY-MM-DD
      const today = new Date().toISOString().slice(0, 10);
      instance.get(`${categoryRequests.fetchAllCategories}/${today}`).then(c => {
        var grouped_categories = this.groupCategories(c.data);
        console.log(grouped_categories)
        this.setState({
            categories: grouped_categories,
        });
      });
    };



    render() {
      return (
        <div>
          <div className="budgetContent">
          <div className="budgetHeader"/>
          <div className="budgetColumnNameGroup">
              <div className={`budgetColumnNameCategory ${this.state.screen_size}BudgetColumnNameCategory`}>Category</div>
              <div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Assigned</div>
              {(this.state.screen_size === "largeScreen") && (<div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Spent</div>)}
              <div className={`budgetColumnName ${this.state.screen_size}BudgetColumnName`}>Balance</div>
          </div>
          <div className="budgetCategories">
          {(Object.keys(this.state.categories).map((group) => {
              return <CategoryGroup name={group} categories={this.state.categories[group]} />
          }))}
          </div>
         </div>
        </div>

      );
    }
}
