import React from 'react'
import Aside from './Aside'
import {
    Routes,
    Route
  } from "react-router-dom";

import Budget from './Components/Budget';
import AllAccounts from './Components/AllAccounts';
import Reports from './Components/Reports';


function Layout() {
    return (
        <div className="Layout">
        <Aside></Aside>
        <Routes>
            <Route exact path="/accounts" element={<AllAccounts/>} />
            <Route exact path="/reports" element={<Reports/>}/>
            <Route exact path="/" element={<Budget/>}/>
        </Routes>

        </div>
    )
}

export default Layout;
