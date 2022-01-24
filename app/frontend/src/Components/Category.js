import React from 'react'
import instance from '../axois';
import transactionRequests from '../requests/transaction';
import categoryRequests from '../requests/category';

import { changeScreenSize } from './Layout';


import CurrencyInput from 'react-currency-input-field';
import { centsToMoney } from '../utils/money_utils'

import '../style/Category.css'

export class Category extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            category: {
                ...this.props.category
            },
            changed_assigned_this_month: this.props.category.assigned_this_month / 100,
            screen_size: changeScreenSize(),
            parsed_transactions: [],
            current_date: this.props.current_date,
        }
        this.refreshCategoryData = this.refreshCategoryData.bind(this);
        this.handleChangeCategoryName = this.handleChangeCategoryName.bind(this);
        this.handleChangeCategoryAssigned = this.handleChangeCategoryAssigned.bind(this);
        this.updateCategoryName = this.updateCategoryName.bind(this);
        this.updateCategoryAssignment = this.updateCategoryAssignment.bind(this);
    }

    updateCategoryName(event) {
        console.debug(`updating category name ${this.state.category.id}`)
        const req_data = {
            'name': this.state.category.name
        }
        instance.put(`${categoryRequests.updateCategory}${this.state.category.id}`, req_data).then(
            (resp) => {
                console.debug()
                this.refreshCategoryData()
            }
        )
    }

    updateCategoryAssignment(event) {
        const req_data = {
            'amount': (this.state.changed_assigned_this_month * 100 - this.state.category.assigned_this_month),
            'date': this.state.current_date.toISOString().slice(0, 10)
        }
        let url = '';
        if (req_data.amount < 0) {
            url = `${categoryRequests.unassignCategory}${this.state.category.id}`
        }
        else if (req_data.amount > 0) {
            url = `${categoryRequests.assignCategory}${this.state.category.id}`
        }
        if (url) {
            instance.put(url, req_data).then((resp) => {
                this.refreshCategoryData();
                console.debug(resp);
            })
        }
    }

    refreshCategoryData() {
        const date = this.state.current_date.toISOString().slice(0, 10)
        instance.get(`${categoryRequests.fetchCategory}/${this.state.category.id}/${date}`).then((r) => {
            console.log(r)
            this.setState({
                category: r.data[0],
                changed_assigned_this_month: r.data[0].assigned_this_month / 100

            })
        })
    }

    handleChangeCategoryName(event) {
        this.setState({
            category: {
                ...this.state.category,
                name: event.target.value
            }
        });
    }
    handleChangeCategoryAssigned(value) {
        this.setState({
            changed_assigned_this_month: value
        });
    }

    componentDidMount() {
        this.fetchData();
        window.addEventListener('resize', () => {
            this.setState({ screen_size: changeScreenSize() });
        });
    };

    fetchData() {
        // get today's date YYYY-MM-DD
        const today = this.state.current_date.toISOString().slice(0, 10);
        const month_start = `${this.state.current_date.toISOString().slice(0, 8)}01`
        // get all transactions for this category
        const params = {
            categories: this.state.category.id,
            after: month_start,
            before: today
        };
        instance.get(transactionRequests.fetchTransactions, { params }).then((r) => {
            // parse transactions
            var parsed_transactions = [];
            r.data.forEach(t => {
                var amount = 0;
                t.categories.forEach(c => {
                    if (c.category_id === this.state.category.id) {
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
            this.setState({ parsed_transactions: parsed_transactions })
        });
    }

    render() {
        return (
            <div className="baseCategory" >
                <div className={`categoryCell ${this.state.screen_size}CategoryNameBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}><input className="categoryInput" type="text" value={this.state.category.name} onChange={this.handleChangeCategoryName} onBlur={this.updateCategoryName} /></div></div>
                <div className={`categoryCell ${this.state.screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}>< CurrencyInput className="categoryInput" maxLength="8" prefix="$" value={this.state.changed_assigned_this_month} onValueChange={this.handleChangeCategoryAssigned} onBlur={this.updateCategoryAssignment} /></div></div>
                {(this.state.screen_size === "largeScreen") && (<div className={`categoryCell ${this.state.screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}>{centsToMoney(this.state.parsed_transactions.reduce((a, b) => a + b.amount, 0))}</div></div>)}
                <div className={`categoryCell ${this.state.screen_size}CategoryValueBox`}><div className={`categoryValueOutline ${this.state.screen_size}CategoryValueOutline`}>{centsToMoney(this.state.category.balance)}</div></div>
            </div>
        );
    }
}
