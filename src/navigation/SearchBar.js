import React from 'react'
import PropTypes from 'prop-types'
import './SearchBar.css'

import { SVGIcon } from 'lib/svg-icon'

export default class SearchBar extends React.Component {
    static propTypes = {
        onSearchClick: PropTypes.func,
    }

    constructor(props) {
        super(props)

        this._inputRef = React.createRef()
    }

    render() {
        return <div className="SearchBar">
            <input
                ref={this._inputRef}
                onFocus={() => this.select()}
                onKeyDown={(event) => this.searchOnEnter(event)}
            />
            <div className="SearchButton">
                <button onClick={() => this.triggerSearchClick()}>
                    <SVGIcon type="magGlass" />
                </button>
            </div>
        </div>
    }

    focus() {
        this._inputRef.current.focus()
    }

    blur() {
        this._inputRef.current.blur()
    }

    select() {
        this._inputRef.current.select()
    }

    searchOnEnter(event) {
        if (event.key === "Enter") {
            event.preventDefault()
            this.triggerSearchClick()
        }
    }

    triggerSearchClick() {
        this.blur()
        if (typeof this.props.onSearchClick === "function") {
            const elem = this._inputRef.current
            const text = elem.value
            this.props.onSearchClick(text)
        }
    }
}