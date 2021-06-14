import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"

function Draggable(props) {
    const [ state, setter ] = useState()
    if (window.getValue) {
        useBadHookName(setter, { setter })
    }
    useGoodHookName(setter, { setter })

    return <div>{state}</div>
}

function useBadHookName(setState, data) {
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff)
    }, [])
}

function useGoodHookName(setState, data) {
    const [ d, setD ] = useState()
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff + d)
    }, [])
}

export default Draggable
