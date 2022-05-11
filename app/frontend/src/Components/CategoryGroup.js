import { useContext, useEffect, useState } from 'react';
import { Category } from './Category'

import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'

import '../style/CategoryGroup.css'
import instance from '../axois';
import categoryRequests from '../requests/category';
import { BudgetContext } from './Budget';

export const CategoryGroup = ({ name, currentDate, smallScreen, selectCategory }) => {
  const budgetContext = useContext(BudgetContext);
  const [categoryGroupName, setCategoryGroupName] = useState(name);
  const [newCategories, setNewCategories] = useState([]);
  const [isCreditCardGroup, setIsCreditCardGroup] = useState(categoryGroupName === "Credit Cards")


  const category = (category) => {
    return <Category
      key={category.id}
      smallScreen={smallScreen}
      currentDate={currentDate}
      category={category}
      selectCategory={selectCategory}
    />
  }

  const createNewCategory = () => {
    const today = currentDate.toISOString().slice(0, 10);
    instance.post(`${categoryRequests.createNewCategory}`, {
      name: "New Category",
      group: categoryGroupName
    }).then((resp) => {
      instance.get(`${categoryRequests.fetchCategory}/${resp.data.id}/${today}`).then((resp) => {
        setNewCategories(newCategories.concat(category(resp.data)))
      })
    })
  }

  const editCategoryGroupName = (event) => {
    if (isCreditCardGroup) return
    setCategoryGroupName(event.target.value);
  }
  const updateCategoryGroupName = (event) => {
    budgetContext.categories.forEach(cat => {
      if (cat.group !== categoryGroupName) return
      instance.put(`${categoryRequests.updateCategory}${cat.id}`,
        { "group": event.target.value }
      )
    });
  }

  return <div>
    <div className="categoryGroupTitle">
      <input className="categoryGroupTitleInput" value={categoryGroupName} onChange={editCategoryGroupName} onBlur={updateCategoryGroupName} />
      {(!isCreditCardGroup) && (<PlusCircleOutlineIcon onClick={createNewCategory} className="newCategoryButton" />)}
    </div>
    <table>
      {budgetContext.categories.map(c => {
        if (c.group !== categoryGroupName) return
        return category(c)
      })}
      {newCategories}
    </table>

  </div>;
}
