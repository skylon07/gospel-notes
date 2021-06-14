import { useState, useEffect } from "react"

function Draggable(props) {
    const [ state, setState ] = useState()
    badHookName(setState)
    goodHookName(setState)
}

function badHookName(setState) {
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
