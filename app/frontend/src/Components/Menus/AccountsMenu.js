import React from 'react'
import { Link } from 'react-router-dom';

import { AddAccountModal } from '../Modals/AddAccountModal';
import AccountsMenuAccount from './AccountsMenuAccount';

import '../../style/Menus/AccountsMenu.css'

function AccountsMenu({ accounts, fetchAllAccounts }) {
  return (
    <nav>
        <Link style={{textDecoration: 'none'}} to="/">
            <div className='AccountMenuLinkDiv'>Budget</div>
        </Link>
        <Link style={{textDecoration: 'none'}} to="/account/all">
            <div className='AccountMenuLinkDiv'>All Accounts</div>
        </Link>
        {
        accounts.map(account => {
            if (!account.hidden) return (<AccountsMenuAccount account={account} />);
            return null
        })
        }
        <Link style={{textDecoration: 'none'}} to="/reports">
            <div className='AccountMenuLinkDiv'>Reports</div>
        </Link>
        <Link style={{textDecoration: 'none'}} to="/payees">
            <div className='AccountMenuLinkDiv'>Manage Payees</div>
        </Link>
        <AddAccountModal fetchAllAccounts={fetchAllAccounts}/>
    </nav>
  )
}

export default AccountsMenu;
