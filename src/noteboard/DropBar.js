import React from 'react'
import PropTypes from 'prop-types'
import './DropBar.css'

import { SVGIcon } from 'lib/svg-icon'

import Holdable from './Holdable.js'

const GLOBALS = {
    offsetSheet: (() => {
        const e = document.createElement('style')
        document.head.appendChild(e)
        return e
    })(),
    updateOffsets(offset) {
        GLOBALS.offsetSheet.innerHTML = `.DropBar { --bottom-bar-shift: ${offset}px; }`
    },
}

export default class DropBar extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        iconType: PropTypes.string,
        onMouseHold: PropTypes.func,
        _beforeDrop: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this.state = {
            dropped: false,
            barAnimating: false,
        }

        this._ref = React.createRef()
        this._contentElem = null // set on mount
        this._holdIsTouch = false
    }

    render() {
        return <div ref={this._ref} className="DropBar">
            <Holdable onHold={() => this.triggerOnMouseHold()}>
                <div
                    className="Bar"
                    onMouseUp={() => this._allowTriggerDrop()}
                >
                    <div className="IconDiv">
                        <SVGIcon type={this.props.iconType || "blank"} />
                    </div>
                    {this.props.title}
                    <div className="Spacer" />
                    <DropdownButton onClick={() => this.triggerDrop()} dropped={this.state.dropped} />
                </div>
            </Holdable>
            <DropBarContent dropped={this.state.dropped}>
                {this.props.children}
            </DropBarContent>
            <div
                className={`BottomBar ${this.state.dropped ? "shifted" : ''}`}
                style={{
                    animationDuration: this.state.barAnimating ? null : "0s",
                    height: this.state.dropped || this.state.barAnimating ? null : "0px",
                }}
                onAnimationEnd={(event) => this.setState({ barAnimating: false })}
            />
        </div>
    }

    componentDidMount() {
        this._findContentElem()
    }

    // TODO: is this the best/safest way to accomplish this...?
    _findContentElem() {
        let elem = this._ref.current.children[0]
        while (!elem.classList.contains('DropBarContent')) {
            elem = elem.nextSibling
        }
        this._contentElem = elem
    }

    triggerOnMouseHold() {
        if (typeof this.props.onMouseHold === "function") {
            this.props.onMouseHold()
        }
        // ignore the possible drop after releasing
        this._ignoreTriggerDrop = true
    }

    _allowTriggerDrop() {
        // timeout allows any child click events to propogate first
        setTimeout(() => this._ignoreTriggerDrop = false, 10)
    }

    triggerDrop() {
        if (!this._ignoreTriggerDrop) {
            this.toggleDrop()
        }
    }

    toggleDrop() {
        this.setState((state, props) => {
            this._prepareAnimationOffset()
            return { dropped: !state.dropped, barAnimating: true }
        })
        if (typeof this.props._beforeDrop === "function") {
            // being outside the above setState() allows React to batch/sync animation group setState() calls
            this.props._beforeDrop(this._ref.current, this.state.dropped)
        }
    }

    _prepareAnimationOffset() {
        const currHeight = this._contentElem.offsetHeight
        GLOBALS.updateOffsets(currHeight)
    }
}

// the arrow that triggers the dropdown
class DropdownButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        dropped: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            animating: null, // type: true/false after mounting
            lastDropped: null,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (state.lastDropped === null) {
            state.lastDropped = props.dropped
        }
        else if (props.dropped !== state.lastDropped) {
            state.animating = true
            state.lastDropped = props.dropped
        }
        return state
    }

    render() {
        const left = 10
        const mid = 20
        const right = 30
        const top = 14
        const btm = 25

        // lines must go past the "point" of the arrow (by 1/2 the stroke width)
        // using pyth-theo, we get it down to this math:
        // offset = (((w / 2) ** 2) / 2) ** (1 / 2)
        // (condensed a bit)
        // offset = w * 2 ** (1 / 2) / 4
        const offset = 1.0606601717 // for w = 3px
        return <svg
            className={`DropdownButton ${this.props.dropped ? "dropped" : ""}`}
            style={{
                animationDuration: this.state.animating ? null : "0s"
            }}
            viewBox="0 0 40 40"
            onClick={this.props.onClick}
            onAnimationEnd={(event) => this.setState({ animating: false })}
        >
            <line x1={left} y1={btm} x2={mid + offset} y2={top + offset} />
            <line x1={right} y1={btm} x2={mid - offset} y2={top + offset} />
        </svg>
    }
}

// a wrapper for the content inside the drop bar
class DropBarContent extends React.Component {
    static propTypes = {
        dropped: PropTypes.bool.isRequired,
    }

    constructor(props) {
        super(props)

        this.state = {
            lastDropped: null,
            animating: false,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (state.lastDropped === null) {
            state.lastDropped = props.dropped
        }
        else if (state.lastDropped !== props.dropped) {
            state.animating = true
            state.lastDropped = props.dropped
        }
    }

    render() {
        return <div
            className={`DropBarContent ${this.props.dropped ? "dropped" : ''}`}
            style={this._makeStyle()}
            onAnimationEnd={() => this.setState({ animating: false })}
        >
            <div className="Container">
                {this.props.children}
            </div>
            <div className="TopGradient" />
            <div className="BottomGradient" />
        </div>
    }

    _makeStyle() {
        const style = {
            animationDuration: this.state.animating ? null : "0s",
        }

        if (!this.props.dropped && !this.state.animating) {
            style.position = "absolute" // removes from document flow
            style.opacity = 0 // hides element from view
            style.pointerEvents = "none" // disables interacting with element
        }

        return style
    }
}