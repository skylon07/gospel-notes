import React, { useState, useCallback, useEffect, useRef } from "react";
import { useMountedState } from "common/hooks"
import PropTypes from "prop-types";
import "./DropMenu.css";

import { SVGIcon } from "common/svg-icon"

function DropMenu(props) {
    const [hidden, setHidden] = useState(props.initHidden)
    const toggleHidden = () => {
        setHidden((hidden) => !hidden)
    }
    
    const hideFromWindowPrevented = useRef()
    hideFromWindowPrevented.current = false
    const preventHideFromWindow = () => {
        hideFromWindowPrevented.current = true
    }
    useEffect(() => {
        if (!hidden) {
            const hideFromWindow = () => {
                if (!hideFromWindowPrevented.current) {
                    setHidden(true)
                }
                hideFromWindowPrevented.current = false
            }
            window.addEventListener("click", hideFromWindow)
            return () => {
                window.removeEventListener("click", hideFromWindow)
            }
        }
    }, [hidden])
    
    return <div
        data-testid="drop-menu"
        className="DropMenu"
        onClick={preventHideFromWindow}
    >
        <button className="ToggleButton" onClick={toggleHidden}>
            <SVGIcon type="bars" />
        </button>
        <DropMenuBox hidden={hidden}>
            {renderMenuContent(props, () => setHidden(true))}
        </DropMenuBox>
    </div>
}
DropMenu.propTypes = {
    initHidden: PropTypes.bool,
    menuContent: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
}
DropMenu.defaultProps = {
    initHidden: true,
}
export default DropMenu

function renderMenuContent(props, forceHideMenu) {
    let content = props.menuContent
    if (typeof props.menuContent === "function") {
        content = props.menuContent(forceHideMenu)
    }
    return content
}

function DropMenuBox(props) {
    const mounted = useMountedState()
    
    return <div
        data-testid="drop-menu-box"
        className={getDropMenuBoxClass(props, mounted)}
        onClick={props.onClick}
    >
        <div className="Shadow" />
        {props.children}
    </div>
}
DropMenuBox.propTypes = {
    hidden: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
    children: PropTypes.node,
}

function getDropMenuBoxClass(props, mounted) {
    const base = "DropMenuBox";
    const hidden = props.hidden ? "hiding" : "showing";
    const init = !mounted ? "initAnimation" : "";
    return `${base} ${hidden} ${init}`;
}
