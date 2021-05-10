import React from "react";
import PropTypes from "prop-types";

const HOLD_TIME_MS = 600;

// if a holdable is pressed and held, it will initiate its onHold() property
export default class Holdable extends React.Component {
    static propTypes = {
        onHold: PropTypes.func,
    };

    render() {
        return (
            <div
                data-testid="holdable"
                className="Holdable"
                onTouchStart={(event) => this._startTouchHold(event)}
                onTouchEnd={(event) => this._cancelTouchHold(event)}
                onTouchMove={(event) => this._cancelTouchHold(event)}
                onMouseDown={(event) => this._startMouseHold(event)}
                onMouseUp={(event) => this._cancelMouseHold(event)}
                onMouseMove={(event) => this._cancelMouseHold(event)}
            >
                {this.props.children}
            </div>
        );
    }

    triggerOnHold() {
        if (typeof this.props.onHold === "function") {
            this.props.onHold();
        }
        this._ignoreMouseEvents = false;
    }

    // keeps touch events seperate from their pair mouse events (to avoid repeating touch->mouse calls)
    _startTouchHold(event) {
        this._ignoreMouseEvents = true;
        this._startMouseHold(event, true);
    }
    _cancelTouchHold(event) {
        this._cancelMouseHold(event, true);
    }

    _startMouseHold(event, isTouch = false) {
        if (isTouch || !this._ignoreMouseEvents) {
            this._holdTimeout = setTimeout(
                () => this.triggerOnHold(),
                HOLD_TIME_MS
            );
            this._lastTouch = null;
        }
    }
    _cancelMouseHold(event, isTouch = false) {
        let cursor = event;
        if (cursor.touches !== undefined) {
            cursor = cursor.touches[0];
        }
        if (isTouch || !this._ignoreMouseEvents) {
            // NOTE: sometimes touchmove is activated when it is still, so this detects if there was actually a move
            if (event.type === "touchmove") {
                const { clientX, clientY } = cursor;
                if (!this._lastTouch) {
                    this._lastTouch = { x: clientX, y: clientY };
                    return; // first move; don't clear timeout
                } else if (
                    this._lastTouch.x === clientX &&
                    this._lastTouch.y === clientY
                ) {
                    return; // didn't move; don't clear timeout
                }
            }
            clearTimeout(this._holdTimeout);
        }
    }
}
