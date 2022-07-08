import React, {useState} from 'react'
import { Link } from 'react-router-dom';
import SidebarAccount from '../Components/SidebarAccount'
import { Divide as Hamburger } from 'hamburger-react'

export function Header({ mobile, accounts, }) {
  const [menu, setMenu] = useState(false);


  const headerDiv = {
    backgroundColor: 'slategrey',
    height: 'fit-content'
  }
  const SidebarLinkDiv = {
    padding: 'clamp(5px, 3%, 8px)',
    display: 'flex'
  }
  
  const SidebarLink = {
    textDecoration: 'none',
    color: 'white',
    fontWeight: 'bold' 
  }
  

  return (
    <div style={headerDiv}>
        {(mobile) &&(
        <Hamburger 
        toggled={menu} 
        toggle={setMenu} 
        color={'white'}/>)}

        {(menu && mobile) && (
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
        </nav>)}
    </div>
  );
}
