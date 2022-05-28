import React, { useEffect, useState } from 'react';

import CurrencyInput from 'react-currency-input-field';
import '../../style/MoneyInput.css'

export default function MoneyInput({ startingValue, onBlur }) {
    const [value, setValue] = useState(startingValue);


    useEffect(() => {
        setValue(startingValue)
    }, [startingValue])

    const handleChangeValue = (event) => {
        setValue(event);
    }

    const handleBlur = (event) => {
        onBlur(value);
    }

    return (
        < CurrencyInput
            className="currencyInput"
            maxLength="8"
            prefix="$"
            value={value}
            onValueChange={handleChangeValue}
            onBlur={handleBlur} />
    );
}
