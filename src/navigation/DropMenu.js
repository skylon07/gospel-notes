import React, { useState, useEffect, useRef, useImperativeHandle } from "react";
import { useClassName } from "common/hooks";
import PropTypes from "prop-types";
import "./DropMenu.css";

import { SVGIcon } from "common/svg-icon";

const DropMenu = React.forwardRef(function (props, ref) {
    const [hidden, setHidden] = useState(props.initHidden);
    const toggleHidden = () => {
        setHidden((hidden) => !hidden);
    };
    const windowIgnored = useRef(false);
    const ignoreHideFromWindow = () => {
        windowIgnored.current = true;
    };

    useEffect(() => {
        const hideFromWindow = () => {
            if (!windowIgnored.current) {
                setHidden(true);
            }
            windowIgnored.current = false;
        };
        window.addEventListener("click", hideFromWindow);
        return () => {
            window.removeEventListener("click", hideFromWindow);
        };
    }, []);

    // refs are used to allow buttons inside this menu's content to change
    // menu state (for example, a "close menu" button hiding the menu)
    useImperativeHandle(ref, () => {
        const hide = () => setHidden(true);
        return { hide };
    });

    return (
        <div
            data-testid="drop-menu"
            className="DropMenu"
            // we only want to hide the menu when clicks happen outside the
            // menu; this binding ensures just that
            onClick={ignoreHideFromWindow}
        >
            <button className="ToggleButton" onClick={toggleHidden}>
                <SVGIcon type="bars" />
            </button>
            <DropMenuBox hidden={hidden}>{props.children}</DropMenuBox>
        </div>
    );
});
DropMenu.propTypes = {
    children: PropTypes.node,
    initHidden: PropTypes.bool,
};
DropMenu.defaultProps = {
    initHidden: true,
};
export default DropMenu;

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
    });

    return (
        <div
            data-testid="drop-menu-box"
            className={className}
            onClick={props.onClick}
        >
            <div className="Shadow" />
            {props.children}
        </div>
    );
}
DropMenuBox.propTypes = {
    children: PropTypes.node,
    hidden: PropTypes.bool.isRequired,
    onClick: PropTypes.func,
};
