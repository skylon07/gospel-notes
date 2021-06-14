import { useState, useCallback, useEffect } from "react"

function useStableHook() {
    const [state, setState] = useState()
    return setState
}

function HookDirectly(props) {
    const setState = useStableHook()
    useEffect(() => {
        setState("test")
    }, [])
}

function HookWithCallback(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(setState)
    useEffect(() => {
        stableSetState("test")
    }, [])
}

function HookWithCallbackWithBlankDeps(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(setState, [])
    useEffect(() => {
        stableSetState("test")
    }, [])
}

function HookWithNewCallback(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(() => setState())
    useEffect(() => {
        stableSetState("test")
    }, [])
}

function HookWithNewCallbackWithBlankDeps(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(() => setState(), [])
    useEffect(() => {
        stableSetState("test")
    }, [])
}

// NOTE: these are probably just a mistaken comment...
function HookWithCallback_InsideDeps(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(setState)
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

function HookWithCallbackWithBlankDeps_InsideDeps(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(setState, [])
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

function HookWithNewCallback_InsideDeps(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(() => setState())
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

function HookWithNewCallbackWithBlankDeps_InsideDeps(props) {
    const setState = useStableHook()
    const stableSetState = useCallback(() => setState(), [])
    useEffect(() => {
        setState("test")
    }, [stableSetState])
}

export default (props) => <div>BoardNode</div>
