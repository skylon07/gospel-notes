import React from 'react'
import PropTypes from 'prop-types'
import './AddButton.css'

import { SVGIcon } from "common/svg-icon"

export default class AddButton extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        onClick: PropTypes.func,
    }

    render() {
        return <button
            className="AddButton"
            onClick={this.props.onClick}
        >
            <SVGIcon type="plus" />
            {this.props.children}
            <div className="Spacer" />
        </button>
    }
}
