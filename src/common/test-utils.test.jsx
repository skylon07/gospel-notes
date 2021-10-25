import React from "react"
import PropTypes from "prop-types"
import ReactDOM, { unmountComponentAtNode } from "react-dom"

import * as test_utils from "./test-utils.jsx"
import { callRefHandle } from "./test-utils.jsx"
import test_utils_default from "./test-utils.jsx"
import { __forTestingOnly__ } from "./test-utils"
const { AllProvidersInApp, CustomRenderer } = __forTestingOnly__

// these tests ensure that:
//      1. the module exports the correct functions
//      2. the CustomRenderer implementation behaves properly
// therefore, assuming that the CustomRenderer's implementation is directly
// exported, these tests also ensure that the exported render() and cleanup()
// methods function properly

// since we are recreating the state/renderer every time, these need to be rebound
let render = null
let cleanup = null
beforeEach(() => {
    const cr = new CustomRenderer()
    render = cr.render.bind(cr)
    cleanup = cr.cleanup.bind(cr)
})
afterEach(() => {
    render = null
    cleanup = null
})

describe("the module", () => {
    const requiredValues =
        "render cleanup fireEvent screen callRefHandle".split(" ")

    it("exports all required values", () => {
        for (const value of requiredValues) {
            expect(test_utils[value]).toBeTruthy()
        }

        // make sure cleanup() has an ignoreWarnings() property
        expect(test_utils.cleanup.ignoreWarnings).toBeTruthy()
    })

    it("exports a default with all required values", () => {
        for (const value of requiredValues) {
            expect(test_utils_default[value]).toBeTruthy()
        }

        // make sure cleanup() has an ignoreWarnings() property
        expect(test_utils_default.cleanup.ignoreWarnings).toBeTruthy()
    })
})

describe("render()", () => {
    // this unmounts any nodes that render() might create and resets state
    // (we can't use cleanup() since it isn't tested yet!)
    function removeAllChildren() {
        while (document.body.children.length > 0) {
            const child = document.body.children[0]
            unmountComponentAtNode(child)
            document.body.removeChild(child)
        }
    }
    afterEach(() => {
        removeAllChildren()
    })

    const renderSpy = jest.spyOn(ReactDOM, "render")
    afterEach(() => {
        renderSpy.mockReset()
    })
    afterAll(() => {
        renderSpy.mockRestore()
    })

    it("renders React elements using ReactDOM.render()", () => {
        render(<div />)

        expect(renderSpy).toHaveBeenCalledTimes(1)
        expect(renderSpy).toHaveBeenLastCalledWith(
            expect.anything(), // not testing the first argument
            expect.any(HTMLElement)
        )
    })

    it("uses the same DOM container across calls", () => {
        // each test starts with no children...
        const docChildren = document.body.children
        expect(docChildren.length).toBe(0)

        render(<div />)

        // render() should create one container initially
        expect(docChildren.length).toBe(1)
        const container = docChildren[0]

        render(<div />)

        // the container should not change after another render()
        expect(docChildren.length).toBe(1)
        expect(docChildren[0]).toBe(container)

        function FakeComponent() {
            return null
        }
        render(<FakeComponent />)

        // the container should not change, even if the element changes
        expect(docChildren.length).toBe(1)
        expect(docChildren[0]).toBe(container)
    })

    it("renders ui wrapped in the <AllProvidersInApp> component", () => {
        const button = <button />
        // steal the react element symbol to create an "expect-type" later...
        const ReactElementSymbol = button["$$typeof"]
        render(button)

        const anyAllProvidersElement = expect.objectContaining({
            $$typeof: ReactElementSymbol,
            type: AllProvidersInApp,
        })
        expect(renderSpy).toHaveBeenLastCalledWith(
            anyAllProvidersElement,
            expect.anything() // not testing the second argument
        )
    })
})

