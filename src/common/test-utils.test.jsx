import React from "react"
import ReactDOM, { unmountComponentAtNode } from "react-dom"

import * as test_utils from "./test-utils.jsx"
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
    it("exports all required values", () => {
        const requiredValeus = "render cleanup fireEvent screen".split(" ")
        for (const value of requiredValeus) {
            expect(test_utils[value]).toBeTruthy()
        }

        // make sure cleanup() has an ignoreWarnings() property
        expect(test_utils.cleanup.ignoreWarnings).toBeTruthy()
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

        expect(renderSpy).toBeCalledTimes(1)
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
