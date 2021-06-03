import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import useForceUpdate from "./useForceUpdate.js"

function TestComponent(props) {
    const forceUpdate = useForceUpdate()
    if (typeof props.onRender === "function") {
        props.onRender(forceUpdate)
    }
    return null
}

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

it("doesn't crash when no values are provided (tests component render)", () => {
    render(<TestComponent />, root)
})

it("rerenders when forceUpdate() is called", () => {
    let forceUpdate
    const onRender = jest.fn((update) => forceUpdate = update)
    act(() => {
        render(<TestComponent onRender={onRender} />, root)
    })
    
    expect(onRender).toBeCalledTimes(1)
    
    act(() => {
        forceUpdate()
    })
    
    expect(onRender).toBeCalledTimes(2)
    
    act(() => {
        forceUpdate()
        forceUpdate()
        forceUpdate()
    })
    
    expect(onRender).toBeCalledTimes(3)
})

it("retains the function's identity", () => {
    let forceUpdate
    const onRender = (update) => forceUpdate = update
    act(() => {
        render(<TestComponent onRender={onRender} />, root)
    })
    const origUpdate = forceUpdate
    
    expect(forceUpdate).toBe(origUpdate)
    
    act(() => {
        forceUpdate()
    })
    
    expect(forceUpdate).toBe(origUpdate)
})