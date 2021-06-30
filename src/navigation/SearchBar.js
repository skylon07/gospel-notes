import React, { useRef, useImperativeHandle } from "react"
import PropTypes from "prop-types"
import "./SearchBar.css"

import { SVGIcon } from "common/svg-icon"

const SearchBar = React.forwardRef(function SearchBar(props, ref) {
    const inputRef = useRef(null)
    const select = () => {
        inputRef.current.select()
    }
    const blur = () => {
        inputRef.current.blur()
    }
    const focus = () => {
        inputRef.current.focus()
    }

    useImperativeHandle(ref, () => ({focus, blur, select}))

    const triggerSearch = () => {
        blur()
        if (typeof props.onSearch === "function") {
            const input = inputRef.current
            const text = input.value
            props.onSearch(text)
        }
    }
    const searchOnEnter = (event) => {
        if (event.key === "Enter") {
            event.preventDefault()
            triggerSearch()
        }
    }

    return (
        <div aria-label={props.ariaLabel} role="search" className="SearchBar">
            <input ref={inputRef} onFocus={select} onKeyDown={searchOnEnter} />
            <div className="SearchButton">
                <button onClick={triggerSearch}>
                    <SVGIcon type="magGlass" />
                </button>
            </div>
        </div>
    )
})
SearchBar.propTypes = {
    ariaLabel: PropTypes.string.isRequired,
    onSearch: PropTypes.func,
}
export default SearchBar
