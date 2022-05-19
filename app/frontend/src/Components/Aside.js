import React, { useContext } from 'react';
import { AccountsContext } from './Layout';
import { centsToMoney } from '../utils/money_utils';

import { Link } from 'react-router-dom';

import '../style/Aside.css'

export function Aside({ }) {

  const accountsContext = useContext(AccountsContext);

  return (
    <nav className="sidebar">
      <Link className="sidebarLink" to="/"><div className="sidebarLinkDiv">Budget</div></Link>
      <Link className="sidebarLink" to="/account/all"><div className="sidebarLinkDiv">All Accounts</div></Link>
      {
        accountsContext.accounts.map(a => {
          return (
            <Link className="sidebarLink" to={`/account/${a.id}`}>
              <div className="sidebarLinkDiv">
                <div className="accountNameDiv">
                  {a.name}
                </div>
                <div className="sidebarAccountBalanceDiv">
                  {centsToMoney(a.cleared_balance + a.uncleared_balance)}
                </div>
              </div>
            </Link>);
        })
      }
      <Link className="sidebarLink" to="/reports"><div className="sidebarLinkDiv">Reports</div></Link>
    </nav>
  );

}

export default Aside;
