import React from "react"
import { render } from "react-dom"
import { act } from "react-dom/test-utils"
import PropTypes from "prop-types"

// provided as a convenience for testing hooks
function HookTester(props) {
    return (
        <HookErrorCatcher onError={props.onError}>
            <TestCustomHook
                useHook={props.useHook}
                hookArgs={props.hookArgs}
                onUseHook={props.onUseHook}
            />
        </HookErrorCatcher>
    )
}
HookTester.propTypes = {
    useHook: PropTypes.func,
    hookArgs: PropTypes.array,
    onUseHook: PropTypes.func,
    onError: PropTypes.func,
}
HookTester.defaultProps = {
    hookArgs: [],
}
export default HookTester

// a helper function that turns HookTester into a function call
export function callHookOn(DOMRoot, useHook, ...hookArgs) {
    let hookResult = null
    const recordHookResult = (result) => {
        hookResult = result
    }
    let thrownError = null
    const recordError = (error) => {
        thrownError = error
    }
    act(() => {
        render(
            <HookTester
                useHook={useHook}
                hookArgs={hookArgs}
                onUseHook={recordHookResult}
                onError={recordError}
            />,
            DOMRoot
        )
    })
    if (thrownError) {
        // React catches errors thrown during rendering (therefore in hooks as
        // well); recording and throwing this allows jest to catch the error
        // instead for testing
        throw thrownError
    }
    return hookResult
}

// React throws... quite the chunk of information when components throw; this
// is a bit of a hack, but it fixes the problem!
const origError = console.error
function ignoreConsoleError() {
    console.error = (error) => {
        const isErroredInComponent =
            /The above error occurred in the <.*> component:/.test(error + "")
        const isReactError = /Error: Uncaught \[.*\]/.test(error + "")
        if (!isErroredInComponent && !isReactError) {
            origError.call(console, error)
        }
    }
}
function restoreConsoleError() {
    console.error = origError
}
class HookErrorCatcher extends React.Component {
    constructor(props) {
        super(props)
        this.state = { errored: false }
    }

    static getDerivedStateFromError() {
        restoreConsoleError()
        return { errored: true }
    }

    render() {
        ignoreConsoleError()
        // TESTS WILL NOT WORK if the errored component is returned again
        return !this.state.errored ? this.props.children : null
    }

    componentDidCatch(error) {
        restoreConsoleError()
        if (typeof this.props.onError === "function") {
            this.props.onError(error)
        }
    }

    componentDidMount() {
        restoreConsoleError()
    }

    componentDidUpdate() {
        restoreConsoleError()
    }
}
HookErrorCatcher.propTypes = {
    children: PropTypes.node,
    onError: PropTypes.func,
}

function TestCustomHook(props) {
    const args = props.hookArgs
    if (typeof props.useHook === "function") {
        const result = props.useHook(...args)
        if (typeof props.onUseHook === "function") {
            props.onUseHook(result)
        }
    }
    return null
}
TestCustomHook.propTypes = {
    useHook: PropTypes.func,
    hookArgs: PropTypes.array,
    onUseHook: PropTypes.func,
}
