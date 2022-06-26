import { useEffect, useState } from 'react';
import { Category } from './Category'

import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CheckboxBlankCircleOutlineIcon from 'mdi-react/CheckboxBlankCircleOutlineIcon'
import CheckboxMarkedCircleIcon from 'mdi-react/CheckboxMarkedCircleIcon'

import '../style/CategoryGroup.css'
import instance from '../axois';
import categoryRequests from '../requests/category';

export const CategoryGroup = ({ 
  name, 
  currentDate, 
  smallScreen, 
  updateAssignedTotalAssigned, 
  updateUnderfunded, 
  setSelectedCategories,
  selectedCategories,
}) => {
  const [categoryGroupName, setCategoryGroupName] = useState(name);
  const [categories, setCategories] = useState([]);
  const [newCategories, setNewCategories] = useState([]);
  const [isCreditCardGroup, setIsCreditCardGroup] = useState(categoryGroupName === "Credit Cards")

  useEffect(() => {
    fetchCategories()
  }, [currentDate])

  const category = (category) => {
    return <Category
      key={category.id}
      smallScreen={smallScreen}
      currentDate={currentDate}
      category={category}
      updateAssignedTotalAssigned={updateAssignedTotalAssigned}
      updateUnderfunded={updateUnderfunded}
      setSelectedCategories={setSelectedCategories}
      selectedCategories={selectedCategories}
    />
  }

  const fetchCategories = () => {
    async function _fetchCategories() {
      const today = currentDate.toISOString().slice(0, 10);
      const params = {group: categoryGroupName}
      const resp = await instance.get(
        `${categoryRequests.fetchAllCategories}/${today}`,
        { params })
      setCategories(resp.data)
    }
    _fetchCategories()
  };

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
    if (event.target.value === categoryGroupName) return
    categories.forEach(cat => {
      instance.put(`${categoryRequests.updateCategory}${cat.id}`,
        { "group": event.target.value }
      )
    });
  }    
  
  const ifGroupSelected = () => {
    if (isCreditCardGroup) return
    const groupIds = categories.map(e => e.id)
    const isSelectedGroup = categories.every(e => selectedCategories.includes(e.id))
    if (isSelectedGroup) {
        return <CheckboxMarkedCircleIcon size={15} onClick={()=>{
          setSelectedCategories(selectedCategories.filter(e => !groupIds.includes(e)))
        }}/>
    } else {
        return <CheckboxBlankCircleOutlineIcon size={15} onClick={()=>{
          setSelectedCategories([... new Set(selectedCategories.concat(groupIds))])
        }} />
    }
}

  return <div>
    <div className="categoryGroupTitle">
      {ifGroupSelected()}
      <input className="categoryGroupTitleInput" value={categoryGroupName} onChange={editCategoryGroupName} onBlur={updateCategoryGroupName} />
      {(!isCreditCardGroup) && (<PlusCircleOutlineIcon onClick={createNewCategory} />)}
    </div>
    <table>
      {categories.map(c => {
        return category(c)
      })}
      {newCategories}
    </table>

  </div>;
}
