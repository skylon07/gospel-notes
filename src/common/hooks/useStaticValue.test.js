import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import useStaticValue from "./useStaticValue.js"

function TestComponent(props) {
    const value = useStaticValue(props.initValue)
    if (typeof props.onUseStaticValue === "function") {
        props.onUseStaticValue(value)
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

describe("factory function tests", () => {
    it("calls and returns the value from the factory function", () => {
        const value = "some value"
        const valueFactory = jest.fn(() => value)
        const returnedValues = []
        act(() => {
            render(<TestComponent
                initValue={valueFactory}
                onUseStaticValue={(value) => returnedValues.push(value)}
            />, root)
        })
        
        expect(valueFactory).toBeCalledTimes(1)
        expect(returnedValues).toStrictEqual([value])
    })
    
    it("calls the factory function only once, on the first render", () => {
        const value = "some value"
        const valueFactory = jest.fn(() => value)
        act(() => {
            render(<TestComponent
                initValue={valueFactory}
            />, root)
        })
        
        expect(valueFactory).toBeCalledTimes(1)
        
        act(() => {
            render(<TestComponent
                initValue={valueFactory}
            />, root)
        })
        
        expect(valueFactory).toBeCalledTimes(1)
    })
})

describe("immediate value tests", () => {
    it("returns the given initial value (when not a function)", () => {
        const value = "some value"
        const returnedValues = []
        act(() => {
            render(<TestComponent
                initValue={value}
                onUseStaticValue={(value) => returnedValues.push(value)}
            />, root)
        })
        
        expect(returnedValues).toStrictEqual([value])
    })
    
    it("returns the initial value even when a new value is passed", () => {
        const value = "some value"
        const returnedValues = []
        act(() => {
            render(<TestComponent
                initValue={value}
                onUseStaticValue={(value) => returnedValues.push(value)}
            />, root)
        })
        
        expect(returnedValues).toStrictEqual([value])
        
        const anotherValue = "another value of some kind"
        act(() => {
            render(<TestComponent
                initValue={anotherValue}
                onUseStaticValue={(value) => returnedValues.push(value)}
            />, root)
        })
        
        // expect(returnedValues).not.toEqual([value, anotherValue])
        expect(returnedValues).toStrictEqual([value, value])
    })
})
