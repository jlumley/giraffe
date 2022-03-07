import React, { useState } from 'react'

import logo from "../logo/60.png"

import '../style/Header.css'

export function Header({ smallScreen, toggleSidebar }) {

  return (
    <div className="header">
      <div className="headerRow">
        <div className="headerLogo">
          <img src={logo} />
        </div>
        {(smallScreen) && (
          <div className="menu-button-div" onClick={() => { toggleSidebar() }}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>)}
      </div>
    </div>
  );
}
