import React from "react"
import PropTypes from "prop-types"
import "./AddButton.css"

import { SVGIcon } from "common/svg-icons"

function AddButton(props) {
    return (
        <button
            aria-label={props.ariaLabel}
            role="button"
            className="AddButton"
            onClick={props.onClick}
        >
            <SVGIcon type="plus" />
            {props.children}
            <div className="Spacer" />
        </button>
    )
}
AddButton.propTypes = {
    children: PropTypes.node,
    ariaLabel: PropTypes.string.isRequired,
    onClick: PropTypes.func,
}
export default AddButton
