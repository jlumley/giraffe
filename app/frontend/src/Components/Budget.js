import React, {useEffect, useState} from 'react'
import instance from '../axois';
import Category from './Category';

import categoryRequests from '../requests/category';

import '../style/Budget.css'

function Budget({screenSize}) {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        async function fetchData(){
          // get today's date YYYY-MM-DD
          const today = new Date().toISOString().slice(0, 10);
          const categories = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`);
          setCategories(categories.data)
        }
        fetchData()
    }, []);
    return (
      <div>
        <div className="budgetContent">
        <div className="budgetHeader"/>
        <div className="budgetColumnNameGroup">
            <div className={`budgetColumnNameCategory ${screenSize}BudgetColumnNameCategory`}>Category</div>
            <div className={`budgetColumnName ${screenSize}BudgetColumnName`}>Assigned</div>
            {(screenSize == "largeScreen") && (<div className={`budgetColumnName ${screenSize}BudgetColumnName`}>Spent</div>)}
            <div className={`budgetColumnName ${screenSize}BudgetColumnName`}>Balance</div>
        </div>
        <div className="budgetCategories">
        {
          categories.map(cat => {
          return <Category screenSize={screenSize} category={cat} />
          })
        }
        </div>
       </div>
      </div>

    )
}

export default Budget;
