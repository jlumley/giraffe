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

import instance from '../axois';
import accountRequests from '../requests/account';
import { lightBackground } from '../style/Colors';

const SMALL_SCREEN = 1024;

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
    display: 'flex'
}

const WorkspaceContentDiv = {
    flexGrow:'1'
}

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
        <div style={LayoutDiv}>
            <Header smallScreen={smallScreen} toggleSidebar={() => { setSidebar(!sidebar) }} />
            <AccountsContext.Provider value={{ accounts, setAccounts }}>
                <div style={MainContentDiv}>
                    {(sidebar || !smallScreen) && (
                        <Sidebar sidebar={sidebar} />
                    )}
                    <div style={WorkspaceContentDiv}>
                        <Routes>
                            <Route path="/account/:id" element={<Account smallScreen={smallScreen} />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/" element={<Budget smallScreen={smallScreen} />} />
                        </Routes>
                    </div>
                </div>
            </AccountsContext.Provider>
        </div>
    );
}
