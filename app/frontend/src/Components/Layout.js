import React from 'react'
import Aside from './Aside'
import {
    Routes,
    Route
} from "react-router-dom";

import { Budget } from './Budget';
import { Account } from './Account';
import Reports from './Reports';
import { Header } from './Header';

import '../style/Layout.css'

export const smallScreen = 1000;

export class Layout extends React.Component {
    constructor(props) {
        super(props);
        this.toggleSidebar = this.toggleSidebar.bind(this)
        this.state = {
            smallScreen: setScreenSize(),
            sidebar: false,
        }
    }

    toggleSidebar() {
        this.setState({ sidebar: !this.state.sidebar });
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
            this.setState({
                smallScreen: setScreenSize(),
            });
        });
    }


    render() {
        return (
            <div className="layout">
                <Header smallScreen={this.state.smallScreen} toggleSidebar={this.toggleSidebar} />
                <div className="mainContent">
                    {(this.state.sidebar || !this.state.smallScreen) && (
                        <Aside sidebar={this.state.sidebar} />
                    )}
                    <div className="workspaceContent">
                        <Routes>
                            <Route path="/account/:id" element={<Account />} />
                            <Route path="/reports" element={<Reports />} />
                            <Route path="/" element={<Budget smallScreen={this.state.smallScreen} />} />
                        </Routes>
                    </div>
                </div>
            </div>
        );
    }
}

function setScreenSize() {
    if (window.innerWidth > smallScreen) {
        return false;
    } else {
        return true;
    }
}
