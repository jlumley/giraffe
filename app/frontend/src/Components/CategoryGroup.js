import { useEffect, useState } from 'react';
import { Category } from './Category'

import '../style/CategoryGroup.css'
import instance from '../axois';
import categoryRequests from '../requests/category';


export const CategoryGroup = ({ name, currentDate, screen_size }) => {
  const [categoryGroupName, setCategoryGroupName] = useState(name);
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetchCategories()
  }, [currentDate, name])


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
      const current_date = currentDate.toISOString().slice(0, 10);
      const resp = await instance.get(`${categoryRequests.fetchAllCategories}/${current_date}`)

      setCategories(resp.data.filter(cat => cat.category_group == categoryGroupName))
    }
    _fetchCategories()
  };


  return <div>
    <div className="categoryGroupTitle"> <input className="categoryGroupTitleInput" value={categoryGroupName} onChange={editCategoryGroupName} onBlur={updateCategoryGroupName} /> </div>
    {categories.map(cat => {
      return <Category screen_size={screen_size} current_date={currentDate} category={cat} />
    })}
  </div>;
}
