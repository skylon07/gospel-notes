import { useState, useCallback } from "react"

function stableHook() {
    const [state, setState] = useState()
    return setState
}

function HookDirectly(props) {
    const setState = stableHook()
    useEffect(() => {
        setState("test")
    }, [])
}

function HookWithCallback(props) {
    const setState = stableHook()
    const stableSetState = useCallback(setState)
    useEffect(() => {
        stableSetState("test")
    }, [])
}

function HookWithCallbackWithBlankDeps(props) {
    const setState = stableHook()
    const stableSetState = useCallback(setState, [])
    useEffect(() => {
        stableSetState("test")
    }, [])
}

function HookWithNewCallback(props) {
    const setState = stableHook()
    const stableSetState = useCallback(() => setState())
    useEffect(() => {
        stableSetState("test")
    }, [])
}

function HookWithNewCallbackWithBlankDeps(props) {
    const setState = stableHook()
    const stableSetState = useCallback(() => setState(), [])
    useEffect(() => {
        stableSetState("test")
    }, [])
}

// NOTE: these are probably just a mistaken comment...
function HookWithCallback_InsideDeps(props) {
    const setState = stableHook()
    const stableSetState = useCallback(setState)
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

function HookWithCallbackWithBlankDeps_InsideDeps(props) {
    const setState = stableHook()
    const stableSetState = useCallback(setState, [])
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

function HookWithNewCallback_InsideDeps(props) {
    const setState = stableHook()
    const stableSetState = useCallback(() => setState())
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

function HookWithNewCallbackWithBlankDeps_InsideDeps(props) {
    const setState = stableHook()
    const stableSetState = useCallback(() => setState(), [])
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

export default (props) => <div>BoardNode</div>
