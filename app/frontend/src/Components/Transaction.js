import React, { useEffect, useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import { v4 as uuidv4 } from 'uuid';
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';

import { Autosuggest } from './Inputs/Autosuggest';
import { centsToMoney } from '../utils/money_utils';
import { MoneyInput } from './Inputs/MoneyInput';


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
    const [transactionCategories, setTransactionCategories] = useState({});
    const confirmEdits = useRef(null);

    const transactionCategoryArrayToObject = (tempTransactionsCategories) => {
        var transactionObj = {}
        tempTransactionsCategories.forEach((c) => {
            transactionObj[uuidv4()] = c;
        })
        return transactionObj
    }

    const transactionCategoryObjectToArray = (tempTransactionsCategories) => {
        var transactionArray = [];
        Object.keys(tempTransactionsCategories).forEach((c) => {
            transactionArray.push(tempTransactionsCategories[c])
        })
        return transactionArray
    }

    const resetTransaction = () => {
        instance.get(`${transactionRequests.fetchTransaction}${transaction.id}`).then((resp) => {
            setTransactionDate(convertDateToUTC(new Date(resp.data.date)));
            setTransactionAccountId(resp.data.account_id);
            setTransactionPayeeId(resp.data.payee_id);
            setTransactionAccount(accounts[resp.data.account_id]);
            setTransactionPayee(payees[resp.data.payee_id]);
            setTransactionMemo(resp.data.memo);
            setTransactionCategories(transactionCategoryArrayToObject(resp.data.categories));
        })
    }

    useEffect(() => {
        setTransactionPayee(payees[transactionPayeeId])
        setTransactionAccount(accounts[transactionAccountId])
        setTransactionCategories(transactionCategoryArrayToObject(transaction.categories))
    }, [payees, categories, accounts])

    function handleEnter(event) {
        if (event.key !== 'Enter') return
        confirmEdits.current.click()
    }

    useEffect(() => {
        resetTransaction()
        if (selected) {
            window.addEventListener('keypress', handleEnter);
        }
        return () => {
            window.removeEventListener('keypress', handleEnter);
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
        const new_categories = {};
        Object.keys(transactionCategories).forEach((k) => {
            if (transactionCategories[k].category_id === 0) return
            var new_category = true;
            Object.keys(new_categories).forEach((nk) => {
                if (new_categories[nk].category_id == transactionCategories[k].category_id) {
                    new_categories[nk].amount += transactionCategories[k].amount
                    new_category = false
                }
            })
            if (new_category) {
                new_categories[uuidv4()] = { category_id: parseInt(transactionCategories[k].category_id), amount: transactionCategories[k].amount };
            }
        });
        return new_categories;
    }

    function addCategory() {
        var tempObj = { ...transactionCategories };
        tempObj[uuidv4()] = { category_id: 0, amount: 0 };
        setTransactionCategories(tempObj)
    }

    function removeCategory(transactionCategoriesKey) {
        var tempObj = { ...transactionCategories };
        delete tempObj[transactionCategoriesKey]
        setTransactionCategories(tempObj)
    }

    function updateTransactionCategoryNames(transactionCategoriesKey, new_category) {
        var tempObj = { ...transactionCategories };
        tempObj[transactionCategoriesKey].category_id = Object.keys(categories).find(id => categories[id].toLowerCase() === new_category.toLowerCase());
        setTransactionCategories(tempObj);
    }

    function updateTransactionAmounts(transactionCategoriesKey, new_amount) {
        var tempObj = { ...transactionCategories };
        tempObj[transactionCategoriesKey].amount = new_amount * 100;
        setTransactionCategories(tempObj);
    }


    function updateTransaction() {
        instance.put(
            `${transactionRequests.updateTransaction}${transaction.id}`,
            {
                date: transactionDate.toISOString().slice(0, 10),
                cleared: cleared,
                memo: transactionMemo,
                categories: transactionCategoryObjectToArray(consolidateCategories()),
            }
        ).then((resp) => {
            selectTransaction(null)
        })

    }

    const selectCurrentTransaction = () => {
        selectTransaction(transaction.id)
    }

    const clearedIcon = () => {
        if (cleared) {
            return <CheckboxMarkedIcon className="clearedIcon" size="18px" onClick={updateTransactionCleared} />
        } else {
            return <CheckboxBlankOutlineIcon className="clearedIcon" size="18px" onClick={updateTransactionCleared} />
        }
    }

    const transactionDateSelector = () => {
        if (!selected && transactionDate) return <div onClick={selectCurrentTransaction}>{transactionDate.toISOString().slice(0, 10)}</div>
        return <DatePicker className="transactionDate" selected={transactionDate} onChange={(date) => { setTransactionDate(date) }} />
    }
    const payeeInputField = () => {
        if (!selected) return <div onClick={selectCurrentTransaction}>{transactionPayee}</div>
        return <Autosuggest startingValue={transactionPayee} suggestions={payees} allowNewValues={true} updateMethod={(payee) => { setTransactionPayee(payee) }} />
    }
    const accountInputField = () => {
        if (!selected) return <div onClick={selectCurrentTransaction}>{transactionAccount}</div>
        return <Autosuggest startingValue={transactionAccount} suggestions={accounts} allowNewValues={false} updateMethod={(account) => { setTransactionAccount(account) }} />
    }
    const memoInputField = () => {
        if (!selected) return <div onClick={selectCurrentTransaction}>{transactionMemo}</div>
        return <input className="transactionMemo" value={transactionMemo} onChange={(e) => { setTransactionMemo(e.target.value) }} />
    }

    const transactionCategory = () => {
        if (selected) {
            return Object.keys(transactionCategories).map((k) => {
                return (<table key={k} className="transactonCategoryRow">
                    <tbody><tr>
                        <td className="deleteTransactonCategory"><CloseCircleOutlineIcon size={15} onClick={() => { removeCategory(k) }} /></td>
                        <td className="transactonCategoryName"><Autosuggest startingValue={categories[transactionCategories[k].category_id]} suggestions={categories} allowNewValues={false} updateMethod={(e) => { updateTransactionCategoryNames(k, e) }} /> </td>
                        <td className="transactonCategoryAmount"><MoneyInput startingValue={transactionCategories[k].amount / 100} updateMethod={(e) => { updateTransactionAmounts(k, e) }} updateOnChange={true} /></td>
                    </tr></tbody>
                </table>
                );
            }).concat(<PlusCircleOutlineIcon size={16} onClick={addCategory} />)

        } else {
            return Object.keys(transactionCategories).map((k) => {
                return (
                    <div key={k} className="transactionCategory" onClick={selectCurrentTransaction}>
                        <div className="transactionCategoryName">{categories[transactionCategories[k].category_id]}</div>
                        <div className="transactionCategoryAmount">{centsToMoney(transactionCategories[k].amount)}</div>
                    </div>
                )
            })
        }
    }

    return (
        <tr className={`transactionRow ${selected ? 'selected' : ''}`}>
            <td className="transactionClearedColumn"> {clearedIcon()} </td>
            <td className="transactionDateColumn"> {transactionDateSelector()} </td>
            <td className="transactionAccountColumn"> {accountInputField()} </td>
            <td className="transactionPayeeColumn"> {payeeInputField()} </td>
            <td className="transactionMemoColumn"> {memoInputField()} </td>
            <td className="transactionCategoriesColumn"> {transactionCategory()} </td>
            {(selected) && (<td className="transactionSaveColumn"> <div ref={confirmEdits} onClick={updateTransaction}><CheckIcon /></div></td>)}
        </tr>
    );

}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
