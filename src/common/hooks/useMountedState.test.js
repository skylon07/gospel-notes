import { cleanup } from "common/test-utils"
import { callHook } from "./HookTester.js"

import useMountedState from "./useMountedState.js"

afterEach(() => {
    cleanup()
})

it("returns false before being mounted (ie on first render)", () => {
    const mounted = callHook(useMountedState)
    expect(mounted).toBe(false)
})

it("returns true after being mounted (ie second, third, fourth,... renders)", () => {
    callHook(useMountedState)
    
    let mounted = callHook(useMountedState)
    expect(mounted).toBe(true)

    mounted = callHook(useMountedState)
    expect(mounted).toBe(true)

    mounted = callHook(useMountedState)
    expect(mounted).toBe(true)

    mounted = callHook(useMountedState)
    expect(mounted).toBe(true)
})
