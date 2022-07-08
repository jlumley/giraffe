import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import {
    Routes,
    Route
} from "react-router-dom";

import { Budget } from './Budget';
import { Account } from './Account';
import Reports from './Reports';
import { Header } from './Header';
import ManagePayees from './ManagePayees';

import instance from '../axois';
import accountRequests from '../requests/account';
import { lightBackground } from '../style/Colors';


const MOBILE_SCREEN = 1024;

const LayoutDiv = {
    height: '100%',
    width: '100%',
    position: 'fixed',
    backgroundColor: lightBackground,
    display: 'flex',
    flexDirection: 'column'
}

const MainContentDiv = {
    flexGrow: '1',
    display: 'flex',
    minHeight: '0'
}

const WorkspaceContentDiv = {
    flexGrow:'1'
}

function setMobile() {
    if (window.innerWidth > MOBILE_SCREEN) {
        return false;
    } else {
        return true;
    }
}
export function Layout() {
    const [mobile, setmobile] = useState(setMobile());
    const [accounts, setAccounts] = useState([]);

    function fetchAllAccounts() {
        async function _fetchAllAccounts() {
            setAccounts(await (await instance.get(accountRequests.fetchAllAccounts)).data)
        }
        _fetchAllAccounts()
    }

    useEffect(() => {
        window.addEventListener('resize', () => {
            setmobile(setMobile());
        })
        fetchAllAccounts()
    }, [])

    return (
        <div style={LayoutDiv}>
            <Header mobile={mobile} accounts={accounts}/>
            <div style={MainContentDiv}>
                {(!mobile) && (
                    <Sidebar accounts={accounts}/>
                )}
                <div style={WorkspaceContentDiv}>
                    <Routes>
                        <Route path="/account/:id" element={<Account mobile={mobile} />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/payees" element={<ManagePayees />} />
                        <Route path="/" element={<Budget mobile={mobile} />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}
