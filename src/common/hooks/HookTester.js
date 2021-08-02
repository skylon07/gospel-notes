import React from "react"
import PropTypes from "prop-types"
import { render } from "common/test-utils"

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
    useHook: PropTypes.func.isRequired,
    hookArgs: PropTypes.array.isRequired,
    onUseHook: PropTypes.func,
    onError: PropTypes.func,
}
HookTester.defaultProps = {
    hookArgs: [],
}
export default HookTester

// a helper function that turns HookTester into a function call
// (note that this uses @testing-library, so make sure cleanup() is called
// after tests)
export function callHook(useHook, ...hookArgs) {
    let hookResult = null
    const recordHookResult = (result) => {
        hookResult = result
    }
    let thrownError = null
    const recordError = (error) => {
        thrownError = error
    }
    render(
        <HookTester
            useHook={useHook}
            hookArgs={hookArgs}
            onUseHook={recordHookResult}
            onError={recordError}
        />
    )
    if (thrownError) {
        // React catches errors thrown during rendering (therefore in hooks as
        // well); recording and throwing this allows jest to catch the error
        // instead for testing
        throw thrownError
    }
    return hookResult
}

class HookErrorCatcher extends React.Component {
    constructor(props) {
        super(props)
        this.state = { errored: false }

        this._origConsoleError = null
    }

    static getDerivedStateFromError() {
        return { errored: true }
    }

    render() {
        this._ignoreConsoleError()
        // TESTS WILL NOT WORK if the errored component is returned again
        return !this.state.errored ? this.props.children : null
    }

    componentDidCatch(error) {
        this._restoreConsoleError()
        if (typeof this.props.onError === "function") {
            this.props.onError(error)
        }
    }

    componentDidMount() {
        this._restoreConsoleError()
    }

    componentDidUpdate() {
        this._restoreConsoleError()
    }

    // React throws... quite the chunk of information when components throw; this
    // is a bit of a hack, but it fixes the problem!
    _ignoreConsoleError() {
        if (typeof console.error === "function") {
            this._origConsoleError = console.error
            console.error = (error) => {
                const isErroredInComponent =
                    /The above error occurred in the <.*> component:/.test(
                        error + ""
                    )
                const isReactError = /Error: Uncaught \[.*\]/.test(error + "")
                if (!isErroredInComponent && !isReactError) {
                    this._origConsoleError.call(console, error)
                }
            }
        }
    }
    _restoreConsoleError() {
        if (this._origConsoleError === null) {
            return
        }

        console.error = this._origConsoleError
        this._origConsoleError = null
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
    useHook: PropTypes.func.isRequired,
    hookArgs: PropTypes.array.isRequired,
    onUseHook: PropTypes.func,
}
