import React, { useEffect, useState } from 'react'
import { Hint } from 'react-autocomplete-hint';

import '../../style/Autosuggest.css'

export function Autosuggest({ startingValue, suggestions }) {
    const [text, setText] = useState(startingValue);

    suggestions = Object.entries(suggestions).map((e) => { return { label: e[1], id: e[0] } })

    const onBlur = (event) => {
        console.log(event.target.value)
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
