import React, { useRef, useEffect, useState } from "react"
import { useClassName } from "common/hooks"
import PropTypes from "prop-types"

import "./Draggable.css"

const STYLE = {
    sheet: (() => {
        const sheet = document.createElement("style")
        document.head.appendChild(sheet)
        return sheet
    })(),
    setShrinkTransform(originX, originY, scalerWidth, scalerHeight) {
        STYLE.sheet.innerHTML = `.Draggable.holding {
            --transform-origin-x: ${originX}px;
            --transform-origin-y: ${originY}px;
            --transform-scaler-width: ${scalerWidth};
            --transform-scaler-height: ${scalerHeight};
        }`
    },
}

function Draggable(props) {
    const dragRef = useRef(null)
    const [holding, setHolding] = useState(false)
    // refs are used to allow listeners to have stable getters without
    // recreating and changing listeners every state change (these should be
    // treated as read only/getter values)
    const propsRef = useRef()
    propsRef.current = props
    const stateRef = useRef()
    stateRef.current = { holding }
    const className = useClassName({
        base: "Draggable",
        filters: [
            {
                value: "holding",
                useIf: holding,
            },
        ],
    })

    useEventListeners(propsRef, stateRef, dragRef, setHolding)

    // a scale container is used to allow unscaled coordinates to be
    // used in translating the element absolutely
    return (
        <div ref={dragRef} data-testid="draggable" className={className}>
            <div className="ScaleContainer">{props.children}</div>
        </div>
    )
}
Draggable.propTypes = {
    children: PropTypes.node,
    beforeDrag: PropTypes.func,
    onDrag: PropTypes.func,
    afterDrag: PropTypes.func,
}
export default Draggable

function useEventListeners(propsRef, stateRef, dragRef, setHolding) {
    // touchmove has to be bound here to pass { passive: false } (which allows
    // preventing scrolling)
    // BUG: if the pointer moves too fast, the event listeners lose track
    useEffect(() => {
        const onResetAll = (lastRect) => {
            trigger(propsRef.current.afterDrag, lastRect)
        }
        const helpers = createHelperCallbacks(dragRef, setHolding, onResetAll)
        const {
            touchStart,
            touchMove,
            touchEnd,
            mouseDown,
            mouseMove,
            mouseUp,
        } = createListeners(propsRef, stateRef, helpers)

        const elem = dragRef.current
        const notPassive = { passive: false }
        elem.addEventListener("touchstart", touchStart, notPassive)
        elem.addEventListener("touchmove", touchMove, notPassive)
        elem.addEventListener("touchend", touchEnd, notPassive)

        elem.addEventListener("mousedown", mouseDown)
        elem.addEventListener("mousemove", mouseMove)
        elem.addEventListener("mouseup", mouseUp)

        return () => {
            elem.removeEventListener("touchstart", touchStart)
            elem.removeEventListener("touchmove", touchMove)
            elem.removeEventListener("touchend", touchEnd)

            elem.removeEventListener("mousedown", mouseDown)
            elem.removeEventListener("mousemove", mouseMove)
            elem.removeEventListener("mouseup", mouseUp)
        }
    }, [propsRef, stateRef, dragRef, setHolding])
}

// (this function is called inside the effect; no need to memoize anything)
// creates some helper functions that interact with the Draggable DOM element
// and setting the current component state
function createHelperCallbacks(dragRef, setHolding) {
    // press-and-hold timeout functions
    let holdTimeout = null
    let cancelTimeout = null
    const startDelay = (onCancel) => {
        holdTimeout = setTimeout(() => setHolding(true), 160)

        // when touching for 0.5 seconds, the "contextmenu" event is fired,
        // stopping later control over preventing default scrolling actions;
        // this cancels the drag operation after the context event fires (bugs
        // arise when applying to the "contextmenu" event itself...)
        cancelTimeout = setTimeout(onCancel, 465)
    }
    const stopDelay = () => {
        clearTimeout(holdTimeout)
        holdTimeout = null

        clearTimeout(cancelTimeout)
        cancelTimeout = null
    }

    // press-and-hold move tracking functions
    let startHoldPos = null
    let startRect = null
    let lastUpdatedRect = null
    const createTrackingRects = (initHoldX, initHoldY) => {
        startHoldPos = { x: initHoldX, y: initHoldY }

        startRect = Rect.fromRect(dragRef.current.getBoundingClientRect())
        lastUpdatedRect = Rect.fromRect(startRect)

        return getTrackingRects()
    }
    const trackHoldMove = (currHoldX, currHoldY) => {
        const diffX = currHoldX - startHoldPos.x
        const diffY = currHoldY - startHoldPos.y
        lastUpdatedRect.x = startRect.x + diffX
        lastUpdatedRect.y = startRect.y + diffY
    }
    const getTrackingRects = () => {
        return [startRect, lastUpdatedRect]
    }
    const resetTrackingRects = () => {
        startHoldPos = null
        startRect = null
        lastUpdatedRect = null
    }

    // css sheet interface functions
    // (a rect is passed to help decouple these functions from the rest)
    const setShrinkVars = (boundsAsRect, holdXRelScreen, holdYRelScreen) => {
        const holdXRelRect = holdXRelScreen - boundsAsRect.left
        const holdYRelRect = holdYRelScreen - boundsAsRect.top
        STYLE.setShrinkTransform(
            holdXRelRect,
            holdYRelRect,
            boundsAsRect.width,
            boundsAsRect.height
        )
    }
    const setDragTransform = (boundsAsRect) => {
        const transX = boundsAsRect.left
        const transY = boundsAsRect.top
        // transform is used to keep the element in the same
        // document flow while still visually moving
        dragRef.current.style.setProperty(
            "transform",
            `translate(${transX}px, ${transY}px)`
        )
    }
    const resetDragTransform = () => {
        dragRef.current.style.setProperty("transform", null)
    }

    // for when dragging ends...
    const resetAllAsDragEnds = () => {
        setHolding(false)
        stopDelay()
        resetTrackingRects()

        // this is in case events fire after the component has already
        // unmounted (which will likely only happen in a testing environment)
        const unmounted = dragRef.current === null
        if (!unmounted) {
            resetDragTransform()
        }
    }

    // called inside effect; no need to memoize
    return {
        startDelay,
        stopDelay,
        createTrackingRects,
        trackHoldMove,
        getTrackingRects,
        resetTrackingRects,
        setShrinkVars,
        setDragTransform,
        resetDragTransform,
        resetAllAsDragEnds,
    }
}

