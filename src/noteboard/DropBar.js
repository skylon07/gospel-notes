import React from "react";
import PropTypes from "prop-types";
import "./DropBar.css";

import { SVGIcon } from "common/svg-icon";

import Holdable from "./Holdable.js";
import NoteBox from "./NoteBox.js"

const GLOBALS = {
    offsetSheet: (() => {
        const e = document.createElement("style");
        document.head.appendChild(e);
        return e;
    })(),
    updateOffsets(offset) {
        GLOBALS.offsetSheet.innerHTML = `.DropBar, .DropBarTransform { --bottom-bar-shift: ${offset}px; }`;
    },
    bottomBarHeight: 6,
};

function getChildIdx(elem) {
    let idx = 0;
    while (elem.previousSibling) {
        idx++;
        elem = elem.previousSibling;
    }
    return idx;
}

export default class DropBar extends React.Component {
    static propTypes = {
        // update-ignored props
        initTitle: PropTypes.string,
        initIconType: PropTypes.string,
        
        // update-honored props
        children: PropTypes.node,
        canChange: PropTypes.bool,
        onChangeTitle: PropTypes.func,
        onChangeIcon: PropTypes.func,
    };
    
    shouldComponentUpdate(nextProps, nextState) {
        // NOTE: changes in "init..." props can be ignored
        return nextProps.children !== this.props.children ||
            nextProps.canChange !== this.props.canChange ||
            nextProps.onChangeTitle !== this.props.onChangeTitle ||
            nextProps.onChangeIcon !== this.props.onChangeIcon ||
            nextState.title !== this.state.title ||
            nextState.iconType !== this.state.iconType ||
            nextState.dropped !== this.state.dropped
    }

    constructor(props) {
        super(props);

        this.state = {
            title: props.initTitle || "",
            iconType: props.initIconType || "blank",
            dropped: false,
        };

        this.ref = React.createRef();
        this.contentElem = null; // set on mount
        this.holdIsTouch = false;

        this.on = {
            hold: () => this.triggerRename(),
            allowTriggerDrop: () => this._allowTriggerDrop(),
            triggerDrop: () => this.triggerDrop(),
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
                        <SVGIcon type={this.state.iconType || "blank"} />
                        {this.state.title}
                        <div className="Spacer" />
                        <DropdownButton
                            onClick={this.on.triggerDrop}
                            dropped={this.state.dropped}
                        />
                    </div>
                </Holdable>
                <DropBarContent dropped={this.state.dropped}>
                    {this.props.children}
                </DropBarContent>
                <div className={this.getBottomBarClass()} />
            </div>
        );
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

    _findContentElem() {
        this.contentElem = this.ref.current.querySelector(".DropBarContent")
    }
    
    canChange() {
        if (typeof this.props.canChange === "boolean") {
            return this.props.canChange
        }
        return true
    }

    triggerRename() {
        if (this.canChange()) {
            // ignore the possible drop after releasing
            this._ignoreTriggerDrop = true;
            
            const newTitle = window.prompt("Enter a new title", this.state.title)
            if (newTitle === null || newTitle === undefined) {
                return // prompt was cancelled; don't change state
            }
            
            this.setState({title: newTitle})
            if (typeof this.props.onChangeTitle == "function") {
                this.props.onChangeTitle(newTitle)
            }
        }
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
        
        if (direction === "raising") {
            this._scrollParentIfUnderflow(parent)
        }
        for (let idx = elemIdx + 1; idx < parent.children.length; idx++) {
            const child = parent.children[idx];
            // sets children after with the animation
            this._setAnimationClasses(child, direction);
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
    
    _scrollParentIfUnderflow(parent) {
        const heightChange = this.contentElem.offsetHeight + GLOBALS.bottomBarHeight
        const maxScrollBottom = parent.scrollHeight - heightChange
        const scrollBottom = parent.scrollTop + parent.offsetHeight
        
        // NOTE: canScroll helps prevent making scrollBy() calls to elements
        //       that can't scroll (likely because this DropBar is in a wrapper
        //       element, and therefore taking all the height)
        const canScroll = parent.scrollTop > 0
        const scrollDiff = maxScrollBottom - scrollBottom
        if (scrollDiff < 0 && canScroll) {
            parent.scrollBy({
                top: scrollDiff, 
                behavior: "smooth",
            })
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
