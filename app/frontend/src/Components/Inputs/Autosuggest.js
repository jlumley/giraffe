import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import instance from '../../axois';


export function Autosuggest({ startingValue, options, createOptionUrl, updateMethod, allowNewValues, allowEmpty }) {
    const [optionsArray, setOptionsArray] = useState(options);
    const [value, setValue] = useState(startingValue);

    async function createNewOption(newValue) {
        const resp = await instance.post(createOptionUrl, { name: newValue })
        setValue({ label: newValue, value: resp.data.id })
        const newOptions = [...optionsArray]
        newOptions.push({ label: newValue, value: resp.data.id })
        setOptionsArray(newOptions)
        updateMethod(resp.data.id)
    }

    function handleChange(newValue) {
        updateMethod(newValue)
        setValue(newValue)
    }

    useEffect(() => { }, [options])

    return (
        <div className="autoSuggestDiv">
            {(allowNewValues) && (
                <Creatable
                    options={optionsArray}
                    value={value}
                    isClearable={allowEmpty}
                    onChange={(newValue) => { handleChange(newValue) }}
                    onCreateOption={(newValue) => { createNewOption(newValue) }}
                    maxMenuHeight={175}>
                </Creatable>)}
            {(!allowNewValues) && (
                <Select
                    options={optionsArray}
                    defaultValue={(startingValue)}
                    isClearable={allowEmpty}
                    onChange={handleChange}
                    onCreateOption={createNewOption}>
                </Select>)}
        </div>
    );
}
