import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import instance from '../axois'
import categoryRequests from '../requests/category';
import payeeRequests from '../requests/payee';
import transactionRequests from '../requests/transaction';

import '../style/Account.css'
import { Transaction } from './Transaction';

export const Account = () => {
    const [transactions, setTransactions] = useState([]);
    const [payees, setPayees] = useState({});
    const [categories, setCategories] = useState({});
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
            const t = await instance.get(transactionRequests.fetchTransactions, { params })
            setTransactions(t.data)
            const c = await instance.get(categoryRequests.fetchAllCategoryNames)
            setCategories(c.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
            const p = await instance.get(payeeRequests.fetchAllPayees)
            setPayees(p.data.reduce((map, obj) => {
                map[obj.id] = obj.name
                return map;
            }, {}))
        }
        _fetchTransactions()
    }

    const createTransactions = (transaction) => {
        return <Transaction transaction={transaction} categories={categories} payees={payees} />
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
                <table>
                    <thead className="accountTransactionsTableHeader">
                        <tr>
                            <th className="accountTransactionsClearedColumn" />
                            <th className="accountTransactionsDateColumn">Date</th>
                            <th className="accountTransactionsPayeeColumn">Payee</th>
                            <th className="accountTransactionsMemoColumn">Memo</th>
                            <th className="accountTransactionsCategoryColumn">Catgory</th>
                            <th className="accountTransactionsOutflowColumn">Outflow</th>
                            <th className="accountTransactionsInflowColumn">Inflow</th>
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
