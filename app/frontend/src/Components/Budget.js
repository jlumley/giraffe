import React, {useEffect, useState} from 'react'
import instance from '../axois';
import Category from './Category';

import categoryRequests from '../requests/category';


function Budget() {
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
        <div>
          {
            categories.map(cat => {
            return <Category category={ cat } />
            })
          }
        </div>
      </div>
    )
}

export default Budget;
