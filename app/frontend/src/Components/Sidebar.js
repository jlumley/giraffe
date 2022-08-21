import React from 'react';
import{ motion } from 'framer-motion' 


import AccountsMenu from './Menus/AccountsMenu';

const SideBarDiv = {
  width: 'clamp(220px, 20%, 350px)',
  height: '100%',
  background: 'slategrey',
  textAlign: 'left',
}

export default function Sidebar({ accounts, fetchAllAccounts }) {

  return (
    <motion.div
        style={SideBarDiv}
        initial={{x: '-100%'}}
        animate={{x: '0'}}
        transition={{
          duration: 0.3
        }}>
      <AccountsMenu accounts={accounts} fetchAllAccounts={fetchAllAccounts}/>
    </motion.div>
  );

}

