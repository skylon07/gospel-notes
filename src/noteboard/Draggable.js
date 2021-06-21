import React, { useRef, useEffect, useState } from "react";
import { useClassName } from "common/hooks"
import PropTypes from "prop-types";

import "./Draggable.css";

const STYLE = {
    sheet: (() => {
        const sheet = document.createElement("style");
        document.head.appendChild(sheet);
        return sheet;
    })(),
    setTransform(originX, originY, scalerWidth, scalerHeight) {
        STYLE.sheet.innerHTML = `.Draggable.holding {
            --transform-origin-x: ${originX}px;
            --transform-origin-y: ${originY}px;
            --transform-scaler-width: ${scalerWidth};
            --transform-scaler-height: ${scalerHeight};
        }`;
    },
};

function Draggable(props) {
    const ref = useRef(null)
    const [holding, setHolding] = useState(false)
    const className = useClassName({
        base: "Draggable",
        filters: [{
            value: "holding",
            useIf: holding,
        }],
    })
    
    const changers = { setHolding }
    const dragHandler = useStaticValue(() => {
        return new DragHandler(ref, changers)
    })
    dragHandler.update(props)
    
    mountEventListeners(ref, dragHandler)
    
    // NOTE: a scale container is used to allow unscaled coordinates to be
    //       used in translating the element absolutely
    return (
        <div
            ref={ref}
            data-testid="draggable"
            className={className}
        >
            <div className="ScaleContainer">
                {props.children}
            </div>
        </div>
    );
}
Draggable.propTypes = {
    beforeDrag: PropTypes.func,
    onDrag: PropTypes.func,
    afterDrag: PropTypes.func,
}
export default Draggable

function mountEventListeners(ref, dragHandler) {
    // touchmove has to be bound here to pass { passive: false } (which allows
    // preventing scrolling)
    // BUG: if the pointer moves too fast, the event listeners lose track
    useEffect(() => {
        const elem = ref.current;
        const notPassive = { passive: false }
        elem.addEventListener("touchstart", dragHandler.touchStart, notPassive);
        elem.addEventListener("touchmove", dragHandler.touchMove, notPassive);
        elem.addEventListener("touchend", dragHandler.touchEnd, notPassive);
    
        elem.addEventListener("mousedown", dragHandler.mouseDown);
        elem.addEventListener("mousemove", dragHandler.mouseMove);
        elem.addEventListener("mouseup", dragHandler.mouseUp);
        
        return () => {
            elem.removeEventListener("touchstart", dragHandler.touchStart);
            elem.removeEventListener("touchmove", dragHandler.touchMove);
            elem.removeEventListener("touchend", dragHandler.touchEnd);
            
            elem.removeEventListener("mousedown", dragHandler.mouseDown);
            elem.removeEventListener("mousemove", dragHandler.mouseMove);
            elem.removeEventListener("mouseup", dragHandler.mouseUp);
        }
    }, [])
}

class DragHandler {
    constructor(elemRef, stateChangers) {
        this._ref = elemRef
        this.__setHoldingState = stateChangers.setHolding
        this.__lastHolding = false
        
        this.touchStart = this.touchStart.bind(this)
        this.touchMove = this.touchMove.bind(this)
        this.touchEnd = this.touchEnd.bind(this)
        
        this.mouseDown = this.mouseDown.bind(this)
        this.mouseMove = this.mouseMove.bind(this)
        this.mouseUp = this.mouseUp.bind(this)
    }

    update(props) {
        this._lastProps = props
    }
    
    // NOTE: abstracting touch/mouse handlers allows us to use the same
    //       dragging logic for both
    touchStart(event) {
        const { clientX, clientY } = event.touches[0];
        this.startHold(clientX, clientY, event);
    }
    mouseDown(event) {
        const { clientX, clientY } = event;
        this.startHold(clientX, clientY, event);
    }
    startHold(initHoldX, initHoldY, event) {
        this._startDelay(initHoldX, initHoldY, event)
        
        const initRect = this._initSelfRect(initHoldX, initHoldY)
        this._updateTransformStyle(initHoldX, initHoldY);
        
        this.trigger(this._lastProps.beforeDrag, initRect);
    }
    
