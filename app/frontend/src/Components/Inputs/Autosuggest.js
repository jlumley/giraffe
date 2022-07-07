import React, { useState } from 'react'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import instance from '../../axois';


export default function Autosuggest({ startingValue, options, createOptionUrl, onBlur, allowNewValues, allowEmpty }) {
    const [optionsArray, setOptionsArray] = useState(options);
    const [value, setValue] = useState(startingValue);

    const inputStyle = {
        control: (provided) => ({
          ...provided,
          borderRadius: '10px',
          minHeight: '25px',
          height: '25px',
        })
    };

    async function createNewOption(newValue) {
        const resp = await instance.post(createOptionUrl, { name: newValue })
        setValue({ label: newValue, value: resp.data.id })
        const newOptions = [...optionsArray]
        newOptions.push({ label: newValue, value: resp.data.id })
        setOptionsArray(newOptions)
        onBlur({ label: newValue, value: resp.data.id })
    }

    function handleChange(newValue) {
        onBlur(newValue)
        setValue(newValue)
    }

    return (
        <div>
            {(allowNewValues) && (
                <Creatable
                    components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
                    styles={inputStyle}
                    options={optionsArray}
                    value={value}
                    isClearable={allowEmpty}
                    onChange={handleChange}
                    onCreateOption={createNewOption}
                    maxMenuHeight={175}>
                </Creatable>)}
            {(!allowNewValues) && (
                <Select
                    components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
                    styles={inputStyle}
                    options={optionsArray}
                    defaultValue={value}
                    isClearable={allowEmpty}
                    onChange={handleChange}>
                </Select>)}
        </div>
    );
}
