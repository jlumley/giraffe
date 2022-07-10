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
  categories,
  fetchCategories,
  currentDate,
  mobile,
  setSelectedCategories,
  selectedCategories,
}) => {
  const [categoryGroupName, setCategoryGroupName] = useState(name);
  const [newCategories, setNewCategories] = useState([]);
  const [groupCategories, setGroupCategories] = useState([]);
  const [isCreditCardGroup, setIsCreditCardGroup] = useState(categoryGroupName === "Credit Cards")

  useEffect(() => {
    setGroupCategories(
      categories.filter(
        e => {
          return e.group === name
        }
      )
    )

  }, [name, categories])



  const category = (category) => {
    return <Category
      key={category.id}
      mobile={mobile}
      currentDate={currentDate}
      category={category}
      fetchCategories={fetchCategories}
      setSelectedCategories={setSelectedCategories}
      selectedCategories={selectedCategories}
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
    groupCategories.forEach(cat => {
      instance.put(`${categoryRequests.updateCategory}${cat.id}`,
        { "group": event.target.value }
      )
    });
  }

  const ifGroupSelected = () => {
    if (isCreditCardGroup || mobile) return
    const groupIds = groupCategories.map(e => e.id)
    const isSelectedGroup = groupCategories.every(e => selectedCategories.includes(e.id))
    if (isSelectedGroup) {
      return <CheckboxMarkedCircleIcon size={15} onClick={() => {
        setSelectedCategories(selectedCategories.filter(e => !groupIds.includes(e)))
      }} />
    } else {
      return <CheckboxBlankCircleOutlineIcon size={15} onClick={() => {
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
      {groupCategories.map(c => {
        return category(c)
      })}
      {newCategories}
    </table>

  </div>;
}
