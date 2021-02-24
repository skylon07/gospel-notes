import React from 'react'
// eslint-disable-next-line no-unused-vars
import PropTypes from 'prop-types'
import './DropBarGroup.css'

import DropBar from './DropBar.js'
export default class DropBarGroup extends React.Component {
    static propTypes = {}

    constructor(props) {
        super(props)

        this.state = {
            animationDirection: "raising", // type: "dropping" or "raising"
            animatingElement: null,
        }

        this._groupRef = React.createRef()
    }

    render() {
        return <div ref={this._groupRef}>
            {this.props.children}
        </div>
    }
}

// eslint-disable-next-line no-unused-vars
class DEBUG_ORIG_DropdownAnimationGroup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            animationDirection: "raising", // type: "dropping" or "raising"
            animatingElement: null,
        }

        this._groupRef = React.createRef()
    }

    render() {
        return <div ref={this._groupRef}>
            {this._wrapChildren()}
        </div>
    }

    componentDidUpdate() {
        // BUG: cannot edit props
        // this._updateAllChildClasses()
    }

    _wrapChildren() {
        // BUG: cannot edit props
        // this._trackDropdownBars(this.props.children)
        return this.props.children
    }

    // NOTE: some children are dynamically generated and dropdown bars wont be available on
    // render; in this case, the component class should provide a truthy static "animateAsDropdownBar"
    // property and utilize needed private props (like _beforeDrop)
    _trackDropdownBars(children) {
        if (!Array.isArray(children)) {
            children = [children]
        }

        for (let idx = 0; idx < children.length; idx++) {
            const child = children[idx]
            if (typeof child === "object" && child !== null) {
                const shouldTrack = child.type === DropBar || child.type.animateAsDropdownBar
                if (shouldTrack) {
                    child.props._beforeDrop = (elem, dropped) => {
                        this._whenChildDrops(elem, dropped)
                    }
                }
                else if (child.props.children) {
                    this._trackDropdownBars(child.props.children)
                }
            }
        }
    }

    // "dropped" determines animation direction; "barIdx" determines which dropdown bar is tracked
    _whenChildDrops(animatingElement, startedDropped) {
        const animationDirection = startedDropped ? "raising" : "dropping"
        this.setState({ animationDirection, animatingElement })
    }

    _getContentOfDropdown(elem) {
        return elem.children[1]
    }

    // NOTE: the ONLY way to guarantee correct animating is by having access to all DOM elements involved
    _updateAllChildClasses() {
        const activeDropdown = this.state.animatingElement
        if (!activeDropdown) {
            return // initialized and not animating yet
        }

        const direction = this.state.animationDirection
        if (direction === this._lastAnimationDirection && activeDropdown === this._lastAnimatedElement) {
            return // only animate for changes
        }
        this._lastAnimationDirection = direction
        this._lastAnimatedElement = activeDropdown

        this._updateSiblingAndParentClasses(activeDropdown, direction)
    }

    _updateSiblingAndParentClasses(elem, direction) {
        const parent = elem.parentElement
        const elemIdx = this._getChildIdx(elem)

        for (let idx = 0; idx < parent.children.length; idx++) {
            const child = parent.children[idx]
            // sets previous children (and self) with no animation
            if (idx <= elemIdx) {
                this._setAnimClasses(child, null)
            }
            // sets children after with the animation
            else {
                this._setAnimClasses(child, direction)
            }
        }

        // performs the same operations on the parent until hitting the group
        if (parent !== this._groupRef.current) {
            this._updateSiblingAndParentClasses(parent, direction)
        }
    }

    _getChildIdx(elem) {
        let idx = 0
        while (elem = elem.previousSibling) {
            idx++
        }
        return idx
    }

    _setAnimClasses(elem, state) {
        elem.addEventListener("animationend", () => {
            // ensures that the same animation can re-run multiple times
            elem.classList.remove("DropdownGroup_dropping", "DropdownGroup_raising")
        }, { once: true })

        switch (state) {
            case "dropping":
                elem.classList.add("DropdownGroup_Child", "DropdownGroup_dropping")
                elem.classList.remove("DropdownGroup_raising")
                break

            case "raising":
                elem.classList.add("DropdownGroup_Child", "DropdownGroup_raising")
                elem.classList.remove("DropdownGroup_dropping")
                break

            default:
                elem.classList.add("DropdownGroup_Child")
                elem.classList.remove("DropdownGroup_dropping", "DropdownGroup_raising")
                break
        }
    }
}