import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

import { SVGIcon } from "common/svg-icon";

function SearchBar(props) {
    const inputRef = useRef(null)
    const select = () => {
        inputRef.current.select()
    }
    const blur = () => {
        inputRef.current.blur()
    }
    
    useEffect(() => {
        if (props.forceFocus) {
            inputRef.current.focus()
        }
    })
    
    const triggerSearch = () => {
        blur()
        if (typeof props.onSearch === "function") {
            const input = inputRef.current;
            const text = input.value;
            props.onSearch(text);
        }
    }
    const searchOnEnter = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            triggerSearch();
        }
    }
    
    return <div data-testid="search-bar" className="SearchBar">
        <input
            ref={inputRef}
            onFocus={select}
            onKeyDown={searchOnEnter}
        />
        <div className="SearchButton">
            <button onClick={triggerSearch}>
                <SVGIcon type="magGlass" />
            </button>
        </div>
    </div>
}
SearchBar.propTypes = {
    onSearch: PropTypes.func,
    forceFocus: PropTypes.bool,
}
export default SearchBar
