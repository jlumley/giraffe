import React from 'react';
import instance from '../axois';
import accountRequests from '../requests/account';
import { centsToMoney } from '../utils/money_utils';
import { changeScreenSize } from './Layout';

import { Link } from 'react-router-dom';

import '../style/Aside.css'

class Aside extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screen_size: changeScreenSize(),
      accounts: [],
    }
  }

  componentDidMount() {
    this.fetchData();
    window.addEventListener('resize', () => {
      this.setState({ screen_size: changeScreenSize() });
    });
  };

  fetchData() {
    instance.get(`${accountRequests.fetchAllAccounts}`).then((r) => {
      this.setState({ accounts: r.data });
    });
  }

  render() {
    return (
      <nav className="sidebar">
        <Link className="sidebar-link" to="/"><div className="sidebar-link-div">Budget</div></Link>
        <Link className="sidebar-link" to="/account/all"><div className="sidebar-link-div">All Accounts</div></Link>
        {
          this.state.accounts.map(a => {
            return <Link className="sidebar-link" to={`/account/${a.id}`}><div className="sidebar-link-div"> {a.name} {centsToMoney(a.cleared_balance + a.uncleared_balance)}  </div> </Link>
          })
        }
        <Link className="sidebar-link" to="/reports"><div className="sidebar-link-div">Reports</div></Link>
      </nav>
    );
  }
}

export default Aside;