    touchMove(event) {
        const { clientX, clientY } = event.touches[0];
        this.moveHold(clientX, clientY, event);
    }
    mouseMove(event) {
        const { clientX, clientY } = event;
        this.moveHold(clientX, clientY, event);
    }
    moveHold(currHoldX, currHoldY, event) {
        this._trackSelfPosition(currHoldX, currHoldY)
        
        // don't move cursor/finger before drag is ready!
        // TODO: maybe have this work differently for mouse vs touches?
        const holdMoveX = Math.abs(currHoldX - this._startRect.left)
        const holdMoveY = Math.abs(currHoldY - this._startRect.top)
        const margin = 0.6 // just in case it reads touches moving slightly
        const heldInSamePlace = holdMoveX < margin && holdMoveY < margin
        if (!this._isHolding && !heldInSamePlace) {
            // NOTE: endHold() stops the delays for dragging, which means
            // dragging can only start again after a new touch is started
            this.endHold();
            return
        }
        
        if (this._isHolding) {
            event.preventDefault();
            this._cancelDelay();
            
            // NOTE: allowing adjustments to be returned allows actions (like
            //       scrolling when held in a certain place) to be offset
            const genCurrRect = this._genCurrSelfRect()
            const onDragRect = this.trigger(this._lastProps.onDrag, genCurrRect);
            const isValidRect = typeof onDragRect === "object" &&
                onDragRect !== null && typeof onDragRect.top === "number" &&
                typeof onDragRect.left === "number"
            if (onDragRect !== undefined && !isValidRect) {
                throw new TypeError("Draggable props.onDrag() can only return a DOMRect object (you may modify and return the one passed to onDrag())");
            }
            
            const currRect = onDragRect || genCurrRect 
            this._setRefTransform(currRect);
        }
    }
    
    touchEnd(event) {
        this.endHold();
    }
    mouseUp(event) {
        this.endHold();
    }
    endHold() {
        this._setHolding(false)
        this._cancelDelay()
        
        // NOTE: in case events fire after the component has already unmounted
        //       (which will likely only happen in a testing environment)
        const unmounted = this._ref.current === null
        if (!unmounted) {
            this._resetRefTransform()
        }
        
        const currRect = this._genCurrSelfRect()
        this.trigger(this._lastProps.afterDrag, currRect);
    }
    
    trigger(propFunc, currRect) {
        if (typeof propFunc === "function") {
            return propFunc(currRect)
        }
    }
    
    // css helper functions
    _updateTransformStyle(holdXRelScreen, holdYRelScreen) {
        const holdXRelRect = holdXRelScreen - this._startRect.left;
        const holdYRelRect = holdYRelScreen - this._startRect.top;
        STYLE.setTransform(
            holdXRelRect,
            holdYRelRect,
            this._startRect.width,
            this._startRect.height
        );
    }
    
    _setRefTransform(rect) {
        const transX = rect.left
        const transY = rect.top
        // NOTE: transform is used to keep the element in the same
        //       document flow while still visually moving
        this._ref.current.style.setProperty(
            "transform",
            `translate(${transX}px, ${transY}px)`
        );
    }
    
    _resetRefTransform() {
        this._ref.current.style.setProperty("transform", null);
    }
    
    // rect tracking helper functions
    _initSelfRect(initHoldX, initHoldY) {
        this.__startHoldX = initHoldX
        this.__startHoldY = initHoldY
        
        this._startRect = Rect.fromRect(
            this._ref.current.getBoundingClientRect()
        )
        this.__currLeft = this._startRect.left
        this.__currTop = this._startRect.top
        return this._startRect
    }
    
    _trackSelfPosition(currHoldX, currHoldY) {
        const diffX = currHoldX - this.__startHoldX
        const diffY = currHoldY - this.__startHoldY
        
        this.__currLeft = diffX + this._startRect.left
        this.__currTop = diffY + this._startRect.top
    }
    
    _genCurrSelfRect() {
        const currRect = Rect.fromRect({
            x: this.__currLeft,
            y: this.__currTop,
            width: this._startRect.width,
            height: this._startRect.height
        })
        return currRect
    }
    
    // hold delay timeout helper functions
    _startDelay(initHoldX, initHoldY, event) {
        this.__holdTimeout = window.setTimeout(
            () => this._setHolding(true),
            160
        );
        
        // NOTE: when touching for 0.5 seconds, the "contextmenu" event is fired, preventing further
        // control over preventing default scrolling actions; this cancels the drag operation after
        // the context event fires (bugs arise when applying to the "contextmenu" event itself...)
        this.__holdCancelTimeout = window.setTimeout(
            () => this.endHold(),
            465
        );
    }
    
    _cancelDelay() {
        window.clearTimeout(this._holdTimeout);
        this.__holdTimeout = null;
    
        window.clearTimeout(this._holdCancelTimeout);
        this.__holdCancelTimeout = null;
    }
    
    // Draggable state helper functions
    // NOTE: this.__lastHolding is set asyncronously, because it is a request
    //       to change state
    _setHolding(newState) {
        this.__setHoldingState(() => {
            this.__lastHolding = newState
            return newState
        })
    }
    
    get _isHolding() {
        return this.__lastHolding
    }
}

// supposed to be a DOMRect, but apparently those don't exist in the tests...
class Rect {
    static fromRect(rect) {
        return new Rect(rect.x, rect.y, rect.width, rect.height)
    }
    
    constructor(x=0, y=0, width=0, height=0) {
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
