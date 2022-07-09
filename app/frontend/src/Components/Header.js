import React, { useState } from 'react'
import{ motion } from 'framer-motion' 
import { Link } from 'react-router-dom';
import { Divide as Hamburger } from 'hamburger-react'

import SidebarAccount from '../Components/SidebarAccount'

export function Header({ accounts }) {
  const [menu, setMenu] = useState(false);


  const headerDiv = {
    backgroundColor: 'slategrey',
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
    <motion.div 
    style={headerDiv}
    initial={false}
    animate={{
      height: menu ? '330px' : '45px',
      duration:0.8
    }}>
      <Hamburger 
      toggled={menu} 
      toggle={setMenu} 
      color={'white'}/>

      {(menu) && (
        <nav>
          <Link style={SidebarLink} to="/"><div style={SidebarLinkDiv}>Budget</div></Link>
          <Link style={SidebarLink} to="/account/all"><div style={SidebarLinkDiv}>All Accounts</div></Link>
          {
            accounts.map(account => {
              if (!account.hidden) return(<SidebarAccount account={account}/>);
              return null
            })
          }
            <Link style={SidebarLink} to="/payees"><div style={SidebarLinkDiv}>Manage Payees</div></Link>
        </nav>)}
    </motion.div>
  );
}
