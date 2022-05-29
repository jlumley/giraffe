import React, { useContext } from 'react';
import { AccountsContext } from './Layout';
import { Link } from 'react-router-dom';

import {darkGradient, accentColor} from '../style/Colors'

import SidebarAccount from './SidebarAccount';


const SideBarDiv = {
  width: 'clamp(220px, 20%, 350px)',
  background: darkGradient,
  textAlign: 'left',
}

const SidebarLinkDiv = {
  padding: 'clamp(5px, 3%, 8px)',
  display: 'flex'
}

const SidebarLink = {
  textDecoration: 'none',
  color: accentColor,
}

export default function Sidebar() {

  const accountsContext = useContext(AccountsContext);

  return (
    <div style={SideBarDiv}>
    <nav>
      <Link style={SidebarLink} to="/"><div style={SidebarLinkDiv}><label>Budget</label></div></Link>
      <Link style={SidebarLink} to="/account/all"><div style={SidebarLinkDiv}><label>All Accounts</label></div></Link>
      {
        accountsContext.accounts.map(account => {
          return (<SidebarAccount account={account}/>);
        })
      }
      <Link style={SidebarLink} to="/reports"><div style={SidebarLinkDiv}><label>Reports</label></div></Link>
    </nav>
    </div>
  );

}

