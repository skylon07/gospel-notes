import { useReducer } from "react";

function rerenderGuaranteer() {
    // useState() and useReducer() compare values and will prevent rerendering
    // when the returned vaoue doesn't change; because no two symbols are the
    // same, this guarantees a rerender
    return Symbol();
}

function useForceUpdate() {
    // eslint-disable-next-line no-unused-vars
    const [_, dispatch] = useReducer(rerenderGuaranteer);
    return dispatch;
}
export default useForceUpdate;
