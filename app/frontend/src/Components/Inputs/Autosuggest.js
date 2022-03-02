import React, { useEffect, useState } from 'react'
import { Hint } from 'react-autocomplete-hint';

import '../../style/Autosuggest.css'

export function Autosuggest({ startingValue, suggestions, updateMethod, allowNewValues }) {
    const [text, setText] = useState(startingValue);
    useEffect(() => { }, [startingValue, suggestions])
    suggestions = Object.values(suggestions).map(s => { return s.toLowerCase() })

    const onBlur = (event) => {
        if (!allowNewValues && !suggestions.includes(event.target.value.toLowerCase())) {
            console.log(event.target.value)
            setText(startingValue)
        } else {
            updateMethod(event.target.value)
        }
    }

    const handleKeyPress = (event) => {
        if (event.key !== 'Enter') return
        event.target.blur();
    }
    return (
        <div className="autoSuggestDiv">
            <Hint options={suggestions} allowTabFill={true} >
                <input className="autoSuggestInput"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onBlur={onBlur} />
            </Hint>
        </div>
    );
}
