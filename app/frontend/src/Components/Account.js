import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import instance from '../axois'
import categoryRequests from '../requests/category';
import payeeRequests from '../requests/payee';
import transactionRequests from '../requests/transaction';
import accountRequests from '../requests/account';

import '../style/Account.css'
import { Transaction } from './Transaction';
import TrashCanOutlineIcon from 'mdi-react/TrashCanOutlineIcon';

export const Account = () => {
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [payees, setPayees] = useState({});
    const [categories, setCategories] = useState({});
    const [accounts, setAccounts] = useState([]);
    const { id } = useParams();

    const newEmptyTransaction = {
        date: new Date().toLocaleString().slice(0, 10),
        account_id: (id !== 'all') ? parseInt(id) : 0,
        memo: "",
        categories: [],
        cleared: false,
        amount: 0
    };


    useEffect(() => {
        fetchTransactions();
        fetchCategories();
        fetchPayees();
        fetchAccounts();
    }, [id]);

    useEffect(() => {
        setTransactions(transactions.sort((e1, e2) => {
            // sort transactions by date and break ties with id field
            if (e1.date < e2.date) return 1;
            if (e1.date > e2.date) return -1;

            return e1.id < e2.id;
        }))
    }, [transactions])

    const fetchTransactions = () => {
        async function _fetchTransactions() {
            const params = (id !== 'all') ? { accounts: id } : {}
            const t = await instance.get(transactionRequests.fetchTransactions, { params })
            setTransactions(t.data.sort((e1, e2) => {
                if (e1.date < e2.date) return 1;
                if (e1.date > e2.date) return -1;

                return e1.id < e2.id;
            }))
        }
        _fetchTransactions()
    }
    const fetchCategories = () => {
        async function _fetchCategories() {

            const c = await instance.get(categoryRequests.fetchAllCategoryNames)
            setCategories(c.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
        }
        _fetchCategories()
    }
    const fetchPayees = () => {
        async function _fetchPayees() {

            const p = await instance.get(payeeRequests.fetchAllPayees)
            setPayees(p.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
        }
        _fetchPayees()
    }

    const fetchAccounts = () => {
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


    function addNewTransaction() {
        async function _addNewTransaction() {
            const resp = await instance.post(
                transactionRequests.createNewTransaction,
                { ...newEmptyTransaction }
            )

            const r = await instance.get(
                `${transactionRequests.fetchTransaction}${resp.data.id}`
            )
            var tempTransactions = [...transactions]
            tempTransactions.push({
                ...r.data
            })
            setTransactions(tempTransactions);
            setSelectedTransaction(r.data.id)
        }

        if (selectedTransaction > 0) return
        _addNewTransaction()
    }

    function deleteTransaction(transaction_id) {
        async function _deleteTransaction() {
            const resp = instance.delete(
                `${transactionRequests.deleteTransaction}${transaction_id}`,
            )
            console.log(resp)
            const tempTransactions = transactions.filter(t => t.id !== transaction_id);

            setTransactions(tempTransactions);
            setSelectedTransaction(null)
        }

        if (selectedTransaction <= 0) return
        _deleteTransaction()
    }

    const selectTransaction = (transaction_id) => {
        // allow one and only one row to be modified at once
        if (!transaction_id) {
            fetchPayees()
        }
        if (transaction_id && selectedTransaction) return
        if (transaction_id === selectedTransaction) return

        setSelectedTransaction(transaction_id)

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
            deleteTransaction={() => { deleteTransaction(transaction.id) }} />
    }

    return (
        <div className="accountContent">
            <div className="accountHeader">
                <div className="addTransactionButton" onClick={() => { addNewTransaction() }}>New Transaction </div>
                <div className="filterTransactionsButton" />
                <div className="searchTransactions" />
            </div>
            <div className="accountTransactionsContent">
                <table>
                    <thead className="accountTransactionsTableHeader"><tr>
                        <th className="accountTransactionsClearedColumn" />
                        <th className="accountTransactionsDateColumn">Date</th>
                        <th className="accountTransactionsAccountColumn">Account</th>
                        <th className="accountTransactionsPayeeColumn">Payee</th>
                        <th className="accountTransactionsMemoColumn">Memo</th>
                        <th className="accountTransactionsCategoryColumn">Categories</th>
                        <th className="accountTransactionsAmountColumn">Amount</th>
                        <th className="accountTransactionsamountColumn"></th>
                    </tr></thead>
                    <tbody className="accountTransactionsTableBody">
                        {transactions.map((t) => { return createTransactions(t) })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
