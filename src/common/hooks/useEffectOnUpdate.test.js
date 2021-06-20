import React, { useRef } from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import useEffectOnUpdate from "./useEffectOnUpdate.js"

function TestComponent(props) {
    useEffectOnUpdate(() => {
        if (typeof props.callback === "function") {
            props.callback()
        }
        return props.cleanup
    }, props.deps)
    
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

describe("basic update detection tests", () => {
    it("does not run callback() on the first render", () => {
        const callback = jest.fn()
        const cleanup = jest.fn()
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
        
        expect(callback).not.toHaveBeenCalled()
        expect(cleanup).not.toHaveBeenCalled()
    })
    
    it("runs callback() after updates and cleanup() before unmounting", () => {
        const callback = jest.fn()
        const cleanup = jest.fn()
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
        
        expect(callback).not.toHaveBeenCalled()
        expect(cleanup).not.toHaveBeenCalled()
        
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
        
        expect(callback).toHaveBeenCalledTimes(1)
        expect(cleanup).not.toHaveBeenCalled()
        
        act(() => {
            unmountComponentAtNode(root)
        })
        
        expect(callback).toHaveBeenCalledTimes(1)
        expect(cleanup).toHaveBeenCalledTimes(1)
    })
    
    it("runs callback()/cleanup() after/before all updates", () => {
        const callback = jest.fn()
        const cleanup = jest.fn()
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
    
        expect(callback).not.toHaveBeenCalled()
        expect(cleanup).not.toHaveBeenCalled()
    
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
    
        expect(callback).toHaveBeenCalledTimes(1)
        expect(cleanup).not.toHaveBeenCalled()
    
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
    
        expect(callback).toHaveBeenCalledTimes(2)
        expect(cleanup).toHaveBeenCalledTimes(1)
        
        act(() => {
            render(<TestComponent callback={callback} cleanup={cleanup} />, root)
        })
        
        expect(callback).toHaveBeenCalledTimes(3)
        expect(cleanup).toHaveBeenCalledTimes(2)
    })
})

it("only runs callback() when dependencies change", () => {
    const callback = jest.fn()
    const firstDeps = [4, 7]
    act(() => {
        render(<TestComponent callback={callback} deps={firstDeps} />, root)
    })
    
    act(() => {
        render(<TestComponent callback={callback} deps={firstDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(1)
    
    act(() => {
        render(<TestComponent callback={callback} deps={firstDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(1)
    
    const secDeps = [4, 5]
    act(() => {
        render(<TestComponent callback={callback} deps={secDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(2)
    
    act(() => {
        render(<TestComponent callback={callback} deps={secDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(2)
    
    // should still not update...
    const sameDeps = [4, 5]
    act(() => {
        render(<TestComponent callback={callback} deps={sameDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(2)
    
    const thirdDeps = [5, 5]
    act(() => {
        render(<TestComponent callback={callback} deps={thirdDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(3)
    
    act(() => {
        render(<TestComponent callback={callback} deps={thirdDeps} />, root)
    })
    
    expect(callback).toHaveBeenCalledTimes(3)
})
