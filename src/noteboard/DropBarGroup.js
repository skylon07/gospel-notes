import React from 'react'
// eslint-disable-next-line no-unused-vars
import PropTypes from 'prop-types'
import './DropBarGroup.css'

import DropBar from './DropBar.js'

const GLOBALS = {
    offsetSheet: (() => {
        const e = document.createElement('style')
        document.head.appendChild(e)
        return e
    })(),
    updateOffsets(offset) {
        GLOBALS.offsetSheet.innerHTML = `.DropBarGroup { --group-animation-offset: ${offset}px; }`
    },
}

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
        return <div ref={this._groupRef} className="DropBarGroup">
            {this.wrapChildren()}
        </div>
    }

    componentDidUpdate() {
        this.updateAnimationOffsets()
        this.updateAllChildClasses()
    }

    wrapChildren() {
        return React.Children.map(this.props.children, (child) => {
            return this._trackIfDropBar(child)
        })
    }

    _trackIfDropBar(child) {
        if (child.type === DropBar) {
            return React.cloneElement(child, {
                _beforeDrop: (elem, dropped) => {
                    this.whenChildDrops(elem, dropped)
                },
            })
        }
        return child
    }

    // "dropped" determines animation direction; "barIdx" determines which dropdown bar is tracked
    whenChildDrops(animatingElement, startedDropped) {
        const animationDirection = startedDropped ? "raising" : "dropping"
        this.setState({ animationDirection, animatingElement })
    }

    updateAnimationOffsets() {
        const elem = this.state.animatingElement
        const barHeight = 40
        const contentAndBottomBarHeight = elem.offsetHeight - barHeight
        GLOBALS.updateOffsets(contentAndBottomBarHeight)
    }

    // NOTE: the ONLY way to guarantee correct animating is by having access to all DOM elements involved
    updateAllChildClasses() {
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

        this.updateSiblingAndParentClasses(activeDropdown, direction)
    }

    // NOTE: this function recursively updates animations for
    // siblings and parent(s' siblings... etc) up to the parent <DropBarGroup />
    updateSiblingAndParentClasses(elem, direction) {
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
            this.updateSiblingAndParentClasses(parent, direction)
        }
    }

    _getChildIdx(elem) {
        let idx = 0
        while (elem.previousSibling) {
            idx++
            elem = elem.previousSibling
        }
        return idx
    }

    _setAnimClasses(elem, state) {
        elem.addEventListener("animationend", () => {
            // ensures that the same animation can re-run multiple times
            elem.classList.remove("dropping", "raising")
        }, { once: true })

        switch (state) {
            case "dropping":
                elem.classList.add("DropChild", "dropping")
                elem.classList.remove("raising")
                break

            case "raising":
                elem.classList.add("DropChild", "raising")
                elem.classList.remove("dropping")
                break

            default:
                elem.classList.add("DropChild")
                elem.classList.remove("dropping", "raising")
                break
        }
    }
}