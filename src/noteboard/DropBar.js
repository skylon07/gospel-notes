import React, { useState, useRef, useImperativeHandle } from "react";
import { useClassName, useEffectOnUpdate } from "common/hooks"
import PropTypes from "prop-types";
import "./DropBar.css";

import { SVGIcon } from "common/svg-icon";

import Holdable from "./Holdable.js";

const STYLE = {
    sheet: (() => {
        const sheet = document.createElement("style");
        document.head.appendChild(sheet);
        return sheet;
    })(),
    setTransform(offset) {
        STYLE.sheet.innerHTML = `.DropBar, .DropBarTransform {
            --bottom-bar-shift: ${offset}px;
        }`;
    },
    // NOTE: this number should reflect the variable in the .css sheet
    bottomBarHeight: 6,
};

function DropBar(props) {
    const [dropped, setDropped] = useState(props.initDropped)
    const contentRef = useRef(null)
    
    const bottomBarClassName = useClassName({
        noMountingAnimation: true,
        base: "BottomBar",
        choices: [{
            values: ["raised", "dropped"],
            useKey: Number(!!dropped),
        }],
    })
    
    const toggleDrop = () => {
        // offsetHeight is used since this represents the height
        // before transformations are applied
        const currHeight = contentRef.current.offsetHeight;
        STYLE.setTransform(currHeight);
        setDropped((dropped) => {
            return !dropped
        })
    }
    
    useEffectOnUpdate(() => {
        const animationDirection = dropped ? "dropping" : "raising"
        updateSiblingAndParentClasses(contentRef.current, animationDirection)
    }, [dropped])
    
    return (
        // TODO: test the second <Holdable /> bounds (CSS background color)
        <div data-testid="drop-bar" className="DropBar">
            <div className="Bar">
                <div className="Icon">
                    <Holdable onHold={props.onIconHold}>
                        <SVGIcon type={props.iconType} />
                    </Holdable>
                </div>
                <div className="Title">
                    <Holdable onHold={props.onTitleHold}>
                        {props.title}
                    </Holdable>
                </div>
                <DropdownButton
                    onClick={toggleDrop}
                    dropped={dropped}
                />
            </div>
            <DropBarContent ref={contentRef} dropped={dropped}>
                {props.children}
            </DropBarContent>
            <div className={bottomBarClassName} />
        </div>
    );
}
DropBar.propTypes = {
    children: PropTypes.node,
    title: PropTypes.string,
    iconType: PropTypes.string,
    initDropped: PropTypes.bool,
    onTitleHold: PropTypes.func,
    onIconHold: PropTypes.func,
}
DropBar.defaultProps = {
    iconType: "invalid",
    initDropped: false,
}
export default DropBar

function getChildIdx(elem) {
    let idx = 0;
    while (elem.previousSibling) {
        idx++;
        elem = elem.previousSibling;
    }
    return idx;
}

function updateSiblingAndParentClasses(contentElem, animationDirection, currElem=contentElem) {
    const parent = currElem.parentElement;
    const elemIdx = getChildIdx(currElem);
    
    if (animationDirection === "raising") {
        scrollParentIfUnderflow(parent, contentElem)
    }
    for (let idx = elemIdx + 1; idx < parent.children.length; idx++) {
        const child = parent.children[idx];
        // sets children after with the animation
        setAnimationClasses(child, animationDirection);
    }
    
    // performs the same operations on the parent until hitting the end
    if (parent !== document.body) {
        updateSiblingAndParentClasses(contentElem, animationDirection, parent);
    }
}

function scrollParentIfUnderflow(parent, contentElem) {
    const heightChange = contentElem.offsetHeight + STYLE.bottomBarHeight
    const maxScrollBottom = parent.scrollHeight - heightChange
    const scrollBottom = parent.scrollTop + parent.offsetHeight
    
    // NOTE: canScroll helps prevent making scrollBy() calls to elements
    //       that can't scroll (likely because this DropBar is in a wrapper
    //       element, and therefore taking all the height)
    const canScroll = parent.scrollTop > 0
    const scrollDiff = maxScrollBottom - scrollBottom
    if (scrollDiff < 0 && canScroll) {
        // TODO: apply a little slower/over more time...
        parent.scrollBy({
            top: scrollDiff,
            behavior: "smooth",
        })
    }
}

function setAnimationClasses(elem, animationDirection) {
    const base = "DropBarTransform"
    const dropping = "dropping"
    const raising = "raising"
    const removeAll = () => elem.classList.remove(base, dropping, raising);
    
    // ensures fresh start in case other animations have not completed
    removeAll()
    elem.classList.add(base, animationDirection);
    // ensures that the same animation can re-run multiple times
    elem.addEventListener(
        "animationend",
        removeAll,
        { once: true }
    );
    
    
    const addListener = () => elem.addEventListener(
        "animationend",
        () => {
            // ensures that the same animation can re-run multiple times
            elem.classList.remove(base, dropping, raising);
        },
        { once: true }
    );

    switch (animationDirection) {
        case "dropping":
            elem.classList.add(base, dropping);
            // NOTE:
            elem.classList.remove(raising);
            addListener()
            break;

        case "raising":
            elem.classList.add(base, raising);
            elem.classList.remove(dropping);
            addListener()
            break;

        default:
            elem.classList.remove(base, dropping, raising);
    }
}

function DropdownButton(props) {
    const className = useClassName({
        base: "DropdownButton",
        noMountingAnimation: true,
        choices: [{
            values: ["raised", "dropped"],
            useKey: Number(!!props.dropped),
        }],
    })
    
    const left = 10;
    const mid = 20;
    const right = 30;
    const top = 14;
    const btm = 25;
    
    // lines must go past the "point" of the arrow (by 1/2 the stroke width)
    // using pyth-theo, we get it down to this math:
    // offset = (((w / 2) ** 2) / 2) ** (1 / 2)
    // (condensed a bit)
    // offset = w * 2 ** (1 / 2) / 4
    const offset = 1.0606601717; // for w = 3px
    return (
        <svg
            data-testid="dropdown-button"
            className={className}
            viewBox="0 0 40 40"
            onClick={props.onClick}
        >
            <line x1={left} y1={btm} x2={mid + offset} y2={top + offset} />
            <line x1={right} y1={btm} x2={mid - offset} y2={top + offset} />
        </svg>
    );
}
DropdownButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    dropped: PropTypes.bool.isRequired,
}

const DropBarContent = React.forwardRef(function (props, ref) {
    const className = useClassName({
        base: "DropBarContent",
        noMountingAnimation: true,
        choices: [{
            values: ["raised", "dropped"],
            useKey: Number(!!props.dropped),
        }],
    })
    
    return (
        <div ref={ref} data-testid="drop-bar-content" className={className}>
            <div className="Container">{props.children}</div>
            <div className="TopGradient" />
            <div className="BottomGradient" />
        </div>
    );
})
DropBarContent.propTypes = {
    children: PropTypes.node,
    dropped: PropTypes.bool,
}
