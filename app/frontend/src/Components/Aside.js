import React, { useContext } from 'react';
import { AccountsContext } from './Layout';
import { centsToMoney } from '../utils/money_utils';
import { Link } from 'react-router-dom';

import {darkGradient, accentColor} from '../style/Colors'


const SideBarDiv = {
  width: 'clamp(220px, 20%, 550px)',
  background: darkGradient,
  textAlign: 'left',
}

const SidebarLinkDiv = {
  padding: 'clamp(5px, 3%, 8px)',
  color: accentColor,
  display: 'flex'
}

const SidebarLink = {
  textDecoration: 'none',
  color: accentColor,
}

const SidebarAccountBalanceLabel = {
  textAlign: 'right',
  paddingRight: 'max(5px, 3%)',
  flex: '1',
}

export function Aside() {

  const accountsContext = useContext(AccountsContext);

  return (
    <nav style={SideBarDiv}>
      <Link style={SidebarLink} to="/"><div style={SidebarLinkDiv}><label>Budget</label></div></Link>
      <Link style={SidebarLink} to="/account/all"><div style={SidebarLinkDiv}><label>All Accounts</label></div></Link>
      {
        accountsContext.accounts.map(a => {
          return (
            <div>
            
            <Link style={SidebarLink} to={`/account/${a.id}`}>
              <div style={SidebarLinkDiv}>
                <label>{a.name}</label>
                <label style={SidebarAccountBalanceLabel}>
                  {centsToMoney(a.cleared_balance + a.uncleared_balance)}
                </label>
              </div>
            </Link>
            </div>);
        })
      }
      <Link style={SidebarLink} to="/reports"><div style={SidebarLinkDiv}><label>Reports</label></div></Link>
    </nav>
  );

}

export default Aside;
