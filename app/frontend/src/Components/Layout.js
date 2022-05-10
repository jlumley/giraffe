import React, { useState, useEffect } from 'react'
import Aside from './Aside'
import {
    Routes,
    Route
} from "react-router-dom";

import { Budget } from './Budget';
import { Account } from './Account';
import Reports from './Reports';
import { Header } from './Header';

import instance from '../axois';
import accountRequests from '../requests/account';

import '../style/Layout.css'

const SMALL_SCREEN = 1000;
export const AccountsContext = React.createContext({
    accounts: [],
    setAccounts: () => { }
});

function setScreenSize() {
    if (window.innerWidth > SMALL_SCREEN) {
        return false;
    } else {
        return true;
    }
}
export function Layout() {
    const [smallScreen, setSmallScreen] = useState(setScreenSize());
    const [sidebar, setSidebar] = useState(false);
    const [accounts, setAccounts] = useState([]);

    function fetchAllAccounts() {
        async function _fetchAllAccounts() {
            setAccounts(await (await instance.get(accountRequests.fetchAllAccounts)).data)
        }
        _fetchAllAccounts()
    }

    useEffect(() => {
        window.addEventListener('resize', () => {
            setSmallScreen(setScreenSize());
        })
        fetchAllAccounts()
    }, [])

    return (
        <div className="layout">
            <Header smallScreen={smallScreen} toggleSidebar={() => { setSidebar(!sidebar) }} />
            <AccountsContext.Provider value={{ accounts, setAccounts }}>
                <div className="mainContent">
                    {(sidebar || !smallScreen) && (
                        <Aside sidebar={sidebar} />
                    )}
                    <div className="workspaceContent">
                        <Routes>
                            <Route path="/account/:id" element={<Account />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/" element={<Budget smallScreen={smallScreen} />} />
                        </Routes>
                    </div>
                </div>
            </AccountsContext.Provider>
        </div>
    );
}
