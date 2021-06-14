import { useEffect, useRef } from "react"
import { useMountedState } from "./"

function useEffectOnUpdate(callback, deps) {
    const callbackRef = useRef()
    callbackRef.current = callback
    
    const mounted = useMountedState()
    const mountedRef = useRef()
    mountedRef.current = mounted
    
    // NOTE: refs have to be used to allow full control over the deps array
    useEffect(() => {
        if (mountedRef.current) {
            return callbackRef.current()
        }
    }, deps)
}
export default useEffectOnUpdate
