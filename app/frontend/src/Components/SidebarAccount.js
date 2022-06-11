import React, {useState} from 'react';
import { centsToMoney } from '../utils/money_utils';
import { Link } from 'react-router-dom';
import { lightBackground} from '../style/Colors'

import DotsVerticalIcon from 'mdi-react/DotsVerticalIcon'
import EyeOffOutlineIcon from 'mdi-react/EyeOffOutlineIcon'
  
  const AccountDiv = {
    padding: 'clamp(5px, 3%, 8px)',
    display: 'flex',
    verticalAlign: 'bottom',
    alignItems: 'center'
  }
  
  const LinkDiv = {
    flexGrow: '1',
    textDecoration: 'none',
    color: lightBackground,
  }

  const NameAndBalanceDiv = {
    flexGrow: '1',
    display: 'flex',
  }

  const NameDiv = {
      flexGrow: '1',
      userSelection: 'none'
  }

  const BalanceDiv = {
    paddingRight: 'max(5px, 3%)',
    width: 'fit-content',
  }

  const MenuDots = {
    color: lightBackground,
    cursor: 'pointer'
  }

  const HideAccountButton = {
    color: 'salmon',
    cursor: 'pointer'
  }

function SidebarAccount({account}) {
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);  
  return (
    <div style={AccountDiv}>
        <DotsVerticalIcon style={MenuDots} onClick={()=> {setShowDeleteIcon(!showDeleteIcon)}}/>
        <Link style={LinkDiv} to={`/account/${account.id}`}>
            <div style={NameAndBalanceDiv}>
                <div style={NameDiv}>{account.name}</div>
                <div style={BalanceDiv}>{centsToMoney(account.cleared_balance + account.uncleared_balance)}</div>
            </div>
        </Link>
        {(showDeleteIcon) && (<EyeOffOutlineIcon style={HideAccountButton}/>)}
    </div>
  )
}

export default SidebarAccount