import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"

import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"


export const Transaction = ({ transaction, categories, payees }) => {

    const [cleared, setCleared] = useState(transaction.cleared);
    const [transactionDate, setTransactionDate] = useState(new Date(transaction.date));

    useEffect(() => { }, [])

    function updateCleared() {
        setCleared(!cleared)
        // update cleared state with api
    }

    function updateTransactionDate(newDate) {
        setTransactionDate(newDate);
    }

    const clearedIcon = () => {
        if (cleared) {
            return <CheckboxMarkedIcon size="18px" className="transactionClearedIcon" onClick={updateCleared} />
        } else {
            return <CheckboxBlankOutlineIcon size="18px" className="transactionClearedIcon" onClick={updateCleared} />
        }
    }

    const transactionDateSelector = () => {
        return <DatePicker className="transactionDateSelector" selected={transactionDate} onChange={(date) => { updateTransactionDate(date) }} />
    }

    const payeeInputField = () => {
        return < input value={payees[transaction.payee_id]} /> //< Autosuggest />
    }

    const categoryInputField = () => {
        if (transaction.categories.lenth === 0) return

        return transaction.categories.map(c => {
            return <input value={categories[c.category_id]} /> //< Autosuggest />
        });

    }

    const memoInputField = () => {
        return <input value={transaction.memo} />
    }

    return (
        <tr className="transactionRow">
            <td> {clearedIcon()} </td>
            <td> {transactionDateSelector()} </td>
            <td> {payeeInputField()} </td>
            <td> {memoInputField()} </td>
            <td> {categoryInputField()} </td>
            <td> {transaction.amount} </td>
            <td> {transaction.amount} </td>
        </tr>);

}
