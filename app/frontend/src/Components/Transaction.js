import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';

import { Autosuggest } from './Inputs/Autosuggest';
import { MoneyInput } from './Inputs/MoneyInput';
import { centsToMoney } from '../utils/money_utils';

import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"


export const Transaction = ({ key, transaction, categories, payees, accounts, selected, selectTransaction }) => {
    const [cleared, setCleared] = useState(transaction.cleared);
    const [transactionDate, setTransactionDate] = useState();
    const [transactionAccountId, setTransactionAccountId] = useState();
    const [transactionPayeeId, setTransactionPayeeId] = useState();
    const [transactionAccount, setTransactionAccount] = useState();
    const [transactionPayee, setTransactionPayee] = useState();
    const [transactionMemo, setTransactionMemo] = useState();
    const [transactionCategories, setTransactionCategories] = useState([]);


    const resetTransaction = () => {
        console.log("fetching transaction")
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
    }, [selected])


    function updateTransactionCleared() {
        instance.put(
            `${transactionRequests.updateTransaction}${transaction.id}`,
            { cleared: !cleared }
        )
        setCleared(!cleared)
    }

    function addCategory() {
        setTransactionCategories(transactionCategories.concat([{ category_id: 0, amount: 0 }]))
    }

    function updateTransactionCateogries(i, new_category) {
        console.log(new_category)
        var new_transaction_categories = transactionCategories;
        new_transaction_categories[i].category_id = Object.keys(categories).find(id => categories[id].toLowerCase() === new_category.toLowerCase());
        setTransactionCategories(new_transaction_categories);
    }

    function updateTransactionAmounts(i, new_amount) {
        console.log(new_amount)
        var new_transaction_categories = transactionCategories;
        new_transaction_categories[i].amount = new_amount * 100;
        setTransactionCategories(new_transaction_categories);
    }

    function consolidateCategories() {
        // remove empty categories and consolidate duplicate categories
        const new_categories = [];
        console.log(transactionCategories)
        transactionCategories.forEach((c) => {
            if (c.amount == 0 || c.category_id == 0) return

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

    const clearedIcon = () => {
        if (cleared) {
            return <CheckboxMarkedIcon size="18px" className="transactionClearedIcon" onClick={updateTransactionCleared} />
        } else {
            return <CheckboxBlankOutlineIcon size="18px" className="transactionClearedIcon" onClick={updateTransactionCleared} />
        }
    }

    const transactionDateSelector = () => {
        if (!selected && transactionDate) return <div>{transactionDate.toISOString().slice(0, 10)}</div>
        return <DatePicker className="transactionDateSelector" selected={transactionDate} onChange={(date) => { setTransactionDate(date) }} />
    }
    const payeeInputField = () => {
        if (!selected) return <div>{transactionPayee}</div>
        return <Autosuggest startingValue={transactionPayee} suggestions={payees} allowNewValues={true} updateMethod={(payee) => { setTransactionPayee(payee) }} />
    }
    const accountInputField = () => {
        if (!selected) return <div>{transactionAccount}</div>
        return <Autosuggest startingValue={transactionAccount} suggestions={accounts} allowNewValues={false} updateMethod={(account) => { setTransactionAccount(account) }} />
    }
    const memoInputField = () => {
        if (!selected) return <div>{transactionMemo}</div>
        return <input className="memoInput" value={transactionMemo} onChange={(e) => { setTransactionMemo(e.target.value) }} />
    }

    const categoryInputField = () => {
        if (selected) {
            return transactionCategories.map((c, index) => {
                return <Autosuggest startingValue={categories[c.category_id]} suggestions={categories} allowNewValues={false} updateMethod={(e) => { updateTransactionCateogries(index, e) }} />
            }).concat(<PlusCircleOutlineIcon size={15} onClick={addCategory} />)
        } else {
            return transactionCategories.map(c => {
                return <div>{categories[c.category_id]}</div>
            })
        }
    }

    const amountInputField = () => {
        if (selected) {
            return transactionCategories.map((c, index) => {
                return <MoneyInput startingValue={c.amount / 100} updateMethod={(e) => { updateTransactionAmounts(index, e) }} />
            })
        } else {
            return transactionCategories.map(c => {
                return <div>{centsToMoney(c.amount)}</div>
            });
        }
    }

    const selectCurrentTransaction = () => {
        selectTransaction(transaction.id)
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
                <td onClick={selectCurrentTransaction}> {categoryInputField()} </td>
                <td onClick={selectCurrentTransaction} className="amountInput"> {amountInputField()} </td>
                <td className="saveTransactionEdits"> </td>
            </tr>
        );
    }
}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
