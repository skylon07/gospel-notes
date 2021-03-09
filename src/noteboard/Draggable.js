import React from "react";
import PropTypes from "prop-types";

import "./Draggable.css";

const GLOBALS = {
    transformSheet: (() => {
        const e = document.createElement("style");
        document.head.appendChild(e);
        return e;
    })(),
    updateTransformations(originX, originY, scaleX, scaleY) {
        GLOBALS.transformSheet.innerHTML = `.Draggable.holding {
            --transform-origin-x: ${originX}px;
            --transform-origin-y: ${originY}px;
            --transform-scale-x: ${scaleX};
            --transform-scale-y: ${scaleY};
        }`;
    },
};

export default class Draggable extends React.Component {
    static propTypes = {
        dragRef: PropTypes.oneOf([PropTypes.object, PropTypes.func]),
        beforeDrag: PropTypes.func,
        onDrag: PropTypes.func,
        afterDrag: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            holding: false,
        };
        this.lastMoveX = null;
        this.lastMoveY = null;

        this.transX = null;
        this.transY = null;

        this.dragRef = React.createRef();

        this.holdTimeout = null;
        this.holdCancelTimeout = null;
    }

    render() {
        // NOTE: a scale container is used to allow unscaled coordinates to be
        //       used in translating the element absolutely
        return (
            <div
                aria-label="draggable"
                ref={(elem) => this.updateDragRef(elem)}
                className={this.getClass()}
            >
                <div className="ScaleContainer">{this.props.children}</div>
            </div>
        );
    }

    getClass() {
        const base = "Draggable";
        const holding = this.state.holding ? "holding" : "";
        return `${base} ${holding}`;
    }

    componentDidMount() {
        // TODO: record if user is on a phone or a computer and use correct events

        // touchmove has to be bound here to pass {passive: false} (which prevents scrolling)
        // BUG: if the user moves the pointer too fast, the event listeners lose track
        const elem = this.dragRef.current;
        elem.addEventListener("touchend", (event) => this.endHoldTouch(event), {
            passive: false,
        });
        elem.addEventListener(
            "touchmove",
            (event) => this.moveHoldTouch(event),
            { passive: false }
        );
        elem.addEventListener(
            "touchstart",
            (event) => this.startHoldTouch(event),
            { passive: false }
        );

        elem.addEventListener("mouseup", (event) => this.endHoldMouse(event));
        elem.addEventListener("mousemove", (event) =>
            this.moveHoldMouse(event)
        );
        elem.addEventListener("mousedown", (event) =>
            this.startHoldMouse(event)
        );

        this.resetTransformStyle();
    }

    triggerBeforeDrag() {
        if (typeof this.props.beforeDrag === "function") {
            this.props.beforeDrag();
        }
    }
    // NOTE: this function is expected to return a coordinate diff array,
    //       regardless if the user provided a function or not (this is
    //       useful, for example, for touch-move-based scrolling)
    triggerOnDrag(diffX, diffY) {
        let adjusted = [diffX, diffY];
        if (typeof this.props.onDrag === "function") {
            const newAdjusted = this.props.onDrag(diffX, diffY);
            adjusted = newAdjusted || adjusted
        }
        return adjusted;
    }
    triggerAfterDrag() {
        if (typeof this.props.afterDrag === "function") {
            this.props.afterDrag();
        }
    }

    // NOTE: abstracting touch/mouse handlers allows us to use the same
    //       dragging logic for both
    startHoldTouch(event) {
        const { clientX, clientY } = event.touches[0];
        this.startHold(clientX, clientY);
    }
    moveHoldTouch(event) {
        const { clientX, clientY } = event.touches[0];
        const diffX = clientX - this.lastMoveX;
        const diffY = clientY - this.lastMoveY;
        const wasReset = this.moveHold(
            () => event.preventDefault(),
            diffX,
            diffY
        );

        if (!wasReset) {
            this.lastMoveX = clientX;
            this.lastMoveY = clientY;
        }
    }
    endHoldTouch(event) {
        this.endHold();
    }

    startHoldMouse(event) {
        const { clientX, clientY } = event;
        this.startHold(clientX, clientY);
    }
    moveHoldMouse(event) {
        const { clientX, clientY } = event;
        const diffX = clientX - this.lastMoveX;
        const diffY = clientY - this.lastMoveY;
        const wasReset = this.moveHold(
            () => event.preventDefault(),
            diffX,
            diffY
        );

        if (!wasReset) {
            this.lastMoveX = clientX;
            this.lastMoveY = clientY;
        }
    }
    endHoldMouse(event) {
        this.endHold();
    }

    startHold(initHoldX, initHoldY) {
        this.holdTimeout = setTimeout(() => {
            this.setState({ holding: true });
        }, 160);
        this.updateShrink(initHoldX, initHoldY);

        this.lastMoveX = initHoldX;
        this.lastMoveY = initHoldY;

        // NOTE: when touching for 0.5 seconds, the "contextmenu" event is fired, preventing further
        // control over preventing default scrolling actions; this cancels the drag operation after
        // the context event fires (bugs arise when applying to the "contextmenu" event itself...)
        this.holdCancelTimeout = setTimeout(() => this.endHold(), 465);

        this.triggerBeforeDrag();
    }

    moveHold(preventEventDefault, diffX, diffY) {
        if (this.state.holding) {
            preventEventDefault();

            clearTimeout(this.holdCancelTimeout);
            this.holdCancelTimeout = null;

            const adjust = this.triggerOnDrag(diffX, diffY);
            if (!Array.isArray(adjust)) {
                throw new TypeError("triggerOnDrag() must return an array");
            }

            this.updateTransformStyle(adjust[0], adjust[1]);
        }

        // don't move cursor/finger before drag is ready!
        // TODO: maybe have this work differently for mouse vs touches?
        else if (diffX > 0 || diffY > 0) {
            this.endHold();
            return true;
        }

        return false;
    }

    endHold() {
        if (this.state.holding) {
            this.setState({ holding: false });
            this.resetTransformStyle();
        }

        this.lastMoveX = null;
        this.lastMoveY = null;

        clearTimeout(this.holdTimeout);
        this.holdTimeout = null;

        clearTimeout(this.holdCancelTimeout);
        this.holdCancelTimeout = null;

        this.triggerAfterDrag();
    }

    updateTransformStyle(transByX, transByY) {
        // NOTE: transform is used to keep the element in the same
        //       document flow while still visually moving
        this.transX += transByX;
        this.transY += transByY;
        this.dragRef.current.style.setProperty(
            "transform",
            `translate(${this.transX}px, ${this.transY}px)`
        );
    }
    resetTransformStyle() {
        this.dragRef.current.style.setProperty("transform", null);
        this.transX = 0;
        this.transY = 0;
    }

    updateShrink(initX, initY) {
        const rect = this.dragRef.current.getBoundingClientRect();
        // pointer coordinate relative to the rectangle's left value
        const holdRelLeft = initX - rect.left;
        const holdRelTop = initY - rect.top;
        GLOBALS.updateTransformations(
            holdRelLeft,
            holdRelTop,
            rect.width,
            rect.height
        );
    }

    updateDragRef(elem) {
        this.dragRef.current = elem;
        if (typeof this.props.dragRef === "function") {
            this.props.dragRef(elem);
        } else if (
            typeof this.props.dragRef === "object" &&
            this.props.dragRef !== null
        ) {
            this.props.dragRef.current = elem;
        }
    }
}
