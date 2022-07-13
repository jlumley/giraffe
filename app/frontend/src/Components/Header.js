import React, { useState } from 'react'
import{ motion } from 'framer-motion' 
import { Divide as Hamburger } from 'hamburger-react'

import AccountsMenu from './Menus/AccountsMenu';

export function Header({ accounts }) {
  const [menu, setMenu] = useState(false);

  const headerDiv = {
    backgroundColor: 'slategrey'
  }

  return (
    <motion.div 
    style={headerDiv}
    initial={false}
    animate={{
      height: menu ? 'fit-content' : '50px'
    }}
    transition={{
      duration:0.4,
      type: 'spring'
      
    }}>
      <Hamburger 
        toggled={menu} 
        toggle={setMenu} 
        color={'white'}/>
      <AccountsMenu accounts={accounts}/>
    </motion.div>
  );
}
