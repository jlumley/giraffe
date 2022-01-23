import React from 'react'
import Aside from './Aside'
import {
    Routes,
    Route
} from "react-router-dom";

import { Budget } from './Budget';
import Accounts from './Accounts';
import Reports from './Reports';
import { Header } from './Header';

import '../style/Layout.css'

export const smallScreen = 1000;

export class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.toggleSidebar = this.toggleSidebar.bind(this)
        this.state = {
            screen_size: changeScreenSize(),
            sidebar: false,
        }
    }

    toggleSidebar() {
        this.setState({ sidebar: !this.state.sidebar });
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
            this.setState({ screen_size: changeScreenSize() });
        });
    }


    render() {
        return (
            <div className="layout">
                <Header toggleSidebar={this.toggleSidebar} />
                <div className="mainContent">
                    {(this.state.sidebar || this.state.screen_size === "largeScreen") && (
                        <Aside sidebar={this.state.sidebar} />
                    )}
                    <div className="workspaceContent">
                        <Routes>
                            <Route exact path="/account" element={<Accounts />} />
                            <Route exact path="/reports" element={<Reports />} />
                            <Route exact path="/" element={<Budget />} />
                        </Routes>
                    </div>
                </div>
            </div>
        );
    }
}

export function changeScreenSize() {
    if (window.innerWidth > smallScreen) {
        return "largeScreen";
    } else {
        return "smallScreen"
    }
}
