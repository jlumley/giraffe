import React from 'react'
import DatePicker from 'react-datepicker';

import '../../style/DateInput.css'
import "react-datepicker/dist/react-datepicker.css";


export default function DateInput({ selected, onChange }) {
    if (!selected) selected=new Date()
    return (
        <DatePicker className="datePicker" selected={selected} onChange={onChange} />
    )
}
