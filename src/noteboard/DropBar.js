import React from "react";
import PropTypes from "prop-types";
import "./DropBar.css";

import { SVGIcon } from "common/svg-icon";

import Holdable from "./Holdable.js";
import NoteBox from "./NoteBox.js"
import AddButton from "./AddButton.js"

const GLOBALS = {
    offsetSheet: (() => {
        const e = document.createElement("style");
        document.head.appendChild(e);
        return e;
    })(),
    updateOffsets(offset) {
        GLOBALS.offsetSheet.innerHTML = `.DropBar, .DropBarTransform { --bottom-bar-shift: ${offset}px; }`;
    },
};

function getChildIdx(elem) {
    let idx = 0;
    while (elem.previousSibling) {
        idx++;
        elem = elem.previousSibling;
    }
    return idx;
}

export default class DropBar extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string,
        iconType: PropTypes.string,
        canModify: PropTypes.bool,
        onMouseHold: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            dropped: false,
            notes: [], // {title, content, dateID}
        };

        this.ref = React.createRef();
        this.contentElem = null; // set on mount
        this.holdIsTouch = false;

        this.on = {
            hold: () => this.triggerOnMouseHold(),
            allowTriggerDrop: () => this._allowTriggerDrop(),
            triggerDrop: () => this.triggerDrop(),
            addNote: () => this.addNote("New Note", "This is the note content"),
        }
    }

    render() {
        return (
            <div data-testid="drop-bar" ref={this.ref} className={this.getClass()}>
                <Holdable onHold={this.on.hold}>
                    <div
                        className="Bar"
                        onMouseUp={this.on.allowTriggerDrop}
                        onTouchEnd={this.on.allowTriggerDrop}
                        onTouchCancel={this.on.allowTriggerDrop}
                    >
                        <SVGIcon type={this.props.iconType || "blank"} />
                        {this.props.title}
                        <div className="Spacer" />
                        <DropdownButton
                            onClick={this.on.triggerDrop}
                            dropped={this.state.dropped}
                        />
                    </div>
                </Holdable>
                <DropBarContent dropped={this.state.dropped}>
                    {this.renderNotes()}
                    {this.renderAddButton()}
                </DropBarContent>
                <div className={this.getBottomBarClass()} />
            </div>
        );
    }

    renderNotes() {
        return this.state.notes.map(({ title, content, dateID }) => {
            return <NoteBox key={dateID} title={title} content={content} />
        })
    }

    renderAddButton() {
        if (this.props.canModify) {
            return <AddButton onClick={this.on.addNote}>
                Add Note
            </AddButton>
        }
        return null
    }

    getClass() {
        const base = "DropBar";
        const init = !this.mounted ? "initAnimation" : "";
        return `${base} ${init}`;
    }

    getBottomBarClass() {
        const base = "BottomBar";
        const dropped = this.state.dropped ? "dropped" : "raised";
        return `${base} ${dropped}`;
    }

    componentDidMount() {
        this.mounted = true
        this._findContentElem();
    }

    addNote(title, content) {
        const dateID = new Date().getTime()
        const newNote = { title, content, dateID }
        this.setState((state) => {
            const newNotes = state.notes.concat(newNote)
            return { notes: newNotes }
        })
    }

    // TODO: is this the best/safest way to accomplish this...?
    _findContentElem() {
        let elem = this.ref.current.children[0];
        while (!elem.classList.contains("DropBarContent")) {
            elem = elem.nextSibling;
        }
        this.contentElem = elem;
    }

    triggerOnMouseHold() {
        if (typeof this.props.onMouseHold === "function") {
            this.props.onMouseHold();
        }
        // ignore the possible drop after releasing
        this._ignoreTriggerDrop = true;
    }

    _allowTriggerDrop() {
        // timeout allows any child click events to propogate first
        setTimeout(() => (this._ignoreTriggerDrop = false), 10);
    }

    triggerDrop() {
        if (!this._ignoreTriggerDrop) {
            this.toggleDrop();
        }
    }

    toggleDrop() {
        this.setState((state, props) => {
            this._prepareAnimationOffset();
            const newDropped = !state.dropped
            return { dropped: newDropped };
        }, () => {
            const direction = this.state.dropped ? "dropping" : "raising"
            this._updateSiblingAndParentClasses(this.ref.current, direction)
        });
    }

    _prepareAnimationOffset() {
        // offsetHeight is used since this represents the height
        // before transformations are applied
        const currHeight = this.contentElem.offsetHeight;
        GLOBALS.updateOffsets(currHeight);
    }
    
    _updateSiblingAndParentClasses(elem, direction) {
        const parent = elem.parentElement;
        const elemIdx = getChildIdx(elem);
        
        for (let idx = 0; idx < parent.children.length; idx++) {
            const child = parent.children[idx];
            // sets previous children (and self) with no animation
            if (idx <= elemIdx) {
                this._setAnimationClasses(child, null);
            }
            // sets children after with the animation
            else {
                this._setAnimationClasses(child, direction);
            }
        }
        
        // performs the same operations on the parent until hitting the group
        if (parent !== document.body) {
            this._updateSiblingAndParentClasses(parent, direction);
        }
    }
    
    _setAnimationClasses(elem, state) {
        const base = "DropBarTransform"
        const dropping = "dropping"
        const raising = "raising"
        const listen = () => elem.addEventListener(
            "animationend",
            () => {
                // ensures that the same animation can re-run multiple times
                elem.classList.remove(base, dropping, raising);
            },
            { once: true }
        );

        switch (state) {
            case "dropping": {
                elem.classList.add(base, dropping);
                elem.classList.remove(raising);
                listen()
            }
            break;

            case "raising": {
                elem.classList.add(base, raising);
                elem.classList.remove(dropping);
                listen()
            }
            break;

            default: {
                elem.classList.remove(base, dropping, raising);
            }
            break;
        }
    }
}

// the arrow that triggers the dropdown
class DropdownButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        dropped: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.mounted = false;
    }

    render() {
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
                className={this.getClass()}
                viewBox="0 0 40 40"
                onClick={this.props.onClick}
            >
                <line x1={left} y1={btm} x2={mid + offset} y2={top + offset} />
                <line x1={right} y1={btm} x2={mid - offset} y2={top + offset} />
            </svg>
        );
    }

    getClass() {
        const base = "DropdownButton";
        const dropped = this.props.dropped ? "dropped" : "raised";
        return `${base} ${dropped}`;
    }

    componentDidMount() {
        this.mounted = true;
    }
}

// a wrapper for the content inside the drop bar
class DropBarContent extends React.Component {
    static propTypes = {
        dropped: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.mounted = false;
    }

    render() {
        return (
            <div data-testid="drop-bar-content" className={this.getClass()}>
                <div className="Container">{this.props.children}</div>
                <div className="TopGradient" />
                <div className="BottomGradient" />
            </div>
        );
    }

    getClass() {
        const base = "DropBarContent";
        const dropped = this.props.dropped ? "dropped" : "raised";
        return `${base} ${dropped}`;
    }

    componentDidMount() {
        this.mounted = true;
    }
}
