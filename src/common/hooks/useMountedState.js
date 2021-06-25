import { useRef, useEffect } from "react";

function useMountedState() {
    const mountedRef = useRef(false);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    return mountedRef.current;
}
export default useMountedState;
