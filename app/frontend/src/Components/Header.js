import React from 'react'

import { changeScreenSize } from './Layout'

import '../style/Header.css'

export class Header extends React.Component {
    constructor(props) {
      super(props);
      this.toggleSidebar = this.props.toggleSidebar;
      this.state = {
        screen_size: changeScreenSize(),
      }
    }

    componentDidMount(){
      window.addEventListener('resize', ()=>{
        this.setState({screen_size: changeScreenSize()});
      });
    }


    render() {
        return (
            <div className="header">
              <div className="headerRow">
                <div className="headerLogo"></div>
                {(this.state.screen_size === "smallScreen") && (
                <div className="menu-button-div" onClick={this.toggleSidebar}>
                  <div className="bar1"></div>
                  <div className="bar2"></div>
                  <div className="bar3"></div>
                </div>)}
              </div>
            </div>
        );
    }
}
