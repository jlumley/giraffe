import React, { useState, useEffect } from 'react'
import instance from '../axois';
import { VictoryPie } from 'victory'
import reportsRequests from '../requests/reports';


function Reports() {
    //https://stackoverflow.com/questions/13571700/get-first-and-last-date-of-current-month-with-javascript-or-jquery
    const date = new Date(), y = date.getFullYear(), m = date.getMonth();
    const [spentByCategoryGroup, setSpentByCategoryGroup] = useState([]);
    const [startDate, setStartDate] = useState(new Date(y, m, 1));
    const [endDate, setEndDate] = useState(new Date(y, m + 1, 0))

    const reportsDivStyle = {
        display: 'flex',
        margin: '20px',
        width: '90%'
    }
    const reportsHeaderStyle = {
        flex: '1',
        height: '100px',
        backgroundColor: 'dimgrey',
        opacity: 0.5,
        margin: '10px',
        borderRadius: '10px'
    }

    async function fetchSpentByCategoryGroup () {
        const resp = await instance.get(reportsRequests.fetchCategoryGroupStats)
        setSpentByCategoryGroup(resp.data)
    }

    useEffect(()=> {fetchSpentByCategoryGroup()}, [])

    return (
        <div>
        <div
        style={reportsHeaderStyle}>
        </div>
        <div
        style={reportsDivStyle}>
            <VictoryPie
                padding={125}
                colorScale={"cool"}
                x={"category_group"}
                y={(e) => {return Math.abs(e.amount)}}
                data={spentByCategoryGroup}
            />

        </div>
        </div>
    )
}

export default Reports
