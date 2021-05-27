import { useRef, useEffect } from "react"

function useMountedState() {
    const ref = useRef(false)

    useEffect(() => {
        ref.current = true
        return () => {
            ref.current = false
        }
    }, [])

    return ref.current
}
export default useMountedState
