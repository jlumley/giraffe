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
    const [transferId, setTransferId] = useState(transaction.transfer_id);
    const [transactionDate, setTransactionDate] = useState(new Date(transaction.date));
    const [transactionAccountId, setTransactionAccountId] = useState(transaction.account_id);
    const [transactionPayeeId, setTransactionPayeeId] = useState(transaction.payee_id);
    const [transactionMemo, setTransactionMemo] = useState(transaction.memo);
    const [transactionAmount, setTransactionAmount] = useState(transaction.amount);
    const [transactionCategories, setTransactionCategories] = useState([]);
    const updateTransactionButton = useRef(null);
    const deleteTransactionButton = useRef(null);

    const payeeToPayeeId = () => {
        return Object.keys(payees).find(id => payees[id].toLowerCase() === transactionPayee.toLowerCase())
    }

    const accountToAccountId = () => {
        return Object.keys(accounts).find(id => accounts[id].toLowerCase() === transactionAccount.toLowerCase())
    }

    const payeeFromPayeeId = () => {
        if (!transferId) return payees[transactionPayeeId]
        return `Transfer to/from ${accounts[transactionPayeeId]}`
    }

    const [transactionAccount, setTransactionAccount] = useState(accounts[transaction.account_id]);
    const [transactionPayee, setTransactionPayee] = useState(payeeFromPayeeId());

    function reloadTransaction() {
        async function _reloadTransaction() {
            instance.get(`${transactionRequests.fetchTransaction}${transaction.id}`).then((resp) => {
                setTransactionDate(convertDateToUTC(new Date(resp.data.date)));
                setTransactionAccountId(resp.data.account_id);
                setTransactionPayeeId(resp.data.payee_id);
                setTransactionAccount(accounts[resp.data.account_id]);
                setTransactionPayee(payeeFromPayeeId());
                setTransactionMemo(resp.data.memo);
                setTransactionCategories(resp.data.categories.map(obj => ({ ...obj, uuid: uuidv4() })));
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
        const new_categories = [];
        transactionCategories.forEach((c) => {
            if (c.category_id === 0) return
            var new_category = true;
            new_categories.forEach((nc) => {
                if (parseInt(nc.category_id) === parseInt(c.category_id)) {
                    nc.amount += c.amount
                    new_category = false
                }
            })
            if (new_category) {
                new_categories.push({ category_id: parseInt(c.category_id), amount: c.amount });
            }
        });
        return new_categories;
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
        tempArray[index].category_id = Object.keys(categories).find(id => categories[id].toLowerCase() === new_category.toLowerCase());
        setTransactionCategories(tempArray);
    }

    function updateTransactionAmounts(index, new_amount) {
        var tempArray = [...transactionCategories];
        tempArray[index].amount = new_amount * 100;
        setTransactionCategories(tempArray);
    }


    function updateTransaction() {
        async function _updateTransaction() {
            var _categories = consolidateCategories()
            var transactionData = {
                date: transactionDate.toISOString().slice(0, 10),
                cleared: cleared,
                memo: transactionMemo ? transactionMemo : '',
                account_id: parseInt(accountToAccountId()),
                categories: _categories,
                amount: transactionAmount ? transactionAmount : _categories.reduce((prev, curr) => prev + curr.amount, 0)
            }
            if (transactionPayee) {
                var payeeId = payeeToPayeeId();
                if (!payeeId) {
                    // create new payee if not match found
                    const resp = await instance.post(payeeRequests.createPayee,
                        { name: transactionPayee }
                    )
                    payeeId = resp.data.id
                }
                transactionData.payee_id = parseInt(payeeId)
            }
            await instance.put(
                `${transactionRequests.updateTransaction}${transaction.id}`,
                transactionData
            )

            selectTransaction(null)
            reloadTransaction()

        }
        _updateTransaction()
    }

    useEffect(() => {
        setTransactionPayee(payeeFromPayeeId())
    }, [transactionPayeeId, payees])
    useEffect(() => {
        setTransactionAccount(accounts[transactionAccountId])
    }, [transactionAccountId, accounts])
    useEffect(() => {
        setTransactionCategories(transaction.categories)
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
        return <Autosuggest startingValue={transactionPayee} suggestions={payees} allowNewValues={true} allowEmpty={true} updateMethod={(payee) => { setTransactionPayee(payee) }} />
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
        if (transferId) return
        if (selected) {
            return transactionCategories.map((_category, index) => {
                return (<table key={_category.uuid} className="transactonCategoryRow">
                    <tbody><tr>
                        <td className="deleteTransactonCategory"><CloseCircleOutlineIcon size={15} onClick={() => { removeCategory(index) }} /></td>
                        <td className="transactonCategoryName"><Autosuggest startingValue={categories[_category.category_id]} suggestions={categories} allowNewValues={false} updateMethod={(e) => { updateTransactionCategoryNames(index, e) }} /> </td>
                        <td className="transactonCategoryAmount"><MoneyInput startingValue={_category.amount / 100} updateMethod={(e) => { updateTransactionAmounts(index, e) }} updateOnChange={true} /></td>
                    </tr></tbody>
                </table>
                );
            }).concat(<PlusCircleOutlineIcon size={16} onClick={addCategory} />)

        } else {
            return transactionCategories.map((_category) => {
                return (
                    <div key={_category.uuid} className="transactionCategory">
                        <div className="transactionCategoryName">{categories[_category.category_id]}</div>
                        <div className="transactionCategoryAmount">{centsToMoney(_category.amount)}</div>
                    </div>
                )
            })
        }
    }

    const transactionAmountDiv = () => {
        if (selected) {
            return (<div ><MoneyInput startingValue={transactionAmount / 100} updateMethod={(e) => { setTransactionAmount(e * 100) }} updateOnChange={true} /></div>);
        } else {
            return (<div>{centsToMoney(transactionAmount)}</div>)
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
            <td className="transactionAmountColumn"> {transactionAmountDiv()} </td>
            {(selected) && (<td className="transactionSaveColumn">
                <div ref={updateTransactionButton} onClick={() => { updateTransaction() }}><CheckIcon /></div>
                <div ref={deleteTransactionButton} onClick={() => { deleteTransaction() }}> <TrashCanOutlineIcon /> </div>
            </td>)}

        </tr>
    );

}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
