import React from "react";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
import "./DropBarGroup.css";

import DropBar from "./DropBar.js";

const GLOBALS = {
    offsetSheet: (() => {
        const e = document.createElement("style");
        document.head.appendChild(e);
        return e;
    })(),
    updateOffsets(offset) {
        GLOBALS.offsetSheet.innerHTML = `.DropBarGroup { --group-animation-offset: ${offset}px; }`;
    },
};

export default class DropBarGroup extends React.Component {
    static propTypes = {};

    constructor(props) {
        super(props);

        this.state = {
            animationDirection: "raising", // type: "dropping" or "raising"
            animatingElement: null,
        };

        this._groupRef = React.createRef();
        
        this.on = {
            childDrop: (...args) => this.whenChildDrops(...args),
        }
    }

    render() {
        return (
            <div data-testid="drop-bar-group" ref={this._groupRef} className="DropBarGroup">
                {this.wrapChildren()}
            </div>
        );
    }

    componentDidUpdate() {
        if (this.state.animatingElement) {
            // NOTE: crashes when DropBarGroup updates after being created
            //       and never running a dropping animation; only update when
            //       the element is not null to avoid errors
            this.updateAnimationOffsets();
            this.updateAllChildClasses();
        }
    }

    wrapChildren() {
        let children = this._processFragments(this.props.children)
        return React.Children.map(children, (child) => {
            return this._trackIfDropBar(child);
        });
    }

    _processFragments(children) {
        while (typeof children === "object" && children.type === React.Fragment) {
            children = children.props.children
        }
        return children
    }

    _trackIfDropBar(child) {
        if (child.type === DropBar) {
            return React.cloneElement(child, {
                _beforeDrop: this.on.childDrop,
            });
        }
        return child;
    }

    // "dropped" determines animation direction; "barIdx" determines which dropdown bar is tracked
    whenChildDrops(animatingElement, startedDropped) {
        const animationDirection = startedDropped ? "raising" : "dropping";
        this.setState({
            animationDirection,
            animatingElement,
        });
    }

    updateAnimationOffsets() {
        // TODO: (optimization) only run when needed

        const elem = this.state.animatingElement;
        const barHeight = 40;
        const contentAndBottomBarHeight = elem.offsetHeight - barHeight;
        GLOBALS.updateOffsets(contentAndBottomBarHeight);
    }

    // NOTE: the ONLY way to guarantee correct animating is by having access to all DOM elements involved
    updateAllChildClasses() {
        // TODO: (optimization) only run when needed

        const activeDropdown = this.state.animatingElement;
        const direction = this.state.animationDirection;

        const isLastDirection = direction === this._lastAnimationDirection;
        const isLastAnimated = activeDropdown === this._lastAnimatedElement;
        if (isLastDirection && isLastAnimated) {
            return; // only animate for changes
        }
        this._lastAnimationDirection = direction;
        this._lastAnimatedElement = activeDropdown;

        this.updateSiblingAndParentClasses(activeDropdown, direction);
    }

    // NOTE: this function recursively updates animations for
    // siblings and parent(s' siblings... etc) up to the parent <DropBarGroup />
    updateSiblingAndParentClasses(elem, direction) {
        const parent = elem.parentElement;
        const elemIdx = this._getChildIdx(elem);

        for (let idx = 0; idx < parent.children.length; idx++) {
            const child = parent.children[idx];
            // sets previous children (and self) with no animation
            if (idx <= elemIdx) {
                this._setAnimClasses(child, null);
            }
            // sets children after with the animation
            else {
                this._setAnimClasses(child, direction);
            }
        }

        // performs the same operations on the parent until hitting the group
        if (parent !== this._groupRef.current) {
            this.updateSiblingAndParentClasses(parent, direction);
        }
    }

    _getChildIdx(elem) {
        let idx = 0;
        while (elem.previousSibling) {
            idx++;
            elem = elem.previousSibling;
        }
        return idx;
    }

    _setAnimClasses(elem, state) {
        elem.addEventListener(
            "animationend",
            () => {
                // ensures that the same animation can re-run multiple times
                elem.classList.remove("dropping", "raising");
            },
            { once: true }
        );

        switch (state) {
            case "dropping":
                elem.classList.add("DropChild", "dropping");
                elem.classList.remove("raising");
                break;

            case "raising":
                elem.classList.add("DropChild", "raising");
                elem.classList.remove("dropping");
                break;

            default:
                elem.classList.add("DropChild");
                elem.classList.remove("dropping", "raising");
                break;
        }
    }
}
