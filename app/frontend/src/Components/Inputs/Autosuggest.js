import React, { useEffect, useState } from 'react'
import { Hint } from 'react-autocomplete-hint';


export function Autosuggest({ startingValue, suggestions }) {
    const [text, setText] = useState("")

    useEffect(() => {
        setText(startingValue);
    }, [startingValue])

    suggestions = Object.entries(suggestions).map((e) => { return { label: e[1], id: e[0] } })

    const onFill = (value) => {
        console.log(value)
    }

    return (

        <Hint options={suggestions} allowTabFill={true} onFill={onFill}>
            <input
                value={text}
                onChange={e => setText(e.target.value)} />
        </Hint>
    );
}
