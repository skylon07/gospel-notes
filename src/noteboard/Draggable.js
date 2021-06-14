import React, { useState, useEffect } from "react"

function Draggable(props) {
    const [ state, setter ] = useState()
    if (window.getValue) {
        badHookName(setter, { setter })
    }
    useGoodHookName(setter, { setter })

    return <div />
}

function badHookName(setState, data) {
    const [ d, setD ] = useState()
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff + d)
    }, [])
}

function useGoodHookName(setState, data) {
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff)
    }, [])
}

export default Draggable
