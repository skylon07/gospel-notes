import React from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

import { SVGIcon } from "common/svg-icon";

export default class SearchBar extends React.Component {
    static propTypes = {
        onSearch: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.inputRef = React.createRef();
    }

    render() {
        return (
            <div data-testid="search-bar" className="SearchBar">
                <input
                    ref={this.inputRef}
                    onFocus={() => this.select()}
                    onKeyDown={(event) => this.searchOnEnter(event)}
                />
                <div className="SearchButton">
                    <button onClick={() => this.triggerSearch()}>
                        <SVGIcon type="magGlass" />
                    </button>
                </div>
            </div>
        );
    }

    focus() {
        this.inputRef.current.focus();
    }

    blur() {
        this.inputRef.current.blur();
    }

    select() {
        this.inputRef.current.select();
    }

    searchOnEnter(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.triggerSearch();
        }
    }

    triggerSearch() {
        this.blur();
        if (typeof this.props.onSearch === "function") {
            const elem = this.inputRef.current;
            const text = elem.value;
            this.props.onSearch(text);
        }
    }
}
