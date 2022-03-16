import React, { useEffect, useState } from 'react'
import { Hint } from 'react-autocomplete-hint';

import '../../style/Autosuggest.css'

export function Autosuggest({ startingValue, suggestions, updateMethod, allowNewValues, allowEmpty }) {
    const [text, setText] = useState(startingValue);
    useEffect(() => { }, [startingValue, suggestions])
    suggestions = Object.values(suggestions).map(s => { return s.toLowerCase() })

    const onBlur = (event) => {
        if (allowEmpty && !event.target.value) {
            updateMethod("")
        } else if (allowNewValues || suggestions.includes(event.target.value.toLowerCase())) {
            updateMethod(event.target.value)
        } else {
            setText(startingValue)
        }
    }

    return (
        <div className="autoSuggestDiv">
            <Hint options={suggestions} allowTabFill={true} >
                <input className="autoSuggestInput"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onBlur={onBlur} />
            </Hint>
        </div>
    );
}
