import React from 'react'
import { forwardRef, useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';

import "react-datepicker/dist/react-datepicker.css";


export default function DateInput({ dateSelected, onChange }) {

    const [startDate, setStartDate] = useState(dateSelected ? dateSelected : new Date());

    const customDateInputStyle = {
        width: '85px',
        backgroundColor:'white',
        borderColor: 'lightgrey',
        borderStyle: 'solid',
        height: '25px',
        borderWidth: '1px',
        borderRadius: '10px',
        cursor: 'pointer',
    };

    useEffect(() => {
      onChange(startDate)
    }, [startDate])
    

    const CustomInput = forwardRef(({ value, onClick }, ref) => (
      <button onClick={onClick} ref={ref} style={customDateInputStyle}> 
        {value}
      </button>
    ));
    return (
      <DatePicker
        todayButton={'Today'}
        dateFormat={'yyyy-MM-dd'}
        selected={startDate}
        onChange={(date) => setStartDate(date)}
        customInput={<CustomInput />}
      />
    );
}
