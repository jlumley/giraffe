import React from 'react';
import instance from '../axois';
import accountRequests from '../requests/account';
import { centsToMoney } from '../utils/money_utils';

import { Link } from 'react-router-dom';

import '../style/Aside.css'

class Aside extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
    }
  }

  componentDidMount() {
    this.fetchData();
  };

  fetchData() {
    instance.get(`${accountRequests.fetchAllAccounts}`).then((r) => {
      this.setState({ accounts: r.data });
    });
  }

  render() {
    return (
      <nav className="sidebar">
        <Link className="sidebarLink" to="/"><div className="sidebarLinkDiv">Budget</div></Link>
        <Link className="sidebarLink" to="/account/all"><div className="sidebarLinkDiv">All Accounts</div></Link>
        {
          this.state.accounts.map(a => {
            return (
              <Link className="sidebarLink" to={`/account/${a.id}`}>
                <div className="sidebarLinkDiv">
                  <div className="accountNameDiv">
                    {a.name}
                  </div>
                  <div className="accountBalanceDiv">
                    {centsToMoney(a.cleared_balance + a.uncleared_balance)}
                  </div>
                </div>
              </Link>);
          })
        }
        <Link className="sidebarLink" to="/reports"><div className="sidebarLinkDiv">Reports</div></Link>
      </nav>
    );
  }
}

export default Aside;
