import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"

import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';

import { TransactionCategory } from './Inputs/TransactionCategory';
import { Autosuggest } from './Inputs/Autosuggest';
import { centsToMoney } from '../utils/money_utils';

import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"


export const Transaction = ({ key, transaction, categories, payees, accounts, selected, selectTransaction }) => {
    const [cleared, setCleared] = useState(transaction.cleared);
    const [transactionDate, setTransactionDate] = useState(new Date(transaction.date));
    const [transactionAccountId, setTransactionAccountId] = useState(transaction.account_id);
    const [transactionPayeeId, setTransactionPayeeId] = useState(transaction.payee_id);
    const [transactionAccount, setTransactionAccount] = useState(accounts[transaction.account_id]);
    const [transactionPayee, setTransactionPayee] = useState(payees[transaction.payee_id]);
    const [transactionMemo, setTransactionMemo] = useState(transaction.memo);
    const [transactionCategories, setTransactionCategories] = useState(transaction.categories);


    const resetTransaction = () => {
        async function _fetchTransaction() {
            instance.get(`${transactionRequests.fetchTransaction}${transaction.id}`).then((transaction_data) => {
                setTransactionDate(convertDateToUTC(new Date(transaction_data.data.date)));
                setTransactionAccountId(transaction_data.data.account_id);
                setTransactionPayeeId(transaction_data.data.payee_id);
                setTransactionAccount(accounts[transaction_data.data.account_id]);
                setTransactionPayee(payees[transaction_data.data.payee_id]);
                setTransactionMemo(transaction_data.data.memo);
                setTransactionCategories(transaction_data.data.categories);
            })
        }
        _fetchTransaction()
    }

    useEffect(() => {
        setTransactionPayee(payees[transactionPayeeId])
        setTransactionAccount(accounts[transactionAccountId])
    }, [key, payees, categories, accounts])

    useEffect(() => {
        resetTransaction()
        const handleEnter = (event) => {
            if (event.key !== 'Enter') return
            updateTransaction()
        }
        if (selected) {
            window.addEventListener('keypress', handleEnter);
        }
    }, [selected])

    function updateTransactionCleared() {
        instance.put(
            `${transactionRequests.updateTransaction}${transaction.id}`,
            { cleared: !cleared }
        )
        setCleared(!cleared)
    }

    function consolidateCategories() {
        // remove empty categories and consolidate duplicate categories
        const new_categories = [];
        transactionCategories.forEach((c) => {
            if (c.amount === 0 || c.category_id === 0 || c.deleted === true) return

            var new_category = true;
            new_categories.forEach((nc) => {
                if (nc.category_id === c.category_id) {
                    nc.amount += c.amount
                    new_category = false
                }
            })
            if (new_category) {
                new_categories.push({ category_id: parseInt(c.category_id), amount: c.amount });
            }
        });
        setTransactionCategories(new_categories);
        return new_categories;
    }

    function updateTransaction() {
        instance.put(
            `${transactionRequests.updateTransaction}${transaction.id}`,
            {
                date: transactionDate.toISOString().slice(0, 10),
                cleared: cleared,
                memo: transactionMemo,
                categories: consolidateCategories(),
            }
        )
        selectTransaction(null)
    }

    const selectCurrentTransaction = () => {
        selectTransaction(transaction.id)
    }

    const clearedIcon = () => {
        if (cleared) {
            return <CheckboxMarkedIcon size="18px" className="transactionClearedIcon" onClick={updateTransactionCleared} />
        } else {
            return <CheckboxBlankOutlineIcon size="18px" className="transactionClearedIcon" onClick={updateTransactionCleared} />
        }
    }

    const transactionDateSelector = () => {
        if (!selected && transactionDate) return <div className="transactionDate">{transactionDate.toISOString().slice(0, 10)}</div>
        return <DatePicker className="transactionDate" selected={transactionDate} onChange={(date) => { setTransactionDate(date) }} />
    }
    const payeeInputField = () => {
        if (!selected) return <div className="transactionPayee">{transactionPayee}</div>
        return <Autosuggest startingValue={transactionPayee} suggestions={payees} allowNewValues={true} updateMethod={(payee) => { setTransactionPayee(payee) }} />
    }
    const accountInputField = () => {
        if (!selected) return <div className="transactionAccount">{transactionAccount}</div>
        return <Autosuggest startingValue={transactionAccount} suggestions={accounts} allowNewValues={false} updateMethod={(account) => { setTransactionAccount(account) }} />
    }
    const memoInputField = () => {
        if (!selected) return <div className="transactionMemo">{transactionMemo}</div>
        return <input className="transactionMemo" value={transactionMemo} onChange={(e) => { setTransactionMemo(e.target.value) }} />
    }

    const transactionCategory = () => {
        if (selected) {
            return <TransactionCategory categories={categories} transactionCategories={transactionCategories} setTransactionCategories={(c) => { setTransactionCategories(c) }} />
        } else {
            return transactionCategories.map((c) => {
                return <div className="transactionCategory"><div className="transactionCategoryName">{categories[c.category_id]}</div><div className="transactionCategoryAmount">{centsToMoney(c.amount)}</div></div>
            })
        }
    }

    if (selected) {
        return (
            <tr className={`transactionRow ${selected ? 'selected' : ''}`}>
                <td> {clearedIcon()} </td>
                <td> {transactionDateSelector()} </td>
                <td> {accountInputField()} </td>
                <td> {payeeInputField()} </td>
                <td> {memoInputField()} </td>
                <td> {transactionCategory()} </td>
                <td className="saveTransactionEdits"> <CheckIcon onClick={updateTransaction} /></td>
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
                <td onClick={selectCurrentTransaction}> {transactionCategory()} </td>
                <td className="saveTransactionEdits"> </td>
            </tr>
        );
    }
}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
