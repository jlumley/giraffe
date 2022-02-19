import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"
import { Autosuggest } from './Inputs/Autosuggest';
import { MoneyInput } from './Inputs/MoneyInput';


export const Transaction = ({ transaction, categories, payees, accounts, selected, selectTransaction }) => {
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
        return <Autosuggest startingValue={payees[transaction.payee_id]} suggestions={payees} />
    }
    const accountInputField = () => {
        return <Autosuggest startingValue={accounts[transaction.account_id]} suggestions={accounts} />
    }

    const categoryInputField = () => {
        if (transaction.categories.lenth === 0) return

        return transaction.categories.map(c => {
            return <Autosuggest startingValue={categories[c.category_id]} suggestions={categories} />
        });
    }

    const memoInputField = () => {
        return <input value={transaction.memo} />
    }

    const outflowInputField = () => {
        var startingValue = 0
        if (transaction.amount < 0) startingValue = transaction.amount;

        return <MoneyInput startingValue={startingValue} />
    }

    const inflowInputField = () => {
        var startingValue = 0
        if (transaction.amount > 0) startingValue = transaction.amount;

        return <MoneyInput startingValue={startingValue} />
    }

    const selectCurrentTransaction = () => {
        selectTransaction(transaction.id)
    }

    const deselectCurrentTransaction = () => {
        selectTransaction(null)
    }



    return (
        <tr className="transactionRow" onClick={selectCurrentTransaction}>
            <td> {clearedIcon()} </td>
            <td> {transactionDateSelector()} </td>
            <td className="textInput"> {accountInputField()} </td>
            <td className="textInput"> {payeeInputField()} </td>
            <td className="textInput">  {memoInputField()} </td>
            <td className="textInput"> {categoryInputField()} </td>
            <td className="amountInput"> {outflowInputField()} </td>
            <td className="amountInput"> {inflowInputField()} </td>
            {(selected) && (<td className="saveTransactionEdits"> {<CheckIcon onClick={deselectCurrentTransaction} />}</td>)}
        </tr>);

}
