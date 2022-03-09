import React from 'react'

import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon'

import { Autosuggest } from './Autosuggest';
import { MoneyInput } from './MoneyInput';

import '../../style/TransactionCategory.css'

export function TransactionCategory({ categories, transactionCategories, setTransactionCategories }) {

    function addCategory() {
        setTransactionCategories(transactionCategories.concat([{ category_id: 0, amount: 0, deleted: false }]))
    }

    function removeCategory(index) {
        var tempArray = [...transactionCategories];
        tempArray[index].deleted = true;
        setTransactionCategories(tempArray)
    }

    function updateTransactionCategoryNames(i, new_category) {
        var new_transaction_categories = transactionCategories;
        new_transaction_categories[i].category_id = Object.keys(categories).find(id => categories[id].toLowerCase() === new_category.toLowerCase());
        setTransactionCategories(new_transaction_categories);
    }

    function updateTransactionAmounts(i, new_amount) {
        var new_transaction_categories = transactionCategories;
        new_transaction_categories[i].amount = new_amount * 100;
        setTransactionCategories(new_transaction_categories);
    }


    const categoryField = (c, index) => {
        return (
            <table className="transactonCategoryRow">
                <td className="deleteTransactonCategory"><CloseCircleOutlineIcon size={15} onClick={() => { removeCategory(index) }} /></td>
                <td className="transactonCategoryName"><Autosuggest startingValue={categories[c.category_id]} suggestions={categories} allowNewValues={false} updateMethod={(e) => { updateTransactionCategoryNames(index, e) }} /> </td>
                <td className="transactonCategoryAmount"><MoneyInput startingValue={c.amount / 100} updateMethod={(e) => { updateTransactionAmounts(index, e) }} updateOnChange={true} /></td>
            </table>
        );
    }

    return (
        <div>
            {transactionCategories.map((c, index) => {
                if (c.deleted === true) return null
                return categoryField(c, index)
            }).concat(<PlusCircleOutlineIcon size={16} onClick={addCategory} />)}
        </div>
    )
}
