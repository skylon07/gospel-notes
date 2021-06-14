import { useState, useEffect } from "react"

function Draggable(props) {
    const [ state, setter ] = useState()
    if (window.getValue) {
        badHookName(setter, { setter })
    }
    useGoodHookName(setter, { setter })
}

function badHookName(setState, data) {
    const d = useState()
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff)
    }, [])
}

function useGoodHookName(setState, data) {
    useEffect(() => {
        let doStuff = window
        data.setter(doStuff)
    }, [])
}

export default Draggable
