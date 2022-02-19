import { useEffect, useState } from 'react';
import { Category } from './Category'

import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'

import '../style/CategoryGroup.css'
import instance from '../axois';
import categoryRequests from '../requests/category';


export const CategoryGroup = ({ name, currentDate, screenSize }) => {
  const [categoryGroupName, setCategoryGroupName] = useState(name);
  const [categories, setCategories] = useState([]);
  const [newCategories, setNewCategories] = useState([]);


  useEffect(() => {
    fetchCategories()
  }, [])

  const category = (category) => {
    return <Category screenSize={screenSize} currentDate={currentDate} category={category} />
  }

  const createNewCategory = () => {
    const today = currentDate.toISOString().slice(0, 10);
    instance.post(`${categoryRequests.createNewCategory}`, {
      name: "New Category",
      group: categoryGroupName
    }).then((resp) => {
      instance.get(`${categoryRequests.fetchCategory}/${resp.data.id}/${today}`).then((resp) => {
        resp.data.forEach((c) => {
          setNewCategories(newCategories.concat(category(c)))
        })

      })
    })
  }

  const editCategoryGroupName = (event) => {
    setCategoryGroupName(event.target.value);
  }
  const updateCategoryGroupName = (event) => {
    categories.forEach(cat => {
      instance.put(`${categoryRequests.updateCategory}${cat.id}`,
        { "group": event.target.value }
      )
    });
  }

  const fetchCategories = () => {
    async function _fetchCategories() {
      const today = currentDate.toISOString().slice(0, 10);
      const resp = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`)

      setCategories(resp.data.filter(cat => cat.category_group == categoryGroupName))
    }
    _fetchCategories()
  };


  return <div>
    <div className="categoryGroupTitle">
      <input className="categoryGroupTitleInput" value={categoryGroupName} onChange={editCategoryGroupName} onBlur={updateCategoryGroupName} />
      <PlusCircleOutlineIcon onClick={createNewCategory} className="newCategoryButton" />
    </div>
    {categories.map(c => {
      return category(c)
    })}
    {newCategories}
  </div>;
}
