import React from "react"
import { render, cleanup } from "common/test-utils"

// kind of funny that tests are written for something that is used for tests...
import HookTester, { callHook } from "./HookTester.js"

afterEach(() => {
    cleanup()
})

describe("Component <HookTester>", () => {
    it("renders without crashing (like any other component)", () => {
        render(<HookTester useHook={() => null} />)
    })

    // this is INTENTIONALLY different from callHook();
    // we will test that later
    function callHookUsingTester(hook, ...hookArgs) {
        render(<HookTester useHook={hook} hookArgs={hookArgs} />)
    }

    it("calls its 'useHook' property every render", () => {
        const fakeHook = jest.fn()
        callHookUsingTester(fakeHook)

        expect(fakeHook).toHaveBeenCalledTimes(1)

        callHookUsingTester(fakeHook)

        expect(fakeHook).toHaveBeenCalledTimes(2)
    })

    it("calls its 'useHook' property with 'hookArgs'", () => {
        const firstArgs = ["first argument"]
        const fakeHook = jest.fn()
        callHookUsingTester(fakeHook, ...firstArgs)

        expect(fakeHook).toHaveBeenLastCalledWith(...firstArgs)

        const secondArgs = ["first arg", "second arg", "third arg"]
        callHookUsingTester(fakeHook, ...secondArgs)

        expect(fakeHook).toHaveBeenLastCalledWith(...secondArgs)
    })

    function tryHook(hook, onUseHook, onError) {
        render(
            <HookTester
                useHook={hook}
                onUseHook={onUseHook}
                onError={onError}
            />
        )
    }

    it("calls 'onUseHook' with the returned value of 'useHook'", () => {
        const hookReturnValue = "some value, any value"
        const fakeHook = jest.fn(() => hookReturnValue)
        const onUseFakeHook = jest.fn()
        tryHook(fakeHook, onUseFakeHook)

        expect(onUseFakeHook).toHaveBeenCalledTimes(1)
        expect(onUseFakeHook).toHaveBeenLastCalledWith(hookReturnValue)
    })

    it("calls 'onError' when 'useHook' throws an error", () => {
        const error = new Error("The hook errored!")
        const fakeHook = jest.fn(() => {
            throw error
        })
        const onError = jest.fn()
        tryHook(fakeHook, null, onError)

        expect(onError).toHaveBeenCalledTimes(1)
        expect(onError).toHaveBeenLastCalledWith(error)
    })
})

describe("callHook()", () => {
    it("calls 'useHook' with the correct 'hookArgs'", () => {
        const firstArgs = ["first argument"]
        const fakeHook = jest.fn()
        callHook(fakeHook, ...firstArgs)

        expect(fakeHook).toHaveBeenCalledTimes(1)
        expect(fakeHook).toHaveBeenLastCalledWith(...firstArgs)

        const secondArgs = ["first arg", "second arg", "third arg"]
        callHook(fakeHook, ...secondArgs)

        expect(fakeHook).toHaveBeenCalledTimes(2)
        expect(fakeHook).toHaveBeenLastCalledWith(...secondArgs)
    })

    it("returns the value returned by 'useHook'", () => {
        const hookReturnValue = "some value, any value"
        const fakeHook = jest.fn(() => hookReturnValue)
        const result = callHook(fakeHook)

        expect(result).toBe(hookReturnValue)
    })

    it("throws the error thrown inside 'useHook'", () => {
        const error = new Error("The hook errored!")
        const fakeHook = jest.fn(() => {
            throw error
        })
        expect(() => {
            callHook(fakeHook)
        }).toThrow(error)
    })
})

describe("console.error() override", () => {
    // these ensure that tests won't mess up console.error
    // (in case the console-error-setting code is buggy)
    const originalConsoleError = console.error
    beforeEach(() => {
        const nullFunction = () => null
        console.error = nullFunction
    })
    afterEach(() => {
        console.error = originalConsoleError
    })

    it("replaces console.error() with a filter function", () => {
        const errorBeforeRender = console.error
        // gonna have to use the components built-in functions to run during
        // the render process...
        let errorDuringRender
        const recordError = () => (errorDuringRender = console.error)
        callHook(recordError)

        expect(typeof errorDuringRender).toBe("function")
        expect(errorDuringRender).not.toBe(errorBeforeRender)
    })

    it("restores the original console.error() function", () => {
        const errorBeforeRender = console.error
        callHook(() => null)
        const errorAfterMount = console.error

        expect(errorAfterMount).toBe(errorBeforeRender)

        callHook(() => null)
        const errorAfterUpdate = console.error

        expect(errorAfterUpdate).toBe(errorBeforeRender)
    })
})
