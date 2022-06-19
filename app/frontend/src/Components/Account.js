import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';

import instance from '../axois'
import { Transaction } from './Transaction';
import categoryRequests from '../requests/category';
import payeeRequests from '../requests/payee';
import transactionRequests from '../requests/transaction';
import accountRequests from '../requests/account';
import '../style/Account.css'
import { centsToMoney } from '../utils/money_utils';
import { AccountReconciliationModal } from './Modals/AccountReconciliationModal';


export const Account = ({ smallScreen }) => {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [payees, setPayees] = useState({});
    const [categories, setCategories] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [currentAccount, setCurrentAccount] = useState(null);
    const [showReconciled, setShowReconciled] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { id } = useParams();


    const newEmptyTransaction = {
        date: new Date(),
        account_id: (id !== 'all') ? parseInt(id) : null,
        memo: "",
        categories: [{ category_id: 2, amount: 0 }],
        cleared: false,
        amount: 0,
        id: 0,
        new_transaction: true,
        search_str: "",
    };

    function fetchTransactions() {
        async function _fetchTransactions() {
            const params = (id !== 'all') ? { accounts: id } : {}
            if (showReconciled === false) params.reconciled = showReconciled;

            const t = await instance.get(transactionRequests.fetchTransactions, { params })
            setTransactions(t.data.sort((e1, e2) => {
                if (e1.date < e2.date) return 1;
                if (e1.date > e2.date) return -1;

                return e1.id < e2.id;
            }))
        }
        _fetchTransactions()
    }
    function fetchCategories() {
        async function _fetchCategories() {
            const c = await instance.get(categoryRequests.fetchAllCategoryNames)
            setCategories(c.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
        }
        _fetchCategories()
    }
    function fetchPayees() {
        async function _fetchPayees() {
            const p = await instance.get(payeeRequests.fetchAllPayees)
            setPayees(p.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
        }
        _fetchPayees()
    }

    function fetchAccounts() {
        async function _fetchAccounts() {
            const params = (id !== 'all') ? { accounts: id } : {}
            const a = await instance.get(accountRequests.fetchAllAccounts, { params })
            setAccounts(a.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
        }
        _fetchAccounts()
    }

    function fetchCurrentAccount() {
        if (id === 'all') return
        async function _fetchCurrentAccount() {
            const a = await instance.get(`${accountRequests.fetchAccount}${id}`)
            setCurrentAccount(a.data)
        }
        _fetchCurrentAccount()
    }

    function addNewTransaction() {
        async function _addNewTransaction() {
            var tempTransactions = [...transactions]
            tempTransactions.unshift({
                ...newEmptyTransaction
            })
            setTransactions(tempTransactions);
            setSelectedTransaction(0)
        }
        if (selectedTransaction !== null) return
        _addNewTransaction()
    }

    async function deleteTransaction(transaction_id) {
        await instance.delete(`${transactionRequests.deleteTransaction}${transaction_id}`)
        setSelectedTransaction(null)
        fetchTransactions()
    }

    async function deleteTransfer(transfer_id) {
        await instance.delete(
            `${transactionRequests.deleteTransfer}${transfer_id}`,
        )
        setSelectedTransaction(null)
        fetchTransactions()

    }

    const selectTransaction = (transaction_id) => {
        // allow one and only one row to be modified at once
        if (transaction_id === null) {
            fetchPayees()
            fetchTransactions()
        }
        if (transaction_id && selectedTransaction) return
        if (transaction_id === selectedTransaction) return

        setSelectedTransaction(transaction_id)

    }

    function accountClearedBalance() {
        if (!currentAccount) return
        return (
            <div className="accountBalanceDiv">
                <div className="accountBalanceTitle"> Cleared</div>
                <div className="accountBalanceAmount">{centsToMoney(currentAccount.cleared_balance)}</div>
            </div>
        )
    }

    function accountUnclearedBalance() {
        if (!currentAccount) return
        return (
            <div className="accountBalanceDiv">
                <div className="accountBalanceTitle"> Uncleared</div>
                <div className="accountBalanceAmount">{centsToMoney(currentAccount.uncleared_balance)}</div>
            </div>
        )
    }

    function accountTotalBalance() {
        if (!currentAccount) return
        const totalBalance = (currentAccount.cleared_balance + currentAccount.uncleared_balance)
        return (
            <div className="accountBalanceDiv">
                <div className="accountBalanceTitle"> Balance</div>
                <div className="accountBalanceAmount">{centsToMoney(totalBalance)}</div>
            </div>
        )
    }

    const transactionFilters = () =>{
        // <label>Date Range: <input type={"number"}/><Autosuggest/></label>
        return (
            <label className="accountShowReconciledButton"><input type={"checkbox"} defaultChecked={showReconciled} onClick={() => {setShowReconciled(!showReconciled)}}/>Show Reconciled</label>
        )
    }

    const transactionSearch = () => {
        return (
            <input className="accountSearchBar" placeholder="search" value={searchTerm} onChange={(e)=> {setSearchTerm(e.target.value)}}/>
        )
    }

    const createTransactions = (transaction) => {
        return <Transaction
            key={transaction.id}
            transaction={transaction}
            categories={categories}
            payees={payees}
            accounts={accounts}
            selected={(selectedTransaction === transaction.id)}
            selectTransaction={selectTransaction}
            deleteTransaction={() => { deleteTransaction(transaction.id) }}
            deleteTransfer={() => { deleteTransfer(transaction.transfer_id) }}
            fetchPayees={() => { fetchPayees() }}
            reloadAccount={() => {fetchCurrentAccount()}}/>
    }

    useEffect(() => {
        if (searchTerm === "<empty string>"){
            setFilteredTransactions(transactions)
            return
        }
        const _searchTerm =  searchTerm.toLowerCase()
        setFilteredTransactions(
            transactions.filter((t)=>{ return t.search_str.includes(_searchTerm)})
        )
    },[transactions, searchTerm])

    useEffect(() => {
        fetchTransactions();
        fetchCategories();
        fetchPayees();
        fetchAccounts();
        fetchCurrentAccount();
    }, [id]);

    useEffect(() => {
        if (selectedTransaction !== null) return
        setTransactions(transactions.sort((e1, e2) => {
            // sort transactions by date and break ties with id field
            if (e1.date < e2.date) return 1;
            if (e1.date > e2.date) return -1;

            return e1.id < e2.id;
        }))
    }, [transactions, selectedTransaction])

    useEffect(() => {
      fetchTransactions()
    }, [showReconciled])


    return (
        <div className="accountContent">
            <div className="accountHeader">
                <div className="flexbox">
                    <div className="accountBalance">
                        {(!smallScreen) && (accountClearedBalance())}
                        {(!smallScreen) && (accountUnclearedBalance())}
                        {accountTotalBalance()}
                    </div>
                    {(currentAccount) && (<AccountReconciliationModal account={currentAccount} reloadAccount={() => {fetchCurrentAccount(); fetchTransactions()}}/>)}

                </div>
                <div className="accountHeaderButtonRow">
                    <div className="addTransactionButton" onClick={() => { addNewTransaction() }}>New Transaction </div>
                    <div className="fillerDiv"/>
                    {transactionFilters()}
                    {transactionSearch()}

                </div>
            </div>
            <div className="accountTransactionsContent">
                <table>
                    <thead className="accountTransactionsTableHeader"><tr>
                        <th className="accountTransactionsClearedColumn" />
                        <th className="accountTransactionsDateColumn">Date</th>
                        <th className="accountTransactionsAccountColumn">Account</th>
                        <th className="accountTransactionsPayeeColumn">Payee</th>
                        <th className="accountTransactionsMemoColumn">Memo</th>
                        <th className="accountTransactionsCategoryColumn">
                            <div style={{width:'50%'}}>Category Name</div>
                            <div style={{width:'25%'}}>Inflow</div>
                            <div style={{width:'25%'}}>Outflow</div>
                        </th>
                    </tr></thead>
                    <tbody className="accountTransactionsTableBody">
                        {filteredTransactions.map((t) => { return createTransactions(t) })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
