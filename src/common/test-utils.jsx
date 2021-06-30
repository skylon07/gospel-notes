import React from "react"
import PropTypes from "prop-types"
import { render } from "@testing-library/react"
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
function AllProviders(props) {
    return (
        <NoteBoardCallbacks value={noteBoardCallbacksForTesting}>
            {props.children}
        </NoteBoardCallbacks>
    )
}
AllProviders.propTypes = {
    children: PropTypes.node,
}

// overriding default render is a practice suggested by @testing-library itself
// https://testing-library.com/docs/react-testing-library/setup#custom-render
function customRender(ui, options) {
    // it appears to be recommended that the "wrapper" option is used
    return render(ui, { wrapper: AllProviders, ...options })
}

// keep @testing-library/react signature...
export * from "@testing-library/react"
// ...while overriding the render function
export { customRender as render }
