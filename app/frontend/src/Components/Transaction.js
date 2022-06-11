import React, { useEffect, useRef, useState } from 'react';
import DatePicker from "react-datepicker";
import { v4 as uuidv4 } from 'uuid';
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import PlusCircleOutlineIcon from 'mdi-react/PlusCircleOutlineIcon'
import CloseCircleOutlineIcon from 'mdi-react/CloseCircleOutlineIcon'
import TrashCanOutlineIcon from 'mdi-react/TrashCanOutlineIcon'
import LockOutlineIcon from 'mdi-react/LockOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';
import transferRequests from '../requests/transfer';
import payeeRequests from '../requests/payee';

import Autosuggest from './Inputs/Autosuggest';
import { centsToMoney } from '../utils/money_utils';
import MoneyInput from './Inputs/MoneyInput';

import "../style/Transaction.css"


export const Transaction = ({
    transaction,
    categories,
    payees,
    accounts,
    selected,
    selectTransaction,
    deleteTransaction,
    deleteTransfer,
    fetchPayees,
    reloadAccount,
}) => {

    const [transactionId, setTransactionId] = useState(transaction.id);
    const [transfer, setTransfer] = useState(transaction.transfer_id ? true : false)
    const [cleared, setCleared] = useState(transaction.cleared);
    const [transferId, setTransferId] = useState(transaction.transfer_id);
    const [date, setDate] = useState(new Date(transaction.date));
    const [accountId, setAccountId] = useState(transaction.account_id);
    const [accountLabel, setAccountLabel] = useState(transaction.account_label);
    const [payeeId, setPayeeId] = useState(transaction.payee_id);
    const [payeeLabel, setPayeeLabel] = useState(transaction.payee_label)
    const [memo, setMemo] = useState(transaction.memo);
    const [amount, setAmount] = useState(transaction.amount);
    const [transactionCategories, setTransactionCategories] = useState(transaction.categories.map(obj => ({ ...obj, uuid: uuidv4() })));
    const updateTransactionButton = useRef(null);
    const deleteTransactionButton = useRef(null);

    const payeeOptions = () => {
        return Object.keys(payees).map((id) => { return { value: id, label: payees[id] } })
    }

    const accountOptions = () => {
        return Object.keys(accounts).map((id) => { return { value: id, label: accounts[id] } })
    }

    const transferOptions = () => {
        return Object.keys(accounts).map((id) => { return { value: id, label: `Transfer to/from ${accounts[id]}`, transfer: true } })
    }

    const categoryOptions = () => {
        return Object.keys(categories).map((id) => { return { value: id, label: categories[id] } })
    }

    function reloadTransaction() {
        async function _reloadTransaction() {
            instance.get(`${transactionRequests.fetchTransaction}${transactionId}`).then((resp) => {
                setDate(convertDateToUTC(new Date(resp.data.date)));
                setAccountId(resp.data.account_id);
                setPayeeId(resp.data.payee_id);
                setAccountLabel(resp.data.account_label);
                setPayeeLabel(resp.data.payee_label);
                setMemo(resp.data.memo);
                setTransactionCategories(resp.data.categories.map(obj => ({ ...obj, uuid: uuidv4() })));
            })
            fetchPayees()
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
        async function _updateTransactionCleared (){
            await instance.put(
                `${transactionRequests.updateTransaction}${transactionId}`,
                { cleared: !cleared }
            )
            setCleared(!cleared)
            reloadAccount()
            }
        _updateTransactionCleared()
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
                new_categories.push({ category_id: parseInt(c.category_id), amount: Math.round(c.amount) });
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


    async function _createTransaction() {
        var _categories = consolidateCategories()
        var transactionData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            account_id: parseInt(accountId),
            categories: _categories,
            amount: amount ? amount : _categories.reduce((prev, curr) => prev + curr.amount, 0)
        }
        if (payeeId) transactionData.payee_id = parseInt(payeeId)
        const resp = await instance.post(
            `${transactionRequests.createNewTransaction}`,
            transactionData
        )
        setTransactionId(resp.data.id)
    }
    async function _createTransfer() {
        var transferData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            amount: amount,
        }
        if (transferData.amount > 0) {
            transferData.from_account_id = parseInt(payeeId)
            transferData.to_account_id = parseInt(accountId)
        } else {
            transferData.from_account_id = parseInt(accountId)
            transferData.to_account_id = parseInt(payeeId)
        }
        const resp = await instance.post(
            `${transferRequests.createNewTransfer}`,
            transferData
        )
        var _transactionId;
        for (const t in resp.data) { if (t.account_id === accountId) _transactionId = t.id }
        setTransactionId(_transactionId)
        setTransferId(resp.data[0].transfer_id)
    }

    async function _updateTransfer() {
        var transferData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            amount: Math.round(amount),
        }
        if (transferData.amount > 0) {
            transferData.from_account_id = parseInt(payeeId)
            transferData.to_account_id = parseInt(accountId)
        } else {
            transferData.from_account_id = parseInt(accountId)
            transferData.to_account_id = parseInt(payeeId)
        }
        await instance.put(
            `${transferRequests.updateTransfer}${transferId}`,
            transferData
        )
    }

    async function _updateTransaction() {
        const _categories = consolidateCategories()
        const transactionData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            account_id: parseInt(accountId),
            categories: _categories,
            amount: Math.round(amount ? amount : _categories.reduce((prev, curr) => prev + curr.amount, 0))
        }
        if (payeeId) transactionData.payee_id = parseInt(payeeId)
        await instance.put(
            `${transactionRequests.updateTransaction}${transactionId}`,
            transactionData
        )
        reloadTransaction()
    }


    async function update() {
        if (transfer) {
            if (transaction.new_transaction) {
                await _createTransfer()

            } else {
                await _updateTransfer()
            }
        } else {
            if (transaction.new_transaction) {
                await _createTransaction()
            } else {
                await _updateTransaction()
            }
        }
        reloadAccount()
        selectTransaction(null)

    }

    useEffect(() => {
        setTransactionCategories(transaction.categories.map(obj => ({ ...obj, uuid: uuidv4() })))
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
        if (transaction.reconciled) {
            return <LockOutlineIcon size="18px" />
        }
        if (cleared) {
            return <CheckboxMarkedIcon className="clearedIcon" size="18px" onClick={updateTransactionCleared} />
        } else {
            return <CheckboxBlankOutlineIcon className="clearedIcon" size="18px" onClick={updateTransactionCleared} />
        }
    }

    const dateSelector = () => {
        if (!selected && date) return <div>{date.toISOString().slice(0, 10)}</div>
        return <DatePicker className="transactionDate" selected={date} onChange={(date) => { setDate(date) }} />
    }
    const payeeInputField = () => {
        if (!selected) return <div>{payeeLabel}</div>
        if (transaction.new_transaction) return <Autosuggest startingValue={{ value: payeeId, label: payeeLabel }} options={transferOptions().concat(payeeOptions())} createOptionUrl={payeeRequests.createPayee} updateMethod={(newValue) => { setPayeeId(newValue.value); setTransfer(newValue.transfer) }} allowNewValues={true} />
        if (transfer) return <Autosuggest startingValue={{ value: payeeId, label: payeeLabel }} options={transferOptions()} updateMethod={(newValue) => { setPayeeId(newValue.value) }} allowNewValues={true} />
        return <Autosuggest startingValue={{ value: payeeId, label: payeeLabel }} options={payeeOptions()} createOptionUrl={payeeRequests.createPayee} allowNewValues={true} allowEmpty={true} updateMethod={(newValue) => { setPayeeId(newValue.value) }} />
    }
    const accountInputField = () => {
        if (!selected) return <div>{accountLabel}</div>
        return <Autosuggest startingValue={{ value: accountId, label: accountLabel }} options={accountOptions()} updateMethod={(newValue) => { setAccountId(newValue.value) }} />
    }
    const memoInputField = () => {
        if (!selected) return <div>{memo}</div>
        return <input className="transactionMemo" value={memo} onChange={(e) => { setMemo(e.target.value) }} />
    }

    const transactionCategory = () => {
        if (transfer) return
        if (selected) {
            return transactionCategories.map((_category, index) => {
                return (<table key={_category.uuid} className="transactionCategoryRow">
                    <tbody><tr>
                        <td className="deleteTransactionCategory"><CloseCircleOutlineIcon size={15} onClick={() => { removeCategory(index) }} /></td>
                        <td className="transactionCategoryName"><Autosuggest startingValue={{ value: _category.category_id, label: categories[_category.category_id] }} options={categoryOptions()} updateMethod={(newValue) => { updateTransactionCategoryNames(index, newValue.value) }} /> </td>
                        <td className="transactionCategoryAmount"><MoneyInput startingValue={_category.amount / 100} onBlur={(e) => { updateTransactionAmounts(index, e) }} updateOnChange={true} /></td>
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

    const amountDiv = () => {
        if (selected) {
            return (<div ><MoneyInput startingValue={amount / 100} onBlur={(e) => { setAmount(e * 100) }} updateOnChange={true} /></div>);
        } else {
            return (<div>{centsToMoney(amount)}</div>)
        }
    }

    return (
        <tr className={`transactionRow ${selected ? 'selected' : ''}`}>
            <td className="transactionClearedColumn"> {clearedIcon()} </td>
            <td className="transactionDateColumn" onClick={selectCurrentTransaction} > {dateSelector()} </td>
            <td className="transactionAccountColumn" onClick={selectCurrentTransaction} > {accountInputField()} </td>
            <td className="transactionPayeeColumn" onClick={selectCurrentTransaction} > {payeeInputField()} </td>
            <td className="transactionMemoColumn" onClick={selectCurrentTransaction} > {memoInputField()} </td>
            <td className="transactionCategoriesColumn" onClick={selectCurrentTransaction} > {transactionCategory()} </td>
            <td className="transactionAmountColumn" onClick={selectCurrentTransaction} > {amountDiv()} </td>
            {(selected) && (<td className="transactionSaveColumn">
                <div ref={updateTransactionButton} onClick={() => { update() }}><CheckIcon /></div>
                <div ref={deleteTransactionButton} onClick={() => {
                    if (!transferId) deleteTransaction();
                    if (transferId) deleteTransfer();
                }}> <TrashCanOutlineIcon /> </div>
            </td>)}

        </tr>
    );

}

function convertDateToUTC(date) { return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()); }
