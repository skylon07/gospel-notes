import React, { useState, useEffect } from "react"
import PropTypes from "prop-types"

function Draggable(props) {
    const [ state, setter ] = useState()
    
    useBadHookName(setter, { setter })
    useGoodHookName(setter, { setter })

    return <div>{state}</div>
}

function useBadHookName(setState, data) {
    useEffect(() => {
        let doStuff = window
        setState(doStuff)
    }, [])
}

function useGoodHookName(setState, data) {
    const [ d ] = useState()
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff + d)
    }, [data.setter])
}

export default Draggable
