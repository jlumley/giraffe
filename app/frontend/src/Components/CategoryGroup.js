import React from 'react'
import { Category } from './Category'

import '../style/CategoryGroup.css'

export class CategoryGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: this.props.categories,
      name: this.props.name
    }
    console.log(this.state.categories)
  }

  render() {
    return (
      <div>
        <div className="categoryGroupTitle"> {this.state.name} </div>
        {this.state.categories.map(cat => {
          return <Category category={cat} />
        })}

      </div>

    );
  }
}
