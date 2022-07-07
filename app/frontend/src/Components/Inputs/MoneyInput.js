import React, { useEffect, useState } from 'react';

import CurrencyInput from 'react-currency-input-field';

export default function MoneyInput({ startingValue, onBlur }) {
    const [value, setValue] = useState(startingValue);

    const currencyInputStyle =  {
        width: '80%',
        borderColor: 'hsl(0, 0%, 80%)',
        borderStyle: 'solid',
        height: '24px',
        borderWidth: '1px',
        color: 'var(--dark-color)',
        borderRadius: '10px',
        paddingLeft: '5px',
    }

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
            style={currencyInputStyle}
            maxLength="8"
            prefix="$"
            value={value}
            onValueChange={handleChangeValue}
            onBlur={handleBlur} />
    );
}
