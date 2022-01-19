import React from 'react'
import instance from '../axois';
import transactionRequests from '../requests/transaction';
import { changeScreenSize } from './Layout';

import '../style/Category.css'

import {centsToMoney} from '../utils/money_utils'

export class Category extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
          category: this.props.category, 
          screen_size: changeScreenSize(),
          parsed_transactions: [],
        }
      this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({
            category: {
                ...this.state.category,
                name: event.target.value
            }});  
    }

    componentDidMount(){
        this.fetchData();
        window.addEventListener('resize', ()=>{
            this.setState({screen_size: changeScreenSize()});
        });
    };

    fetchData(){
        // get today's date YYYY-MM-DD
        const today = new Date().toISOString().slice(0, 10);
        const month_start = `${new Date().toISOString().slice(0, 8)}01`
        // get all transactions for this category
        const params = {
            categories: this.state.category.id,
            after: month_start,
            before: today
        };
        instance.get(transactionRequests.fetchTransactions, {params}).then((r) =>{
            // parse transactions
            var parsed_transactions = [];
            r.data.forEach(t => {
                var amount = 0;
                t.categories.forEach(c => {
                    if (c.category_id === this.state.category.id){
                        amount += c.amount;
                    }
                });
                parsed_transactions.push(
                    {
                        date: t.date,
                        payee: t.payee_id,
                        amount: amount
                    }
                )
            });
            this.setState({parsed_transactions: parsed_transactions})
        });
    }
  
    render() {
        return (
            <div>
                <div className="baseCategory">
                <div className={`categoryNameBox ${this.state.screen_size}CategoryNameBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}><input className="categoryNameInput" type="text" value={this.state.category.name} onChange={this.handleChange} /></div></div>
                <div className={`categoryValueBox ${this.state.screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}>{centsToMoney(this.state.category.assigned_this_month)}</div></div>
                {(this.state.screen_size === "largeScreen") && (<div className={`categoryValueBox ${this.state.screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}>{centsToMoney(this.state.parsed_transactions.reduce((a, b) => a + b.amount, 0))}</div></div> )}
                <div className={`categoryValueBox ${this.state.screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}>{centsToMoney(this.state.category.balance)}</div></div>
                </div>
            </div>
        );
    }
  }
