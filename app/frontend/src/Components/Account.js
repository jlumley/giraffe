import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import instance from '../axois'
import transactionRequests from '../requests/transaction';

import '../style/Account.css'
import { Transaction } from './Transaction';

export const Account = () => {
    const [transactions, setTransactions] = useState([]);
    const { id } = useParams();

    useEffect(() => {
        fetchTransactions();
    }, [id]);

    const fetchTransactions = () => {
        async function _fetchTransactions() {
            const params = {};
            if (id !== 'all') {
                params.accounts = id
            }
            const resp = await instance.get(transactionRequests.fetchTransactions, { params })
            setTransactions(resp.data)
        }
        _fetchTransactions()
    }

    const createTransactions = (transaction) => {
        return <Transaction transaction={transaction} />
    }

    return (
        <div className="accountContent">
            <div className="accountHeader">
                <div className="addTransactionButton">

                </div>
                <div className="filterTransactionsButton">

                </div>
                <div className="searchTransactions">

                </div>
            </div>
            <div className="accountTransactionsContent">
                <table className="accountTransactionsTable">
                    <thead className="accountTransactionsTableHeader">
                        <tr>
                            <th>Date</th>
                            <th>Payee</th>
                            <th>Catgory</th>
                            <th>Memo</th>
                            <th>Outflow</th>
                            <th>Inflow</th>
                            <th>Cleared</th>
                        </tr>
                    </thead>
                    <tbody className="accountTransactionsTableBody">
                        {transactions.map((t) => { return createTransactions(t) })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
