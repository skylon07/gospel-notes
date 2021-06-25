import React, { useRef } from "react";
import PropTypes from "prop-types";

const HOLD_TIME_MS = 600;

// if a holdable is pressed and held, it will initiate its onHold() property
function Holdable(props) {
    const mouseIgnored = useRef(false);
    const holdTimeout = useRef(null);
    const startingTouchPosition = useRef(null);

    const triggerOnHold = () => {
        if (typeof props.onHold === "function") {
            props.onHold();
        }
        // NOTE: alerts and UI bugs prevent cancelTouchHold() from running,
        //       so this ensures the mouse is useable even if the touchend event
        //       is never fired
        mouseIgnored.current = false;
    };

    const startTouchHold = (event) => {
        const { clientX, clientY } = event.touches[0];
        startingTouchPosition.current = { startX: clientX, startY: clientY };

        // NOTE: touch events fire similar mouse events; to prevent both from
        //       activating, touch events temporarily block mouse events (it's
        //       temporary to still allow both to work)
        mouseIgnored.current = true;
        startHold(event);
    };
    const startMouseHold = (event) => {
        if (!mouseIgnored.current) {
            startHold(event);
        }
    };
    const startHold = (event) => {
        holdTimeout.current = setTimeout(triggerOnHold, HOLD_TIME_MS);
    };

    const cancelTouchHold = (event) => {
        // NOTE: moving a touch should cancel the hold, however sometimes
        //       onTouchMove is activated when nothing moved, so this detects if
        //       there was actually a change
        if (event.type === "touchmove") {
            const { clientX: currX, clientY: currY } = event.touches[0];
            const { startX, startY } = startingTouchPosition.current;
            const xMoved = currX !== startX;
            const yMoved = currY !== startY;
            if (!xMoved && !yMoved) {
                return; // prevent cancel; didn't move
            }
        }

        cancelHold(event);
        mouseIgnored.current = false;
    };
    const cancelMouseHold = (event) => {
        if (!mouseIgnored.current) {
            cancelHold(event);
        }
    };
    const cancelHold = (event) => {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
    };

    return (
        <div
            data-testid="holdable"
            className="Holdable"
            onTouchStart={startTouchHold}
            onTouchEnd={cancelTouchHold}
            // onTouchMove cancels for cases like when the user is scrolling
            onTouchMove={cancelTouchHold}
            onMouseDown={startMouseHold}
            onMouseUp={cancelMouseHold}
        >
            {props.children}
        </div>
    );
}
Holdable.propTypes = {
    onHold: PropTypes.func,
};
export default Holdable;
