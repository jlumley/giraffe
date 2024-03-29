import React, { useState, useEffect } from 'react'
import instance from '../axois';
import Chart from 'react-apexcharts'
import reportsRequests from '../requests/reports';
import DateInput from './Inputs/DateInput';
import '../style/Reports.css'


function Reports() {
    //https://stackoverflow.com/questions/13571700/get-first-and-last-date-of-current-month-with-javascript-or-jquery
    const date = new Date(), y = date.getFullYear(), m = date.getMonth();
    const [spentByCategoryGroupAmounts, setSpentByCategoryGroupAmounts] = useState();
    const [spentByCategoryGroupNames, setSpentByCategoryGroupNames] = useState();
    const [spentByCategoryAmounts, setSpentByCategoryAmounts] = useState();
    const [spentByCategoryNames, setSpentByCategoryNames] = useState();
    const [startDate, setStartDate] = useState(new Date(y, m, 1));
    const [endDate, setEndDate] = useState(new Date(y, m + 1, 0))

    const reportsDivStyle = {
        display: 'flex',
        margin: '20px',
        width: '90%'
    }
    const pieChartStyle = {
        width:'50%'
    }
    const reportsHeaderStyle = {
        flex: '1',
        height: '100px',
        backgroundColor: 'dimgrey',
        opacity: 0.5,
        margin: '1%',
        borderRadius: '10px'
    }

    const pieChartOptions = {
        plotOptions: {
            pie: {
                expandOnClick: false
            }
        },
        
        chart: {
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        }
    }

    async function fetchSpentByCategoryGroup () {
        const query_params = {
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
        }

        const resp = await instance.get(reportsRequests.fetchCategoryGroupStats, { params: query_params })
        setSpentByCategoryGroupNames(resp.data.map(e=> e.category_group))
        setSpentByCategoryGroupAmounts(resp.data.map(e=> Math.abs(e.amount)/100))
    }
    async function fetchSpentByCategory () {
        const query_params = {
          start_date: startDate.toISOString().slice(0, 10),
          end_date: endDate.toISOString().slice(0, 10),
        }
        const resp = await instance.get(reportsRequests.fetchCategoryStats, { params: query_params })
        setSpentByCategoryNames(resp.data.map(e=> e.name))
        setSpentByCategoryAmounts(resp.data.map(e=> Math.abs(e.amount)/100))
    }

    const dateRangeSelector = () => {
        return (
            <div className="reportsHeaderDiv">
            <span className="reportsHeaderLabel" > Start Date: </span>
                <DateInput dateSelected={startDate} onChange={(e) => {setStartDate(e)}}   />
            <span className="reportsHeaderLabel" > End Date: </span>
                <DateInput dateSelected={endDate} onChange={(e) => {setEndDate(e)}}   />
            </div>
        );
    }

    useEffect(()=> {
        fetchSpentByCategoryGroup()
        fetchSpentByCategory()
    }, [startDate, endDate])

    return (
        <div>
        <div style={reportsHeaderStyle}>
            {dateRangeSelector()}
        </div>
        <div style={reportsDivStyle}>
            {(spentByCategoryGroupAmounts)&&(<Chart
            style={pieChartStyle}
            options={{
                ...pieChartOptions,
                labels: spentByCategoryGroupNames,
                title: {
                    text: "Spent by Category Group"
                }
            }}
            series={spentByCategoryGroupAmounts}
            type="donut">    
            </Chart>)}
            {(spentByCategoryAmounts)&&(<Chart
                style={pieChartStyle}
                options={{
                    ...pieChartOptions,
                    labels: spentByCategoryNames,
                    title: {
                        text: "Spent by Category"
                    }
                }}
                series={spentByCategoryAmounts}
                type="donut">    
            </Chart>)}
        </div>
        </div>
    )
}

export default Reports
