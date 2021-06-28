import React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"

// kind of funny that tests are written for something that does tests...
import HookTester from "./HookTester.js"

let root = null
beforeEach(() => {
    root = document.createElement("div")
    document.body.appendChild(root)
})
afterEach(() => {
    unmountComponentAtNode(root)
    document.body.removeChild(root)
    root = null
})

it("renders without crashing (like any other component)", () => {
    render(<HookTester />, root)
})

function callHook(hook, ...hookArgs) {
    act(() => {
        render(<HookTester useHook={hook} hookArgs={hookArgs} />, root)
    })
}
it("calls its 'useHook' property every render", () => {
    const fakeHook = jest.fn()
    callHook(fakeHook)

    expect(fakeHook).toHaveBeenCalledTimes(1)

    callHook(fakeHook)

    expect(fakeHook).toHaveBeenCalledTimes(2)
})

it("calls its 'useHook' property with 'hookArgs'", () => {
    const firstArgs = ["first argument"]
    const fakeHook = jest.fn()
    callHook(fakeHook, ...firstArgs)

    expect(fakeHook).toHaveBeenLastCalledWith(...firstArgs)

    const secondArgs = ["first arg", "second arg", "third arg"]
    callHook(fakeHook, ...secondArgs)

    expect(fakeHook).toHaveBeenLastCalledWith(...secondArgs)
})

function tryHook(hook, onUseHook, onError) {
    act(() => {
        render(
            <HookTester
                useHook={hook}
                onUseHook={onUseHook}
                onError={onError}
            />,
            root
        )
    })
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
