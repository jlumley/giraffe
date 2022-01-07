import React, {useEffect, useState} from 'react';
import { ProSidebar, Menu, MenuItem, SubMenu, SidebarHeader, SidebarContent, SidebarFooter} from 'react-pro-sidebar';
import { FaMoneyBillAlt, FaPiggyBank, FaRegChartBar } from 'react-icons/fa'

import instance from './axois';

import accountRequests from './requests/account';

import 'react-pro-sidebar/dist/css/styles.css';
import { Link } from 'react-router-dom';

const Aside = () => {
  const [accounts, setAccounts] = useState([]);
   useEffect(() => {
      async function fetchData(){
          const accounts = await instance.get(`${accountRequests.fetchAllAccounts}`);
          setAccounts(accounts.data)
      }
      fetchData()
  }, []);
  return (
    <ProSidebar>
        <Menu>
          <SidebarHeader>
            A LOGO WILL GO HERE
          </SidebarHeader>
          <SidebarContent>
            <MenuItem icon={<FaMoneyBillAlt/>}>Budget <Link to="/"/></MenuItem>
            <MenuItem icon={<FaPiggyBank/>}>All Accounts <Link to="/accounts"/></MenuItem>
            <MenuItem icon={<FaRegChartBar/>}>Reports <Link to="/reports"/></MenuItem>
            <SubMenu title="Budget Accounts">
            {
              accounts.map(a => {
                console.log(a);
                return <MenuItem> {a.name} {a.cleared_balance + a.uncleared_balance} <Link to={`/account/${a.id}`}/> </MenuItem>
              })
            }
            </SubMenu>
          </SidebarContent>
          <SidebarFooter>
            Help!!
          </SidebarFooter>
        </Menu>
      </ProSidebar>
  );
};

export default Aside;
