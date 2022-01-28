import React, { useEffect } from 'react'
import { useParams } from 'react-router';
import instance from '../axois'

import '../style/Account.css'
import NewTransaction from './Transactions/NewTransaction';

const Account = () => {

    const { id } = useParams();

    useEffect(() => {
        fetchTransactionData();
    }, []);

    return (
        <div className="accountContent">
            <NewTransaction account_id={id} />
        </div>
    );
}

export default Account;


const fetchTransactionData = () => {
    instance.get()
}
