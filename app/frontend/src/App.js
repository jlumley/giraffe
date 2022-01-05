import React, { useState, useEffect} from 'react'
import instance from './axois';
import Category from './Category';

import categoryRequests from './requests/category';

function App() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
      async function fetchData(){
        // get today's date YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);
        const categories = await instance.get(`${categoryRequests.fetchAllCategories}/${today}`);
        console.log(categories)
        setCategories(categories.data)
      }
      fetchData()
  }, []);

  console.log(categories)
  return (
    <div className="App">
      {
        categories.map(cat => {
          return <Category category={ cat } />
        })
      }
    </div>
  );
}

export default App;