// (this function is called inside the effect; no need to memoize anything                         )
// creates a group of event listeners that will be mounted inside useEffect();
// this function MUST NOT (unless calling helper functions) modify component
// state or modify/set any ref values
function createListeners(propsRef, stateRef, helpers) {
    const startHold = (initHoldX, initHoldY) => {
        helpers.startDelay(endHold)

        const [initRect] = helpers.createTrackingRects(initHoldX, initHoldY)
        helpers.setShrinkVars(initRect, initHoldX, initHoldY)

        trigger(propsRef.current.beforeDrag, initRect)
    }
    const touchStart = (event) => {
        const { clientX, clientY } = event.touches[0]
        startHold(clientX, clientY)
    }
    const mouseDown = (event) => {
        const { clientX, clientY } = event
        startHold(clientX, clientY)
    }

    const moveHold = (currHoldX, currHoldY, event) => {
        helpers.trackHoldMove(currHoldX, currHoldY)
        const [startRect, currRect] = helpers.getTrackingRects()
        const isHolding = stateRef.current.holding

        // don't move cursor/finger before drag is ready!
        // TODO: maybe have this work differently for mouse vs touches?
        const startHoldX = startRect.x
        const startHoldY = startRect.y
        const holdMoveX = Math.abs(currHoldX - startHoldX)
        const holdMoveY = Math.abs(currHoldY - startHoldY)
        const margin = 0.6 // just in case it reads touches moving slightly
        const heldInSamePlace = holdMoveX < margin && holdMoveY < margin
        // check for pre-hold move (touch scrolling, etc)
        if (!isHolding && !heldInSamePlace) {
            // endHold() stops the delays for dragging, which means
            // dragging can only start again after a new touch is started
            endHold()
            return
        }

        if (isHolding) {
            event.preventDefault()
            helpers.stopDelay() // stop the canceller timeout

            helpers.trackHoldMove(currHoldX, currHoldY)
            // allowing css transform adjustments to be returned allows actions
            // (like scrolling when held in a certain place) to be offset
            const moddableRect = Rect.fromRect(currRect)
            const modifiedRect = trigger(propsRef.current.onDrag, moddableRect)
            const isValidRect =
                typeof modifiedRect === "object" &&
                modifiedRect !== null &&
                typeof modifiedRect.top === "number" &&
                typeof modifiedRect.left === "number"
            if (modifiedRect !== undefined && !isValidRect) {
                throw new TypeError(
                    "Draggable props.onDrag() can only return a DOMRect object (you may modify and return the one passed to onDrag())"
                )
            }

            const useRect = modifiedRect || moddableRect
            helpers.setDragTransform(useRect)
        }
    }
    const touchMove = (event) => {
        const { clientX, clientY } = event.touches[0]
        moveHold(clientX, clientY, event)
    }
    const mouseMove = (event) => {
        const { clientX, clientY } = event
        moveHold(clientX, clientY, event)
    }

    const endHold = () => {
        // eslint-disable-next-line no-unused-vars
        const [_, lastRect] = helpers.getTrackingRects()
        helpers.resetAllAsDragEnds()
        trigger(propsRef.current.afterDrag, lastRect)
    }
    // eslint-disable-next-line no-unused-vars
    const touchEnd = (event) => {
        endHold()
    }
    // eslint-disable-next-line no-unused-vars
    const mouseUp = (event) => {
        endHold()
    }

    // called inside effect; no need to memoize
    return {
        touchStart,
        touchMove,
        touchEnd,
        mouseDown,
        mouseMove,
        mouseUp,
    }
}

function trigger(func, ...args) {
    if (typeof func === "function") {
        func(...args)
    }
}

// supposed to be a DOMRect, but apparently those don't exist in the tests...
class Rect {
    static fromRect(rect) {
        return new Rect(rect.x, rect.y, rect.width, rect.height)
    }

    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    toString() {
        return "[object Rect]"
    }

    get left() {
        return this.x
    }

    set left(newLeft) {
        this.x = newLeft
    }

    get right() {
        return this.left + this.width
    }

    set right(newRight) {
        this.left = newRight - this.width
    }

    get top() {
        return this.y
    }

    set top(newTop) {
        this.y = newTop
    }

    get bottom() {
        return this.top + this.height
    }

    set bottom(newBottom) {
        this.top = newBottom - this.height
    }
}
