import React from 'react'
import DatePicker from 'react-datepicker';

import '../../style/DateInput.css'


export default function DateInput({ selected, onChange }) {
    return (
        <DatePicker className="datePicker" selected={selected} onChange={onChange} />
    )
}
