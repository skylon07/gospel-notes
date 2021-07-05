import React from "react"
import ReactDOM, { unmountComponentAtNode } from "react-dom"

import * as test_utils from "./test-utils.jsx"
import { render, cleanup, __forTestingOnly__ } from "./test-utils"
const { AllProvidersInApp } = __forTestingOnly__

// we are going to be doing a lot of rendering without cleaning...
// ignore outputting these warnings
cleanup.ignoreWarnings = true

describe("the module", () => {
    it("exports all required values", () => {
        const requiredValeus = "render cleanup fireEvent screen".split(" ")
        for (const value of requiredValeus) {
            expect(test_utils[value]).toBeTruthy()
        }
    })
})

describe("render()", () => {
    // this unmounts any nodes that render() might create
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
