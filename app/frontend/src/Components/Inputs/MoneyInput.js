import React, { useEffect, useState } from 'react';

import CurrencyInput from 'react-currency-input-field';


import '../../style/MoneyInput.css'


export function MoneyInput({ startingValue, updateMethod }) {
    const [value, setValue] = useState(startingValue);


    useEffect(() => {
    }, [startingValue])

    const handleChange = (event) => {
        setValue(event);
    }

    const handleUpdate = (event) => {
        updateMethod(value)
    }

    const handleKeyPress = (event) => {
        if (event.key !== 'Enter') return

        event.target.blur();
    }

    return (
        < CurrencyInput className="currencyInput" maxLength="8" prefix="$" value={value} onValueChange={handleChange} onBlur={handleUpdate} onKeyDown={handleKeyPress} />
    );
}
