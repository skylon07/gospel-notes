import React from 'react'
import PropTypes from 'prop-types'
import './DropMenu.css'

export default class DropMenu extends React.Component {
    static propTypes = {
        hidden: PropTypes.bool.isRequired,
        onClick: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this.state = {
            lastHidden: null,
            animating: false,
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (state.lastHidden === null) {
            state.lastHidden = props.hidden
        }
        else if (state.lastHidden !== props.hidden) {
            state.animating = true
            state.lastHidden = props.hidden
        }
        return state
    }

    render() {
        return <div
            className={`DropMenu ${this.props.hidden ? "hiding" : ''}`}
            style={{ animationDuration: this.state.animating ? null : "0s" }}
            onClick={() => this.props.onClick()}
            onAnimationEnd={() => this.setState({ animating: false })}
        >
            {/* TODO: replace with <Shadow /> */}
            <div className="Shadow" />
            {this.props.children}
        </div>
    }
}