describe("cleanup()", () => {
    const unmountSpy = jest.spyOn(ReactDOM, "unmountComponentAtNode")
    afterEach(() => {
        unmountSpy.mockReset()
    })
    afterAll(() => {
        unmountSpy.mockRestore()
    })

    it("unmounts and deletes the root container", () => {
        const docChildren = document.body.children
        render(<div />)

        expect(docChildren.length).toBe(1)
        const container = docChildren[0]

        cleanup()

        expect(docChildren.length).toBe(0)
        expect(unmountSpy).toHaveBeenLastCalledWith(container)
    })
})

describe("cleanup warnings checker", () => {
    const warnSpy = jest.spyOn(console, "warn")
    afterEach(() => {
        warnSpy.mockReset()
    })
    afterAll(() => {
        warnSpy.mockRestore()
    })

    let cr = null
    beforeEach(() => {
        // make the renderer more controlled than the global one...
        cr = new CustomRenderer()
        cr.render(<div />)
    })
    afterEach(() => {
        cr = null
    })

    it("warns when cleanup() is not called after render() is called", () => {
        // pretend nothing happens, and the next test is about to run
        cr.checkCleanup()

        expect(warnSpy).toHaveBeenCalledTimes(1)
    })

    it("does not warn when ignoreWarnings is true", () => {
        cr.ignoreWarnings()

        // pretend nothing happens, and the next test is about to run
        cr.checkCleanup()

        expect(warnSpy).not.toHaveBeenCalled()
    })

    it("warns after resetting ignoreWarnings back to false", () => {
        cr.ignoreWarnings(true)
        cr.ignoreWarnings(false)

        // pretend nothing happens, and the next test is about to run
        cr.checkCleanup()

        expect(warnSpy).toHaveBeenCalledTimes(1)
    })
})

describe("callRefHandle()", () => {
    const ComponentWithHandle = React.forwardRef(function ComponentWithHandle(
        props,
        ref
    ) {
        // eslint-disable-next-line no-unused-vars
        const [_, setSomeState] = React.useState()

        React.useImperativeHandle(ref, () => {
            const testHandle = (...args) => props.testHandleCallback(...args)
            const stateHandle = () => setSomeState(Symbol())
            return { testHandle, stateHandle }
        })

        return null
    })
    ComponentWithHandle.propTypes = {
        testHandleCallback: PropTypes.func,
    }

    const origError = console.error
    afterEach(() => {
        console.error = origError
    })

    it("calls a given handler from a ref", () => {
        const ref = React.createRef()
        const callback = jest.fn()
        render(<ComponentWithHandle ref={ref} testHandleCallback={callback} />)

        callRefHandle(ref, "testHandle")

        expect(callback).toHaveBeenCalledTimes(1)
    })

    it("calls a given handler with given arguments from a ref", () => {
        const ref = React.createRef()
        const callback = jest.fn()
        render(<ComponentWithHandle ref={ref} testHandleCallback={callback} />)

        const testArg1 = "first test argument"
        const testArg2 = Symbol()
        callRefHandle(ref, "testHandle", testArg1, testArg2)

        expect(callback).toHaveBeenCalledTimes(1)
        expect(callback).toHaveBeenLastCalledWith(testArg1, testArg2)
    })

    it("calls the handler wrapped in act() (in case a rerender occurs because of this action)", () => {
        // track React printing warnings later
        console.error = jest.fn(console.error)

        const ref = React.createRef()
        const onRender = jest.fn()
        render(
            <React.Profiler id="ComponentWithHandle" onRender={onRender}>
                <ComponentWithHandle ref={ref} />
            </React.Profiler>
        )

        expect(onRender).toHaveBeenCalledTimes(1)
        
        callRefHandle(ref, "stateHandle")
        callRefHandle(ref, "stateHandle")
        
        expect(onRender).toHaveBeenCalledTimes(3)
        expect(console.error).not.toHaveBeenCalled()
    })
})
