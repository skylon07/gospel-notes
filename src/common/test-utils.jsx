import React from "react"
import PropTypes from "prop-types"
import { render as renderToNode, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"
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

const ROOT_ID = "__render_root__"

// overriding default render is a practice suggested by @testing-library itself
// https://testing-library.com/docs/react-testing-library/setup#custom-render
function customRender(ui) {
    // what's inside here, however, is not common practice...

    customRender.needsCleanup = true
    if (jest && expect) {
        const state = expect.getState()
        customRender.lastRunInTest = [state.currentTestName, state.testPath]
    }

    // @testing-library's render() mounts a new component every time it is
    // called; we want it to always stay inside the "root" node, so we can
    // control mounts/updates in our tests
    let root = document.getElementById(ROOT_ID)
    if (!root) {
        root = document.createElement("div")
        root.id = ROOT_ID
        document.body.appendChild(root)
    }
    act(() => {
        // using act() guarantees React flushes updates/renderings syncronously
        renderToNode(<AllProvidersInApp>{ui}</AllProvidersInApp>, root)
    })
}
customRender.needsCleanup = false
customRender.lastRunInTest = null

// this is needed since we are completely overriding their render function...
function customCleanup() {
    customRender.needsCleanup = false
    const root = document.getElementById(ROOT_ID)
    if (root) {
        unmountComponentAtNode(root)
        document.body.removeChild(root)
    }
}

function injectJestCheckers() {
    if (jest && beforeEach) {
        checkCleanup()
    }
}
injectJestCheckers()

// this check warns if one forgets to call cleanup() after rendering
function checkCleanup() {
    const check = () => {
        if (customRender.needsCleanup && !customCleanup.ignoreWarnings) {
            const [badTest, filePath] = customRender.lastRunInTest
            console.warn(`Test "${badTest}" failed to run cleanup() afterward (in ${filePath})`)
        }
        customRender.needsCleanup = false
    }

    // beforeEach() is used to perform the check after all other calls to
    // afterEach() have been applied (ie calls that could invoke cleanup())
    beforeEach(() => {
        check()
    })
    // afterAll() ensures the last test cleaned up correctly
    // (which beforeEach() wouldn't catch)
    afterAll(() => {
        check()
    })
}

export { customRender as render, customCleanup as cleanup }
export { fireEvent, screen } from "@testing-library/react"

// extended access for tests ONLY!
export const __forTestingOnly__ = { AllProvidersInApp }
