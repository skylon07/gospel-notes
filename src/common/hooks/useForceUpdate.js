import { useReducer } from "react"

function rerenderGuaranteer() {
    return Symbol()
}

function useForceUpdate() {
    // NOTE: the callback is stable since dispatch is stable!
    const [_, dispatch] = useReducer(rerenderGuaranteer)
    return dispatch
}
export default useForceUpdate
