import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon'

import Autosuggest from './Inputs/Autosuggest';
import { centsToMoney } from '../utils/money_utils';
import MoneyInput from './Inputs/MoneyInput';

import "../style/Transaction.css"


function TransactionCategory({categories, transactionCategories, setTransactionCategories, selected, transfer}) {

    const transactionCategoryTableStlye = {
        width: '100%',
        padding: '15px'
    }
    const deleteCategoryButtonStyle = {
        width: '15px'
    }
    const categoryNameStyle = {
        width: '50%'
    }
    const categoryAmountInflowStyle = {
        width: '25%'
    }
    const categoryAmountOutflowStyle = {
        width: '25%'
    }

    const categoryOptions = () => {
        return Object.keys(categories).map((id) => { return { value: id, label: categories[id] } })
    }
  
    function addCategory() {
        var tempArray = [...transactionCategories];
        tempArray.push({ category_id: 0, amount: 0, uuid: uuidv4() });
        setTransactionCategories(tempArray)
    }

    function removeCategory(index) {
        var tempArray = [...transactionCategories];
        tempArray.splice(index, 1)
        setTransactionCategories(tempArray)
    }

    function updateTransactionCategoryNames(index, new_category) {
        var tempArray = [...transactionCategories];
        tempArray[index].category_id = new_category
        setTransactionCategories(tempArray);
    }

    function updateTransactionAmounts(index, new_amount) {
        var tempArray = [...transactionCategories];
        tempArray[index].amount = new_amount * 100;
        setTransactionCategories(tempArray);
    }

    function categoryName(category, index) {
        if (!selected){
            return (<div>{categories[category.category_id]}</div>)
        } else {
            if (transfer) {
                return (
                    <Autosuggest
                    startingValue={{"label": categories[category.category_id], "value": category.category_id}}/>
                )
            } else {
                return (
                    <Autosuggest
                    startingValue={{"label": categories[category.category_id], "value": category.category_id}}
                    options={categoryOptions}
                    onBlur={(new_value) => {updateTransactionCategoryNames(index, new_value.value)}}/>
                )   
            }
        }
    }

    function categoryInflow(category, index) {
        if (!selected){
            return (<div>{centsToMoney(Math.abs(Math.max(category.amount, 0)))}</div>)
        } else {
            return (
                <MoneyInput 
                startingValue={Math.abs(Math.max(category.amount / 100, 0))} 
                onBlur={(amount) => { updateTransactionAmounts(index, amount) }} 
                updateOnChange={true} />
            )
        }
    }

    function categoryOutflow(category, index) {
        if (!selected){
            return (<div>{centsToMoney(Math.abs(Math.min(category.amount, 0)))}</div>)
        } else {
            return (
                <MoneyInput 
                startingValue={Math.abs(Math.min(category.amount / 100, 0))} 
                onBlur={(amount) => { updateTransactionAmounts(index, -amount) }} 
                updateOnChange={true} />
            )
        }
    }

    function categorieDeleteButton (index) {
        if (!selected || index === 0 ) return
        return (
            <CloseCircleOutlineIcon 
                size={15} 
                onClick={() => { removeCategory(index) }} />
        )
    }

    function generateTransactionCategories() {
        let categoriesDiv = transactionCategories.map((_category, index) => {
            return (<table key={_category.uuid} style={transactionCategoryTableStlye}>
                <tbody><tr>
                    <td style={deleteCategoryButtonStyle}>
                        {categorieDeleteButton(index)}
                    </td>
                    <td style={categoryNameStyle}>
                        {categoryName(_category, index)} 
                    </td>
                    <td style={categoryAmountInflowStyle}>
                        {categoryInflow(_category, index)}
                    </td>
                    <td style={categoryAmountOutflowStyle}>
                        {categoryOutflow(_category, index)}
                    </td>
                </tr></tbody>
            </table>
            );
        })
        if (selected && !transfer) categoriesDiv = categoriesDiv.concat(<PlusCircleOutlineIcon size={15} onClick={addCategory} />)

        return categoriesDiv
  }

  return (
      <div>
          {generateTransactionCategories()}
      </div>
  )
}

export default TransactionCategory
