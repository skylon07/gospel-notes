import React from "react"
import PropTypes from "prop-types"

import { render, cleanup, act } from "@testing-library/react"

import { NoteBoardCallbacks } from "noteboard/NoteBoard"

// it might be useful for some tests (ie BoardNodes) to track how many times
// each callback was called; therefore, these are set to jest.fn()s (which,
// according to my understanding of jest, will be reset after every test)
const noteBoardCallbacksForTesting = {
    onNodeDataChange: jest.fn(),
    onNodeAddChild: jest.fn(),
    onNodeRemoveChild: jest.fn(),
}

// a component that should render every context provider created in the app
function AllProvidersInApp(props) {
    return (
        <NoteBoardCallbacks.Provider value={noteBoardCallbacksForTesting}>
            {props.children}
        </NoteBoardCallbacks.Provider>
    )
}
AllProvidersInApp.propTypes = {
    children: PropTypes.node,
}

class CustomRenderer {
    constructor() {
        this.needsCleanup = false
        this.jestStateLastRender = null
        this.root = null
        this._warningsIgnored = false
    }

    // overriding default render is a practice suggested by @testing-library itself
    // https://testing-library.com/docs/react-testing-library/setup#custom-render
    render(ui, options = {}) {
        if (typeof options !== "object") {
            throw new TypeError(
                `The second argument to render() must be an options object, not "${options}"`
            )
        }

        this.needsCleanup = true
        if (jest && expect) {
            this.jestStateLastRender = expect.getState()
        }

        // @testing-library's render() mounts a new component every time it is
        // called; we want it to always stay inside the "root" node, so we can
        // control mounts/updates in our tests
        if (this.root !== null) {
            options.container = this.root
        }
        options.wrapper = AllProvidersInApp

        const { container } = render(ui, options)
        if (this.root === null) {
            this.root = container
        }

        if (this.root !== container) {
            // this should not ever happen, assuming that the container returned is the root element passed in
            throw new Error(
                `Internal rendering error: Stored root container ${this.root} and last returned container ${container} do not match`
            )
        }
    }

    cleanup() {
        cleanup()
        this.root = null
        this.needsCleanup = false
    }

    // this check warns if one forgets to call cleanup() after rendering
    checkCleanup() {
        if (this.needsCleanup && !this._warningsIgnored) {
            const { currentTestName, testPath } = this.jestStateLastRender
            console.warn(
                `Test "${currentTestName}" failed to run cleanup() afterward (in ${testPath})`
            )
        }
        this.needsCleanup = false
    }

    ignoreWarnings(should = true) {
        this._warningsIgnored = should
    }

    // this method is INTENTIONALLY left out of the constructor; this allows
    // test-utils.test.jsx to recreate the renderer every test iteration
    injectCleanupChecker() {
        // checks only run if they are executed inside the jest environment
        if (jest && beforeEach) {
            // beforeEach() is used to perform the check after all other calls to
            // afterEach() have been applied (ie calls that could invoke cleanup())
            beforeEach(() => {
                this.checkCleanup()
            })
            // afterAll() ensures the last test cleaned up correctly
            // (which beforeEach() wouldn't catch)
            afterAll(() => {
                this.checkCleanup()
            })
        }
    }
}

// use the same signature as @testing-library...
export * from "@testing-library/react"
import * as all_tl from "@testing-library/react"
const ALL_EXPORTS = {}
for (const name in all_tl) {
    ALL_EXPORTS[name] = all_tl[name]
}

// ...while overriding a couple things
const cr = new CustomRenderer()
cr.injectCleanupChecker()
// test-utils.test.jsx assumes the render/cleanup functions are bound like
// this; if you change how these are exported, please check those tests are
// still working
const customRender = cr.render.bind(cr)
const customCleanup = cr.cleanup.bind(cr)
customCleanup.ignoreWarnings = cr.ignoreWarnings.bind(cr)
ALL_EXPORTS.render = customRender
ALL_EXPORTS.cleanup = customCleanup
export {customRender as render, customCleanup as cleanup}

// act-er for calling ref handles
export function callRefHandle(ref, handleName, ...args) {
    act(() => {
        if (ref && ref.current) {
            if (typeof ref.current[handleName] === "function") {
                ref.current[handleName](...args)
            } else {
                throw new Error(`A ref did not have the function '${handleName}'`)
            }
        } else {
            throw new Error("The provided ref was not an active React.createRef()")
        }
    })
}
ALL_EXPORTS.callRefHandle = callRefHandle

// extended access for test-utils tests ONLY!
const __forTestingOnly__ = { AllProvidersInApp, CustomRenderer }
ALL_EXPORTS.__forTestingOnly__ = __forTestingOnly__
export { __forTestingOnly__ }

// export everything as one package, too
export default ALL_EXPORTS
