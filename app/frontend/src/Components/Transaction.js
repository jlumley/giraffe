import React, { useState } from 'react';
import DatePicker from "react-datepicker";
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';

import { Autosuggest } from './Inputs/Autosuggest';
import { MoneyInput } from './Inputs/MoneyInput';

import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"


export const Transaction = ({ transaction, categories, payees, accounts, selected, selectTransaction }) => {
    const [cleared, setCleared] = useState(transaction.cleared);
    const [transactionDate, setTransactionDate] = useState(convertDateToUTC(new Date(transaction.date)));
    const [newTransactionCategories, setNewTransactionCategories] = useState([]);

    function updateCleared() {
        instance.put(
            `${transactionRequests.updateTransaction}${transaction.id}`,
            { cleared: !cleared }
        )
        setCleared(!cleared)
    }

    function updateTransactionDate(newDate) {
        instance.put(
            `${transactionRequests.updateTransaction}${transaction.id}`,
            { date: newDate.toISOString().slice(0, 10) }
        )
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
        if (!selected) return <div>{payees[transaction.payee_id]}</div>
        return <Autosuggest startingValue={payees[transaction.payee_id]} suggestions={payees} />
    }
    const accountInputField = () => {
        if (!selected) return <div>{accounts[transaction.account_id]}</div>
        return <Autosuggest startingValue={accounts[transaction.account_id]} suggestions={accounts} />
    }
    const memoInputField = () => {
        if (!selected) return <div>{transaction.memo}</div>
        return <input value={transaction.memo} />
    }


    const categoryInputField = () => {
        return transaction.categories.map(c => {
            if (!selected) return <div>{categories[c.category_id]}</div>
            return <Autosuggest className="textInput" startingValue={categories[c.category_id]} suggestions={categories} />
        });
    }

    const amountInputField = () => {
        return transaction.categories.map(c => {
            return <MoneyInput startingValue={c.amount / 100} updateMethod={() => { }} />
        });
    }

    const selectCurrentTransaction = () => {
        selectTransaction(transaction.id)
    }

    const deselectCurrentTransaction = () => {
        selectTransaction(null)
    }

    if (selected) {
        return (
            <tr className={`transactionRow ${selected ? 'selected' : ''}`}>
                <td> {clearedIcon()} </td>
                <td> {transactionDateSelector()} </td>
                <td> {accountInputField()} </td>
                <td> {payeeInputField()} </td>
                <td> {memoInputField()} </td>
                <td> {categoryInputField()} </td>
                <td className="amountInput"> {amountInputField()} </td>
                <td className="saveTransactionEdits"> <CheckIcon onClick={deselectCurrentTransaction} /></td>
            </tr>
        );
    } else {
        return (
            <tr className={`transactionRow ${selected ? 'selected' : ''}`}>
                <td> {clearedIcon()} </td>
                <td onClick={selectCurrentTransaction}> {transactionDateSelector()} </td>
                <td onClick={selectCurrentTransaction}> {accountInputField()} </td>
                <td onClick={selectCurrentTransaction}> {payeeInputField()} </td>
                <td onClick={selectCurrentTransaction}> {memoInputField()} </td>
                <td onClick={selectCurrentTransaction}> {categoryInputField()} </td>
                <td onClick={selectCurrentTransaction} className="amountInput"> {amountInputField()} </td>
                <td className="saveTransactionEdits"> </td>
            </tr>
        );
    }
}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
