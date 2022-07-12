import React from 'react'
import { useState, useEffect } from 'react';

export default function DateInput({ dateSelected, onChange }) {

    const [currentDate, setCurrentDate] = useState(dateSelected ? dateSelected : new Date());

    const customDateInputStyle = {
        minWidth: '95px',
        backgroundColor:'white',
        borderColor: 'lightgrey',
        color: 'black',
        borderStyle: 'solid',
        height: '25px',
        borderWidth: '1px',
        borderRadius: '10px',
        cursor: 'pointer',
    };

    useEffect(() => {
      onChange(currentDate)
    }, [currentDate])
    
    return (
      <input
        style={customDateInputStyle}
        required={true}
        type={'date'}
        value={currentDate.toISOString().slice(0, 10)}
        onChange={(e) => {setCurrentDate(e.target.valueAsDate)}}
      >
      </input>
    );
}
