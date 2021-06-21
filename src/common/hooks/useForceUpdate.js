import { useReducer } from "react"

function rerenderGuaranteer() {
    return Symbol()
}

function useForceUpdate() {
    // NOTE: the callback is stable since dispatch is stable!
    // eslint-disable-next-line no-unused-vars
    const [_, dispatch] = useReducer(rerenderGuaranteer)
    return dispatch
}
export default useForceUpdate
