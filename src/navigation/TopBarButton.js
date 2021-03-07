import React from "react";
import PropTypes from "prop-types";
import "./TopBarButton.css";

export default class TopBarButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        selected: PropTypes.bool,
        ariaLabel: PropTypes.string,
    };

    render() {
        return (
            <button
                aria-label={this.props.ariaLabel}
                className={`TopBarButton ${
                    this.props.selected ? "selected" : ""
                }`}
                onClick={() => this.props.onClick()}
            >
                {this.props.children}
            </button>
        );
    }
}
