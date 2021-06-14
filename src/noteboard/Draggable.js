import { useState, useEffect } from "react"

function Draggable(props) {
    const [ state, setter ] = useState()
    if (window.getValue) {
        badHookName(setter)
    }
    useGoodHookName(setter)
}

function badHookName(setState) {
    const data = useState()
    useEffect(() => {
        let doStuff = window
        setState(doStuff)
    }, [])
}

function useGoodHookName(setState) {
    useEffect(() => {
        let doStuff = window
        setState(doStuff)
    }, [])
}

export default Draggable
