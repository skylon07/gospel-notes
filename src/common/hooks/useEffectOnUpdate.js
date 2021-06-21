import { useEffect, useRef } from "react"
import { useMountedState } from "./"

function useEffectOnUpdate(callback, deps) {
    const callbackRef = useRef()
    callbackRef.current = callback
    
    const mounted = useMountedState()
    const mountedRef = useRef()
    mountedRef.current = mounted
    
    // refs have to be used to allow full control over the deps array
    useEffect(() => {
        if (mountedRef.current) {
            return callbackRef.current()
        }
    // I know it says not to do this but SHUSH!!! (a linting rule was added
    // for this hook specifically so it's okay I promise...)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)
}
export default useEffectOnUpdate
