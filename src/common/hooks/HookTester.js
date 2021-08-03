import React, { useRef, useEffect } from "react"
import PropTypes from "prop-types"
import { render } from "common/test-utils"

// provided as a convenience for testing hooks
function HookTester(props) {
    // React throws... quite the chunk of information when components throw; this
    // is a bit of a hack, but it fixes the problem!
    const origErrorRef = useRef(console.error)
    const ignoreConsoleError = () => {
        if (typeof console.error === "function") {
            console.error = (error) => {
                const isErroredInComponent =
                    /The above error occurred in the <.*> component:/.test(
                        error + ""
                    )
                // eslint-disable-next-line no-useless-escape
                const isReactError = /Error: Uncaught [\['"].*[\]'"]/.test(
                    error + ""
                )
                if (!isErroredInComponent && !isReactError) {
                    origErrorRef.current.call(console, error)
                }
            }
        }
    }
    const restoreConsoleError = () => {
        console.error = origErrorRef.current
    }

    ignoreConsoleError()
    const onError = (...args) => {
        restoreConsoleError()
        if (typeof props.onError === "function") {
            props.onError(...args)
        }
    }
    const onUseHook = (...args) => {
        restoreConsoleError()
        if (typeof props.onUseHook === "function") {
            props.onUseHook(...args)
        }
    }
    // not necessary... but it helps ensure console is restored on cleanup
    useEffect(() => {
        return restoreConsoleError
    }, [])

    return (
        <HookErrorCatcher onError={onError}>
            <TestCustomHook
                useHook={props.useHook}
                hookArgs={props.hookArgs}
                onUseHook={onUseHook}
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
        this.state = { errored: false, justErrored: false }

        this._lastCleanChildren = null
    }

    static getDerivedStateFromError() {
        return { justErrored: true }
    }

    // children render, and if they error, state becomes "errored: true"; in
    // order to restore regular functionality for future renders, every render
    // resets the "errored" state in getDerivedStateFromProps(); however, we
    // DON'T want to do this right after getDerivedStateFromError(), hence why
    // "justErrored" is tracked
    static getDerivedStateFromProps(props, state) {
        return { errored: state.justErrored, justErrored: false }
    }

    render() {
        // TESTS WILL NOT WORK if the errored component is returned again
        if (this.state.errored) {
            // to allow consecutive calls from callHook(), the last
            // (non-erroring) children is recorded and returned in the event of
            // an error, "resetting" the virtual DOM to before the error
            // happened, while still allowing callHook() to record the error
            return this._lastCleanChildren
        } else {
            // this may cause an error; if so, getDerivedStateFromError() will
            // trigger the alternative "clean" rendering
            return this.props.children
        }
    }

    componentDidCatch(error) {
        if (typeof this.props.onError === "function") {
            this.props.onError(error)
        }
    }

    componentDidMount() {
        // if the component mounted, then the children are "clean"/didn't error
        this._lastCleanChildren = this.props.children
    }

    componentDidUpdate() {
        // if the component updated, then the children are "clean"/didn't error
        this._lastCleanChildren = this.props.children
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
