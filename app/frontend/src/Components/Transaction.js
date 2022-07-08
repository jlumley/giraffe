import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import instance from '../axois'

import CheckboxMarkedIcon from "mdi-react/CheckboxMarkedIcon"
import CheckboxBlankOutlineIcon from "mdi-react/CheckboxBlankOutlineIcon"
import TrashCanOutlineIcon from 'mdi-react/TrashCanOutlineIcon'
import LockOutlineIcon from 'mdi-react/LockOutlineIcon'
import CheckIcon from 'mdi-react/CheckIcon'

import transactionRequests from '../requests/transaction';
import transferRequests from '../requests/transfer';
import payeeRequests from '../requests/payee';

import Autosuggest from './Inputs/Autosuggest';

import "../style/Transaction.css"
import TransactionCategory from './TransactionCategory';
import DateInput from './Inputs/DateInput';


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
    const [transactionCategories, setTransactionCategories] = useState(transaction.categories.map(obj => ({ ...obj, uuid: uuidv4() })));
    const updateTransactionButton = useRef(null);
    const deleteTransactionButton = useRef(null);


    const transactionMemoInputStyle = {
        width: '80%',
        backgroundColor:'white',
        border: 'solid lightgrey 1px',
        height: '22px',
        borderRadius: '10px',
        outline: 'none',
        paddingLeft: '10px'
    }

    const payeeOptions = () => {
        return Object.keys(payees).map((id) => { return { value: id, label: payees[id] } })
    }

    const accountOptions = () => {
        return Object.keys(accounts).map((id) => { return { value: id, label: accounts[id] } })
    }

    const transferOptions = () => {
        return Object.keys(accounts).map((id) => { return { value: id, label: `Transfer to/from ${accounts[id]}`, transfer: true } })
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


    async function updateTransactionCleared (){
        await instance.put(
            `${transactionRequests.updateTransactionCleared}${transactionId}/${!cleared}`,
        )
        setCleared(!cleared)
        reloadAccount()
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

    async function _createTransaction() {
        var transactionData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            account_id: parseInt(accountId),
            categories: consolidateCategories()
        }
        if (payeeId) transactionData.payee_id = parseInt(payeeId)
        const resp = await instance.post(
            `${transactionRequests.createNewTransaction}`,
            transactionData
        )
        setTransactionId(resp.data.id)
    }
    async function _createTransfer() {
        var _categories = consolidateCategories()
        var transferData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            amount: _categories.reduce((prev, curr) => prev + curr.amount, 0),
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
        setTransferId(resp.data.transfer_id)
    }

    async function _updateTransfer() {
        const _categories = consolidateCategories()
        var transferData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            amount: Math.round(_categories.reduce((prev, curr) => prev + curr.amount, 0)),
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
        const transactionData = {
            date: date.toISOString().slice(0, 10),
            cleared: cleared,
            memo: memo ? memo : '',
            account_id: parseInt(accountId),
            categories: consolidateCategories(),
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
        return <DateInput selectedDate={date} onChange={(date) => { setDate(date) }} />
    }
    const payeeInputField = () => {
        if (!selected) return <div>{payeeLabel}</div>
        if (transaction.new_transaction) return <Autosuggest startingValue={{ value: payeeId, label: payeeLabel }} options={transferOptions().concat(payeeOptions())} createOptionUrl={payeeRequests.createPayee} onBlur={(newValue) => { setPayeeId(newValue.value); setTransfer(newValue.transfer) }} allowNewValues={true} />
        if (transfer) return <Autosuggest startingValue={{ value: payeeId, label: payeeLabel }} options={transferOptions()} onBlur={(newValue) => { setPayeeId(newValue.value) }} allowNewValues={true} />
        return <Autosuggest startingValue={{ value: payeeId, label: payeeLabel }} options={payeeOptions()} createOptionUrl={payeeRequests.createPayee} allowNewValues={true} allowEmpty={true} onBlur={(newValue) => { setPayeeId(newValue.value) }} />
    }
    const accountInputField = () => {
        if (!selected) return <div>{accountLabel}</div>
        return <Autosuggest startingValue={{ value: accountId, label: accountLabel }} options={accountOptions()} onBlur={(newValue) => { setAccountId(newValue.value) }} />
    }
    const memoInputField = () => {
        if (!selected) return <div>{memo}</div>
        return (<input 
            style={transactionMemoInputStyle}
            value={memo} 
            onChange={(e) => { setMemo(e.target.value) }} 
            />
        );
    }

    const transactionCategory = () => {
       return <TransactionCategory 
       categories={categories} 
       transactionCategories={transactionCategories}
       setTransactionCategories={setTransactionCategories}
       selected={selected}
       transfer={transfer}/>
    }


    return (
        <tr className={`transactionRow ${selected ? 'selected' : ''}`}>
            <td className="transactionClearedColumn"> {clearedIcon()} </td>
            <td className="transactionDateColumn" onClick={selectCurrentTransaction} > {dateSelector()} </td>
            <td className="transactionAccountColumn" onClick={selectCurrentTransaction} > {accountInputField()} </td>
            <td className="transactionPayeeColumn" onClick={selectCurrentTransaction} > {payeeInputField()} </td>
            <td className="transactionMemoColumn" onClick={selectCurrentTransaction} > {memoInputField()} </td>
            <td className="transactionCategoriesColumn" onClick={selectCurrentTransaction} > {transactionCategory()} </td>
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
