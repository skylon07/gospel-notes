import React, { useState, useEffect, useRef, useImperativeHandle } from "react"
import { useClassName } from "common/hooks"
import PropTypes from "prop-types"
import "./DropMenu.css"

import { SVGIcon } from "common/svg-icon"

const DropMenu = React.forwardRef(function DropMenu(props, ref) {
    const [hidden, setHidden] = useState(props.initHidden)
    const toggleHidden = () => {
        setHidden((hidden) => !hidden)
    }
    const windowIgnored = useRef(false)
    const ignoreHideFromWindow = () => {
        windowIgnored.current = true
    }

    useEffect(() => {
        const hideFromWindow = () => {
            if (!windowIgnored.current) {
                setHidden(true)
            }
            windowIgnored.current = false
        }
        window.addEventListener("click", hideFromWindow)
        return () => {
            window.removeEventListener("click", hideFromWindow)
        }
    }, [])

    // refs are used to allow buttons inside this menu's content to change
    // menu state (for example, a "close menu" button hiding the menu)
    useImperativeHandle(ref, () => {
        const hide = () => setHidden(true)
        return { hide }
    })

    const hideSubLabel = hidden ? "show" : "hide"
    const buttonLabel = `"${hideSubLabel}" button for ${props.ariaMenuLabel}`
    return (
        <div
            className="DropMenu"
            // CHECKME: do I need an aria-label?
            role="none"
            // we only want to hide the menu when clicks happen outside the
            // menu; this binding ensures just that
            onClick={ignoreHideFromWindow}
        >
            <button
                aria-label={buttonLabel}
                role="switch"
                className="ToggleButton"
                onClick={toggleHidden}
            >
                <SVGIcon type="bars" />
            </button>
            <DropMenuBox ariaLabel={props.ariaMenuLabel} hidden={hidden}>
                {props.children}
            </DropMenuBox>
        </div>
    )
})
DropMenu.propTypes = {
    children: PropTypes.node,
    ariaMenuLabel: PropTypes.string.isRequired,
    initHidden: PropTypes.bool,
}
DropMenu.defaultProps = {
    initHidden: true,
}
export default DropMenu

function DropMenuBox(props) {
    const className = useClassName({
        base: "DropMenuBox",
        noMountingAnimation: true,
        filters: [
            {
                value: "hiding",
                useIf: props.hidden,
                otherwise: "showing",
            },
        ],
    })

    return (
        <div
            aria-label={props.ariaLabel}
            role="menu"
            className={className}
            onClick={props.onClick}
        >
            <div className="Shadow" />
            {props.children}
        </div>
    )
}
DropMenuBox.propTypes = {
    children: PropTypes.node,
    ariaLabel: PropTypes.string.isRequired,
    hidden: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
}
