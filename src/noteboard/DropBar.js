import React, { useState, useRef } from "react"
import { useClassName } from "common/hooks"
import PropTypes from "prop-types"
import "./DropBar.css"

import { SVGIcon } from "common/svg-icons"

import Holdable from "./Holdable.js"

const STYLE = {
    sheet: (() => {
        const sheet = document.createElement("style")
        document.head.appendChild(sheet)
        return sheet
    })(),
    setTransform(offset) {
        STYLE.sheet.innerHTML = `.DropBar, .DropBarTransform {
            --bottom-bar-shift: ${offset}px;
        }`
    },
    // this number should reflect the variable in the .css sheet...
    bottomBarHeight: 6,
}

function DropBar(props) {
    const [dropped, setDropped] = useState(props.initDropped)
    const contentRef = useRef(null)

    const bottomBarClassName = useClassName({
        base: "BottomBar",
        noMountingAnimation: true,
        filters: [
            {
                value: "dropped",
                useIf: dropped,
                otherwise: "raised",
            },
        ],
    })

    const toggleDrop = () => {
        // offsetHeight is used since it represents the height
        // before transformations are applied
        const currHeight = contentRef.current.offsetHeight
        STYLE.setTransform(currHeight)
        setDropped((dropped) => {
            return !dropped
        })

        // HACK: useEffect() does not apply the animation classes fast enough and
        //       causes twitchy DOM elements; requestAnimationFrame() is used to
        //       get around this problem
        window.requestAnimationFrame(() => {
            // to conform to React rules as best as possible, please DO NOT
            // RUN anything here that does not directly relate to setting
            // temporary CSS classes/animations to DOM elements
            if (contentRef.current) {
                const nextAnimationDirection = dropped ? "raising" : "dropping"
                updateSiblingAndParentClasses(
                    contentRef.current,
                    nextAnimationDirection
                )
            }
        })
    }

    // CHECKME: is this how aria labels are supposed to be used?
    const titleLabel = props.title
        ? `dropping header named ${props.title}`
        : "unnamed dropping header"

    // CHECKME: ...and this too?
    const titleSubLabel = props.title
        ? `header ${props.title}`
        : "unnamed header"
    return (
        // CHECKME: is "group" the right role, or should I use "region", or
        //          something else?
        <div aria-label={titleLabel} role="group" className="DropBar">
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
                    ariaTitleLabel={titleSubLabel}
                    onClick={toggleDrop}
                    dropped={dropped}
                />
            </div>
            <DropBarContent
                ref={contentRef}
                ariaTitleLabel={titleSubLabel}
                dropped={dropped}
            >
                {props.children}
            </DropBarContent>
            <div className={bottomBarClassName} />
        </div>
    )
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
    let idx = 0
    while (elem.previousSibling) {
        idx++
        elem = elem.previousSibling
    }
    return idx
}

function updateSiblingAndParentClasses(
    contentElem,
    animationDirection,
    currElem = contentElem
) {
    const parent = currElem.parentElement
    const elemIdx = getChildIdx(currElem)

    if (animationDirection === "raising") {
        scrollParentIfUnderflow(parent, contentElem)
    }
    for (let idx = elemIdx + 1; idx < parent.children.length; idx++) {
        const child = parent.children[idx]
        // sets children after with the animation
        setAnimationClasses(child, animationDirection)
    }

    // performs the same operations on the parent until hitting the end
    if (parent !== document.body) {
        updateSiblingAndParentClasses(contentElem, animationDirection, parent)
    }
}

function scrollParentIfUnderflow(parent, contentElem) {
    const heightChange = contentElem.offsetHeight + STYLE.bottomBarHeight
    const maxScrollBottom = parent.scrollHeight - heightChange
    const scrollBottom = parent.scrollTop + parent.offsetHeight

    // canScroll helps prevent making scrollBy() calls to elements
    // that can't scroll (likely because this DropBar is in a wrapper
    // element, and therefore taking all the height)
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
    const removeAll = () => {
        elem.classList.remove(base, dropping, raising)
    }

    // ensures fresh start in case other animations have not completed
    removeAll()
    elem.classList.add(base, animationDirection)
    // ensures that the same animation can re-run multiple times
    // (and reduces chances of ReactDOM-DOM className conflicts)
    elem.addEventListener("animationend", removeAll, { once: true })
}

function DropdownButton(props) {
    const className = useClassName({
        base: "DropdownButton",
        noMountingAnimation: true,
        filters: [
            {
                value: "dropped",
                useIf: props.dropped,
                otherwise: "raised",
            },
        ],
    })

    const left = 10
    const mid = 20
    const right = 30
    const top = 14
    const btm = 25

    // lines must go past the "point" of the arrow (by 1/2 the stroke width)
    // using pyth-theo, we get it down to this math:
    // offset = (((w / 2) ** 2) / 2) ** (1 / 2)
    // (condensed a bit)
    // offset = w * 2 ** (1 / 2) / 4
    const offset = 1.0606601717 // for w = 3px

    // CHECKME: is this correct aria label usage?
    const dropSubLabel = props.dropped ? "raise" : "drop"
    const ariaLabel = `${dropSubLabel} button for ${props.ariaTitleLabel}`
    return (
        <svg
            aria-label={ariaLabel}
            role="switch"
            className={className}
            viewBox="0 0 40 40"
            onClick={props.onClick}
        >
            <line x1={left} y1={btm} x2={mid + offset} y2={top + offset} />
            <line x1={right} y1={btm} x2={mid - offset} y2={top + offset} />
        </svg>
    )
}
DropdownButton.propTypes = {
    ariaTitleLabel: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    dropped: PropTypes.bool.isRequired,
}

const DropBarContent = React.forwardRef(function (props, ref) {
    const className = useClassName({
        base: "DropBarContent",
        noMountingAnimation: true,
        filters: [
            {
                value: "dropped",
                useIf: props.dropped,
                otherwise: "raised",
            },
        ],
    })

    // CHECKME: is this how aria labels are used?
    const ariaLabel = `content for ${props.ariaTitleLabel}`
    return (
        <div
            ref={ref}
            aria-label={ariaLabel}
            // CHECKME: is "group" the right role, or "region"?
            role="group"
            className={className}
        >
            <div className="Container">{props.children}</div>
            <div className="TopGradient" />
            <div className="BottomGradient" />
        </div>
    )
})
DropBarContent.propTypes = {
    ariaTitleLabel: PropTypes.string.isRequired,
    children: PropTypes.node,
    dropped: PropTypes.bool.isRequired,
}
