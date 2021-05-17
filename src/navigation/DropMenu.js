import React from "react";
import PropTypes from "prop-types";
import "./DropMenu.css";

export default class DropMenu extends React.Component {
    static propTypes = {
        hidden: PropTypes.bool.isRequired,
        onClick: PropTypes.func,
        ariaLabel: PropTypes.string,
    };

    constructor(props) {
        super(props);

        this.mounted = false;
    }

    render() {
        return (
            <div
                aria-label={this.props.ariaLabel}
                role="menu"
                data-testid="drop-menu"
                className={this.getClass()}
                onClick={() => this.props.onClick()}
            >
                {/* TODO: replace with <Shadow /> */}
                <div className="Shadow" />
                {this.props.children}
            </div>
        );
    }

    getClass() {
        const base = "DropMenu";
        const hidden = this.props.hidden ? "hiding" : "showing";
        const init = !this.mounted ? "initAnimation" : "";
        return `${base} ${hidden} ${init}`;
    }

    componentDidMount() {
        this.mounted = true;
    }
}
