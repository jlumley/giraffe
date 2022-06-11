import React from 'react';
import { Link } from 'react-router-dom';

import {darkGradient, lightBackground} from '../style/Colors'
import { AddAccountModal } from './Modals/AddAccountModal';
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
  color: lightBackground,
}

export default function Sidebar({accounts}) {

  return (
    <div style={SideBarDiv}>
    <nav>
      <Link style={SidebarLink} to="/"><div style={SidebarLinkDiv}>Budget</div></Link>
      <Link style={SidebarLink} to="/account/all"><div style={SidebarLinkDiv}>All Accounts</div></Link>
      {
        accounts.map(account => {
          if (!account.hidden) return(<SidebarAccount account={account}/>);
          return null
        })
      }
      <Link style={SidebarLink} to="/reports"><div style={SidebarLinkDiv}>Reports</div></Link>
      <Link style={SidebarLink} to="/payees"><div style={SidebarLinkDiv}>Manage Payees</div></Link>
      <AddAccountModal/>
    </nav>
    </div>
  );

}

