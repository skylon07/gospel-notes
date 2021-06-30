import React, { useState, useRef, useImperativeHandle } from "react"
import { useClassName } from "common/hooks"
import PropTypes from "prop-types"
import "./TopBar.css"

import { SVGIcon } from "common/svg-icon"

import DropMenu from "./DropMenu.js"
import SearchBar from "./SearchBar.js"

const MODES = {
    nav: "nav", // navigation buttons are showing
    search: "search", // search bar is showing
}

const TopBar = React.forwardRef(function (props, ref) {
    const [mode, setMode] = useState(MODES.nav)
    const changeMode = (newMode) => {
        setMode(newMode)
        if (typeof props.onModeChange === "function") {
            props.onModeChange(newMode)
        }
    }
    const navMode = () => changeMode("nav")
    const searchMode = () => changeMode("search")

    const navClassName = useClassName({
        base: "Nav",
        noMountingAnimation: true,
        choices: [
            {
                values: { nav: "Uncollapsed", search: "Collapsed" },
                useKey: mode,
            },
        ],
    })
    const searchClassName = useClassName({
        base: "Search",
        noMountingAnimation: true,
        choices: [
            {
                values: { nav: "Collapsed", search: "Uncollapsed" },
                useKey: mode,
            },
        ],
    })

    const menuRef = useRef(null)
    useImperativeHandle(ref, () => {
        const { hide: hideMenu } = menuRef.current
        return { hideMenu }
    })

    const buttons = props.navButtons.map((buttonData) => {
        // TODO: render buttons with short names when the screen can't fit the
        //       full names
        const selected = buttonData.key === props.selectedNavButton
        const currentlyDisplayed = selected ? ", currently displayed" : ""
        const ariaLabel = `notebook ${buttonData.fullName}${currentlyDisplayed}`
        const button = (
            <TopBarButton
                key={buttonData.key}
                ariaLabel={ariaLabel}
                selected={selected}
                onClick={buttonData.onClick}
            >
                {buttonData.fullName}
            </TopBarButton>
        )

        const spacer = (
            <div key={`${buttonData.key}-Spacer`} className="Spacer" />
        )

        return [button, spacer]
    })

    // the order is weird because the animation bounds need to be "behind" the menu
    return (
        <div aria-label="notebook" role="navigation" className="TopBar">
            <div className="AnimationBounds">
                <div className={navClassName}>
                    {buttons}
                    <div className="Spacer" />
                    <TopBarButton
                        ariaLabel="display search bar"
                        onClick={searchMode}
                    >
                        <SVGIcon type="magGlass" />
                    </TopBarButton>
                </div>
                <div className={searchClassName}>
                    <TopBarButton
                        ariaLabel="display notebooks"
                        onClick={navMode}
                    >
                        <SVGIcon type="backArrow" />
                    </TopBarButton>
                    <div className="Spacer" />
                    <SearchBar
                        // since it is assumed TopBar is only created once, a
                        // static label is passed
                        ariaLabel="main search bar"
                        onSearch={props.onSearch}
                    />
                </div>
            </div>
            <DropMenu ref={menuRef}>{props.menuContent}</DropMenu>
        </div>
    )
})
TopBar.propTypes = {
    menuContent: PropTypes.node,
    // TODO: write test (after there are buttons...)
    navButtons: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.any.isRequired,
            fullName: PropTypes.string,
            shortName: PropTypes.string,
            onClick: PropTypes.func,
        })
    ),
    selectedNavButton: PropTypes.number,
    onSearch: PropTypes.func,
    onModeChange: PropTypes.func,
}
TopBar.defaultProps = {
    navButtons: [],
}
export default TopBar

function TopBarButton(props) {
    const className = useClassName({
        base: "TopBarButton",
        filters: [
            {
                value: "selected",
                useIf: props.selected,
            },
        ],
    })

    return (
        <button
            aria-label={props.ariaLabel}
            role="option"
            className={className}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
}
TopBarButton.propTypes = {
    children: PropTypes.node,
    ariaLabel: PropTypes.string.isRequired,
    selected: PropTypes.bool,
    onClick: PropTypes.func,
}
TopBarButton.defaultProps = {
    selected: false,
}
