import React, {useEffect, useState} from 'react'
import Aside from './Aside'
import {
    Routes,
    Route
  } from "react-router-dom";

import Budget from './Budget';
import Accounts from './Accounts';
import Reports from './Reports';

import '../style/Layout.css'

export const smallScreen = 1000;


function Layout() {

    const [screenSize, setScreenSize] = useState("smallScreen");


    useEffect(() => {
        const changeScreenSize = () => {
            if (window.innerWidth > smallScreen){
                setScreenSize("largeScreen");
            } else {
                setScreenSize("smallScreen");
            }

        }

        window.addEventListener('resize', changeScreenSize)

        return () => {
            window.removeEventListener('resize', changeScreenSize)
        }
    }, []);



    return (
        <div>
            <div className="header">
            </div>
            <div className="contentRow">
                <div>
                    <Aside screenSize={screenSize}/>
                </div>
                <div className="pageContent" className={screenSize}>
                    <Routes>
                        <Route exact path="/account" element={<Accounts/>} />
                        <Route exact path="/reports" element={<Reports/>}/>
                        <Route exact path="/" element={<Budget/>}/>
                    </Routes>
                </div>
            </div>
        </div>
    )
}

export default Layout;
