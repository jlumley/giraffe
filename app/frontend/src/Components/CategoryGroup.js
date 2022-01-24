import React from 'react'
import { Category } from './Category'

import '../style/CategoryGroup.css'
import instance from '../axois';
import categoryRequests from '../requests/category';

export class CategoryGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: this.props.categories,
      name: this.props.name,
      current_date: this.props.current_date,
    }
    this.handleChangeCategoryGroupName = this.handleChangeCategoryGroupName.bind(this);
    this.handlerUpdateCategoryGroupName = this.handlerUpdateCategoryGroupName.bind(this)
  }

  handleChangeCategoryGroupName(event) {
    this.setState({
      name: event.target.value
    });
  }

  handlerUpdateCategoryGroupName(event) {
    if (event.key === 'Enter') {
      this.state.categories.forEach(cat => {
        instance.put(`${categoryRequests.updateCategory}${cat.id}`,
          { "group": event.target.value }
        ).then(
          (resp) => {
            console.log(resp)
          }
        )
      });
      event.preventDefault();
      event.target.blur();
    }
  }

  render() {
    return (
      <div>

        <div className="categoryGroupTitle"> <input className="categoryGroupTitleInput" value={this.state.name} onChange={this.handleChangeCategoryGroupName} onKeyPress={this.handlerUpdateCategoryGroupName} /> </div>
        {this.state.categories.map(cat => {
          return <Category key={this.state.current_date} current_date={this.state.current_date} category={cat} />
        })}
      </div>
    );
  }
}
