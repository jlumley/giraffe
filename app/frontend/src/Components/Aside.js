import React, {useEffect, useState} from 'react';
//import { FaMoneyBillAlt, FaPiggyBank, FaRegChartBar } from 'react-icons/fa'
import instance from '../axois';
import accountRequests from '../requests/account';
import { Link } from 'react-router-dom';
  import {centsToMoney} from '../utils/money_utils'

import 'react-pro-sidebar/dist/css/styles.css';
import '../style/Aside.css'


const Aside = ({screenSize}) => {
  const [accounts, setAccounts] = useState([]);
  const [toggleMenu, setToggleMenu] = useState(false);

  const toggleNav = () => {
    setToggleMenu(!toggleMenu);
  }

  useEffect(() => {
    async function fetchData(){
      const accounts = await instance.get(`${accountRequests.fetchAllAccounts}`);
      setAccounts(accounts.data)
    }
    fetchData()

  }, []);

  return (
    <div>
      {(toggleMenu || screenSize == "largeScreen") && (
      <nav className="sidebar">
        <Link className="sidebar-link" to="/"><div className="sidebar-link-div">Budget</div></Link>
        <Link className="sidebar-link" to="/accounts"><div className="sidebar-link-div">All Accounts</div></Link>
        {
          accounts.map(a => {
            return <Link className="sidebar-link" to={`/account/${a.id}`}><div className="sidebar-link-div"> {a.name} {centsToMoney(a.cleared_balance + a.uncleared_balance)}  </div> </Link>
          })
        }
        <Link className="sidebar-link" to="/reports"><div className="sidebar-link-div">Reports</div></Link>
      </nav>)}

      {(screenSize == "smallScreen" && toggleNav) && (
      <nav className="sidebar sidebar-retracted">
        <div className="menu-button" onClick={toggleNav}>
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </div>
      </nav>)}

    </div>

  );

};

export default Aside;
