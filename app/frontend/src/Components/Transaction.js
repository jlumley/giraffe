import React, { useEffect, useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import { v4 as uuidv4 } from 'uuid';
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon'
import TrashCanOutlineIcon from 'mdi-react/TrashCanOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';

import { Autosuggest } from './Inputs/Autosuggest';
import { centsToMoney } from '../utils/money_utils';
import { MoneyInput } from './Inputs/MoneyInput';


import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"
import payeeRequests from '../requests/payee';


export const Transaction = ({ transaction, categories, payees, accounts, selected, selectTransaction, deleteTransaction }) => {
    const [cleared, setCleared] = useState(transaction.cleared);
    const [transactionDate, setTransactionDate] = useState(new Date(transaction.date));
    const [transactionAccountId, setTransactionAccountId] = useState(transaction.account_id);
    const [transactionPayeeId, setTransactionPayeeId] = useState(transaction.payee_id);
    const [transactionAccount, setTransactionAccount] = useState(accounts[transaction.account_id]);
    const [transactionPayee, setTransactionPayee] = useState(payees[transaction.payee_id]);
    const [transactionMemo, setTransactionMemo] = useState(transaction.memo);
    const [transactionCategories, setTransactionCategories] = useState({});
    const updateTransactionButton = useRef(null);
    const deleteTransactionButton = useRef(null);

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

    const payeeToPayeeId = () => {
        return Object.keys(payees).find(id => payees[id].toLowerCase() === transactionPayee.toLowerCase())
    }

    const accountToAccountId = () => {
        return Object.keys(accounts).find(id => accounts[id].toLowerCase() === transactionAccount.toLowerCase())
    }

    function reloadTransaction() {
        async function _reloadTransaction() {
            const p = await instance.get(payeeRequests.fetchAllPayees)
            const tempPayees = (p.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
            instance.get(`${transactionRequests.fetchTransaction}${transaction.id}`).then((resp) => {
                setTransactionDate(convertDateToUTC(new Date(resp.data.date)));
                setTransactionAccountId(resp.data.account_id);
                setTransactionPayeeId(resp.data.payee_id);
                setTransactionAccount(accounts[resp.data.account_id]);
                setTransactionPayee(tempPayees[resp.data.payee_id]);
                setTransactionMemo(resp.data.memo);
                setTransactionCategories(transactionCategoryArrayToObject(resp.data.categories));
            })
        }
        _reloadTransaction()
    }

    function handleEnter(event) {
        if (event.key === 'Enter') {
            event.target.blur()
            updateTransactionButton.current.click()
        }
    }

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
                if (parseInt(new_categories[nk].category_id) === parseInt(transactionCategories[k].category_id)) {
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
        async function _updateTransaction() {
            var payeeId = payeeToPayeeId();
            if (!payeeId) {
                // create new payee if not match found
                const resp = await instance.post(payeeRequests.createPayee,
                    { name: transactionPayee }
                )
                payeeId = resp.data.id
            }
            var accountId = accountToAccountId();
            var categories = transactionCategoryObjectToArray(consolidateCategories());
            var totalAmount = categories.reduce(
                (prev, curr) => prev + curr.amount,
                0
            )
            await instance.put(
                `${transactionRequests.updateTransaction}${transaction.id}`,
                {
                    date: transactionDate.toISOString().slice(0, 10),
                    cleared: cleared,
                    memo: transactionMemo,
                    account_id: parseInt(accountId),
                    payee_id: parseInt(payeeId),
                    categories: categories,
                    amount: totalAmount
                }
            )

            selectTransaction(null)
            reloadTransaction()

        }
        _updateTransaction()
    }

    useEffect(() => {
        setTransactionPayee(payees[transactionPayeeId])
    }, [transactionPayeeId, payees])
    useEffect(() => {
        setTransactionAccount(accounts[transactionAccountId])
    }, [transactionAccountId, accounts])
    useEffect(() => {
        setTransactionCategories(transactionCategoryArrayToObject(transaction.categories))
    }, [transaction, categories])
    useEffect(() => {
        if (selected) {
            reloadTransaction()
            window.addEventListener('keypress', handleEnter);
        }
        return () => {
            window.removeEventListener('keypress', handleEnter);
        }
    }, [selected])


    const selectCurrentTransaction = (e) => {
        e.target.focus()
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
        if (!selected && transactionDate) return <div>{transactionDate.toISOString().slice(0, 10)}</div>
        return <DatePicker className="transactionDate" selected={transactionDate} onChange={(date) => { setTransactionDate(date) }} />
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
                    <div key={k} className="transactionCategory">
                        <div className="transactionCategoryName">{categories[transactionCategories[k].category_id]}</div>
                        <div className="transactionCategoryAmount">{centsToMoney(transactionCategories[k].amount)}</div>
                    </div>
                )
            })
        }
    }

    return (
        <tr className={`transactionRow ${selected ? 'selected' : ''}`} onClick={selectCurrentTransaction}>
            <td className="transactionClearedColumn"> {clearedIcon()} </td>
            <td className="transactionDateColumn"> {transactionDateSelector()} </td>
            <td className="transactionAccountColumn"> {accountInputField()} </td>
            <td className="transactionPayeeColumn"> {payeeInputField()} </td>
            <td className="transactionMemoColumn"> {memoInputField()} </td>
            <td className="transactionCategoriesColumn"> {transactionCategory()} </td>
            {(selected) && (<td className="transactionSaveColumn">
                <div ref={updateTransactionButton} onClick={() => { updateTransaction() }}><CheckIcon /></div>
                <div ref={deleteTransactionButton} onClick={() => { deleteTransaction() }}> <TrashCanOutlineIcon /> </div>
            </td>)}

        </tr>
    );

}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
