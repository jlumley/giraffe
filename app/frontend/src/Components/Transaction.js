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
import payeeRequests from '../requests/payee';
import accountRequests from '../requests/account';
import categoryRequests from '../requests/category';

import { Autosuggest } from './Inputs/Autosuggest';
import { centsToMoney } from '../utils/money_utils';
import { MoneyInput } from './Inputs/MoneyInput';


import "react-datepicker/dist/react-datepicker.css";
import "../style/Transaction.css"


export const Transaction = ({ transaction, categories, payees, accounts, selected, selectTransaction, deleteTransaction }) => {
    const [transactionId, setTransactionId] = useState(transaction.id);
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

    const payeeFromPayeeId = () => {
        if (!transferId) return payees[transactionPayeeId]
        return `Transfer to/from ${accounts[transactionPayeeId]}`
    }

    const payeeOptions = () => {
        const x = Object.keys(payees).map((id) => { return { value: id, label: payees[id] } })
        console.log(typeof x)
        return x
    }

    const accountOptions = () => {
        const x = Object.keys(accounts).map((id) => { return { value: id, label: accounts[id] } })
        console.log(typeof x)
        return x
    }

    const transferOptions = () => {
        const x = Object.keys(accounts).map((id) => { return { value: id, label: `Transfer to/from ${accounts[id]}` } })
        console.log(typeof x)
        return x
    }

    const [transactionAccount, setTransactionAccount] = useState(accounts[transaction.account_id]);
    const [transactionPayee, setTransactionPayee] = useState(payeeFromPayeeId());

    function reloadTransaction() {
        async function _reloadTransaction() {
            instance.get(`${transactionRequests.fetchTransaction}${transactionId}`).then((resp) => {
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
            `${transactionRequests.updateTransaction}${transactionId}`,
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
        tempArray[index].category_id = parseInt(new_category)
        setTransactionCategories(tempArray);
    }

    function updateTransactionAmounts(index, new_amount) {
        var tempArray = [...transactionCategories];
        tempArray[index].amount = new_amount * 100;
        setTransactionCategories(tempArray);
    }

    function createTransaction() {
        async function _createTransaction() {
            var _categories = consolidateCategories()
            var transactionData = {
                date: transactionDate.toISOString().slice(0, 10),
                cleared: cleared,
                memo: transactionMemo ? transactionMemo : '',
                account_id: parseInt(transactionAccountId),
                categories: _categories,
                amount: transactionAmount ? transactionAmount : _categories.reduce((prev, curr) => prev + curr.amount, 0)
            }
            if (transactionPayeeId) transactionData.payee_id = parseInt(transactionPayeeId)
            const resp = await instance.post(
                `${transactionRequests.createNewTransaction}`,
                transactionData
            )
            setTransactionId(resp.data.id)
            selectTransaction(null)
        }
        _createTransaction()
    }

    function createTransfer() {
        async function _createTransfer() {
            var transferData = {
                date: transactionDate.toISOString().slice(0, 10),
                cleared: cleared,
                memo: transactionMemo ? transactionMemo : '',
                amount: transactionAmount,
            }
            if (transferData.amount > 0) transferData.from_account_id = parseInt(transactionPayeeId)
            if (transferData.amount < 0) transferData.to_account_id = parseInt(transactionAccountId)
            const resp = await instance.post(
                `${transactionRequests.createNewTransfer}`,
                transferData
            )
            const _transactionId = resp.data.forEach((t) => { if (t.account_id === transactionAccountId) return t.id })
            setTransactionId(_transactionId)
            selectTransaction(null)
        }
        _createTransfer()
    }

    function updateTransaction() {
        async function _updateTransaction() {
            var _categories = consolidateCategories()
            var transactionData = {
                date: transactionDate.toISOString().slice(0, 10),
                cleared: cleared,
                memo: transactionMemo ? transactionMemo : '',
                account_id: parseInt(transactionAccountId),
                categories: _categories,
                amount: transactionAmount ? transactionAmount : _categories.reduce((prev, curr) => prev + curr.amount, 0)
            }
            if (transactionPayeeId) transactionData.payee_id = parseInt(transactionPayeeId)
            await instance.put(
                `${transactionRequests.updateTransaction}${transactionId}`,
                transactionData
            )
            selectTransaction(null)
            reloadTransaction()
        }
        if (transferId) {
            if (transaction.new_transaction) {
                console.log('create new transfer')
                createTransfer()

            } else {
                console.log('update existing transfer')
            }
        } else {
            if (transaction.new_transaction) {
                console.log('create new transaction')
                createTransaction()
            } else {
                console.log('update exiting transaction')
                _updateTransaction()
            }
        }
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
            if (!transaction.new_transaction) reloadTransaction()
            window.addEventListener('keypress', handleEnter);
        }
        return () => {
            window.removeEventListener('keypress', handleEnter);
        }
    }, [selected])


    const selectCurrentTransaction = (e) => {
        e.target.focus()
        selectTransaction(transactionId)
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
        if (transaction.new_transaction) return <Autosuggest startingValue={{ value: transactionPayeeId, label: transactionPayee }} options={transferOptions().concat(payeeOptions())} updateMethod={(account_id) => { setTransactionPayeeId(account_id) }} />
        if (transferId) return <Autosuggest startingValue={{ value: transactionPayeeId, label: transactionPayee }} options={transferOptions()} updateMethod={(account_id) => { setTransactionPayeeId(account_id) }} />
        return <Autosuggest startingValue={{ value: transactionPayeeId, label: transactionPayee }} options={payeeOptions()} createOptionUrl={payeeRequests.createPayee} allowNewValues={true} allowEmpty={true} updateMethod={(payee_id) => { setTransactionPayeeId(payee_id) }} />
    }
    const accountInputField = () => {
        if (!selected) return <div>{transactionAccount}</div>
        return <Autosuggest startingValue={{ value: transactionAccountId, label: transactionAccount }} options={accountOptions()} updateMethod={(account_id) => { setTransactionAccountId(account_id) }} />
    }
    const memoInputField = () => {
        if (!selected) return <div>{transactionMemo}</div>
        return <input className="transactionMemo" value={transactionMemo} onChange={(e) => { setTransactionMemo(e.target.value) }} />
    }

    const transactionCategory = () => {
        if (transferId) return
        if (selected) {
            return transactionCategories.map((_category, index) => {
                return (<table key={_category.uuid} className="transactionCategoryRow">
                    <tbody><tr>
                        <td className="deleteTransactionCategory"><CloseCircleOutlineIcon size={15} onClick={() => { removeCategory(index) }} /></td>
                        <td className="transactionCategoryName"><Autosuggest startingValue={{ value: _category.id, label: categories[_category.id] }} suggestionsUrl={categoryRequests.fetchAllCategoryNames} updateMethod={(e) => { updateTransactionCategoryNames(index, e) }} /> </td>
                        <td className="transactionCategoryAmount"><MoneyInput startingValue={_category.amount / 100} updateMethod={(e) => { updateTransactionAmounts(index, e) }} updateOnChange={true} /></td>
                    </tr></tbody>
                </table>
                );
            }).concat(<PlusCircleOutlineIcon size={15} onClick={addCategory} />)

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