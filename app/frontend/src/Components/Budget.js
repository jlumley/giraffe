import React from 'react'
import instance from '../axois';
import { Category } from './Category';
import { changeScreenSize } from './Layout';

import categoryRequests from '../requests/category';

import '../style/Budget.css'

export class Budget extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        screen_size: changeScreenSize(),
        categories: []
      }
    }

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
        this.setState({
            categories: c.data,
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
          {
            this.state.categories.map(cat => {
              return <Category screen_size={this.state.screen_size} category={cat} />
            })
          }
          </div>
         </div>
        </div>
  
      );
    }
}

