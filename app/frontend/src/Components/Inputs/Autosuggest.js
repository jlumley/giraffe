import React, { useEffect, useState } from 'react'
import Select from 'react-select'
import Creatable from 'react-select/creatable'
import instance from '../../axois';


export function Autosuggest({ startingValue, suggestionsUrl, createOptionUrl, updateMethod, allowNewValues, allowEmpty }) {
    const [optionsArray, setOptionsArray] = useState([]);
    const [value, setValue] = useState(startingValue);

    async function _fetch_suggestions() {
        const resp = await instance.get(suggestionsUrl)
        setOptionsArray(
            Object.keys(resp.data).map((key) => { return { value: resp.data[key].id, label: resp.data[key].name } })
        )
    }

    async function createNewOption(newValue) {
        const resp = await instance.post(createOptionUrl, { name: newValue })
        _fetch_suggestions()
        setValue({ label: newValue, value: resp.data.id })
        updateMethod(resp.data.id)
    }

    function handleChange(newValue) {
        console.log(newValue)
        updateMethod(newValue.value)
        setValue(newValue)
    }

    useEffect(() => {
        _fetch_suggestions()
    }, [])


    return (
        <div className="autoSuggestDiv">
            {(allowNewValues) && (<Creatable
                options={optionsArray}
                value={value}
                isClearable={allowEmpty}
                onChange={(newValue) => { handleChange(newValue) }}
                onCreateOption={(newValue) => { createNewOption(newValue) }}
                maxMenuHeight={175}>
            </Creatable>)}
            {(!allowNewValues) && (<Select options={optionsArray} defaultValue={(startingValue)} isClearable={allowEmpty} onChange={handleChange} onCreateOption={createNewOption}></Select>)}
        </div>
    );
}
