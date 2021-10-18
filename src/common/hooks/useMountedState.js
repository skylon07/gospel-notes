import { useRef, useEffect } from "react"

function useMountedState() {
    const mountedRef = useRef(false)

    useEffect(() => {
        mountedRef.current = true
        return () => {
            // don't know how it's ever possible to access this value after an unmount, but it's here!
            // (this "feature" is not tested; no way to test it for the above reason!)
            mountedRef.current = false
        }
    }, [])

    return mountedRef.current
}
export default useMountedState
