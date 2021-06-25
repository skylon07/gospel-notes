import React from "react"
import PropTypes from "prop-types"
import "./AddButton.css"

import { SVGIcon } from "common/svg-icon"

function AddButton(props) {
    return (
        <button
            data-testid="add-button"
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
    onClick: PropTypes.func,
}
export default AddButton
