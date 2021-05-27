import { useRef } from "react"

const UNINITIALIZED = Symbol()

function useStaticValue(initValueFactory) {
    const ref = useRef(UNINITIALIZED)
    
    if (ref.current === UNINITIALIZED) {
        let initValue = initValueFactory
        if (typeof initValueFactory === "function") {
            initValue = initValueFactory()
        }
        ref.current = initValue
    }
    
    return ref.current
}
export default useStaticValue
