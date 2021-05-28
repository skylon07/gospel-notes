import React, { useState } from "react";
import { useMountedState } from "common/hooks"
import PropTypes from "prop-types";
import "./TopBar.css";

import { SVGIcon } from "common/svg-icon";

import DropMenu from "./DropMenu.js";
import SearchBar from "./SearchBar.js";

// a list of button names to use on the top row, which gives a full button
// name and a shorter variant to use on mobile devices/smaller screens
const MENU_BUTTONS = [
    /* NOTE: These are the buttons to be used in the future...
             They are not being used now since it is not an
             immediately necessary feature.
    { fullName: "Questions", shortName: "Ques" },
    { fullName: "Lessons", shortName: "Less" },
    { fullName: "Discussions", shortName: "Disc" },
    */
];

const MODES = {
    nav: "nav", // navigation buttons are showing
    search: "search", // search bar is showing
}

function TopBar(props) {
    const [mode, setMode] = useState(MODES.nav)
    const mounted = useMountedState()

    const buttons = MENU_BUTTONS.map((button) => button.fullName);

    // the order is weird because the animation bounds need to be "behind" the menu
    return <div data-testid="top-bar" className={getTopBarClass(mounted)}>
        <div className="AnimationBounds">
            <div className={this.getMainClass()}>
                {buttons.map((button, idx) =>
                    this.renderButton(button, idx)
                )}
                <div className="Spacer" />
                <TopBarButton onClick={this.on.searchSlideIn}>
                    <SVGIcon type="magGlass" />
                </TopBarButton>
            </div>
            <div className={this.getSearchClass()}>
                <TopBarButton onClick={this.on.searchSlideOut}>
                    <SVGIcon type="backArrow" />
                </TopBarButton>
                <div className="Spacer" />
                <SearchBar
                    onSearch={this.props.onSearchClick}
                />
            </div>
        </div>
        <DropMenu menuContent={this.props.menuContent} />
    </div>
}
TopBar.propTypes = {
    menuContent: PropTypes.node,
    // TODO: write test (after there are buttons...)
    selectedIdx: PropTypes.number,
    onButtonClick: PropTypes.func,
    onSearchClick: PropTypes.func,
    onSearchActive: PropTypes.func,
    onSearchInactive: PropTypes.func,
}
export default TopBar

function getTopBarClass(mounted) {
    const base = "TopBar"
    const initAnimation = !mounted ? "initAnimation" : "";
    return `${base} ${initAnimation}`
}

export default class TopBar extends React.PureComponent {
    static propTypes = {
        menuContent: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.elementType,
            PropTypes.array,
        ]),

        // TODO: write test (after there are buttons...)
        selectedIdx: PropTypes.number,
        forceMenuHidden: PropTypes.bool,

        onButtonClick: PropTypes.func,
        onSearchClick: PropTypes.func,
        onSearchActive: PropTypes.func,
        onSearchInactive: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            searchActive: false,
            menuHidden: true,
        };

        this.mounted = false;

        this._searchFocusRef = React.createRef();
        this._menuClicked = false;

        this.on = {
            searchSlideIn: () => this.showSearch(),
            searchSlideOut: () => this.hideSearch(),
            menuToggle: () => this.clickedMenuToggle(),
            menuClick: () => this.clickedMenu(),
            buttonClickFor: (content, idx) => {
                // idx/content reversed for user convenience
                return () => this.clickedButton(idx, content)
            },
        }
    }

    static getDerivedStateFromProps(props, state) {
        if (typeof props.forceMenuHidden === "boolean") {
            state.menuHidden = props.forceMenuHidden;
        }
        return state;
    }

    render() {
        // TODO: (optimization) remove map and remember which name to use instead
        const buttons = MENU_BUTTONS.map((button) => button.fullName);

        // the order is weird because the animation bounds need to be "behind" the menu
        return (
            <div data-testid="top-bar" className={this.getClass()}>
                <div className="AnimationBounds">
                    <div className={this.getMainClass()}>
                        {buttons.map((button, idx) =>
                            this.renderButton(button, idx)
                        )}
                        <div className="Spacer" />
                        <TopBarButton onClick={this.on.searchSlideIn}>
                            <SVGIcon type="magGlass" />
                        </TopBarButton>
                    </div>
                    <div className={this.getSearchClass()}>
                        <TopBarButton onClick={this.on.searchSlideOut}>
                            <SVGIcon type="backArrow" />
                        </TopBarButton>
                        <div className="Spacer" />
                        <SearchBar
                            onSearch={this.props.onSearchClick}
                        />
                    </div>
                </div>
                <DropMenu menuContent={this.props.menuContent} />
            </div>
        );
    }

    renderButton(content, idx) {
        const result = (
            <TopBarButton
                selected={idx === this.props.selectedIdx}
                onClick={this.on.buttonClickFor(content, idx)}
            >
                {content}
            </TopBarButton>
        );
        
        return [result, <div className="Spacer" />];
    }
    
    getClass() {
        const base = "TopBar"
        const initAnimation = !this.mounted ? "initAnimation" : "";
        return `${base} ${initAnimation}`
    }

    getMainClass() {
        const base = "Nav";
        const collapsed = this.state.searchActive ? "Collapsed" : "Uncollapsed";
        return `${base} ${collapsed}`;
    }

    getSearchClass() {
        const base = "Search";
        const collapsed = this.state.searchActive ? "Uncollapsed" : "Collapsed";
        return `${base} ${collapsed}`;
    }

    componentDidMount() {
        window.addEventListener(
            "click",
            (this._clickEventListener = () => this.clickedWindow())
        );

        this.mounted = true;
    }

    componentWillUnmount() {
        window.removeEventListener("click", this._clickEventListener);
    }

    clickedButton(idx, content) {
        if (typeof this.props.onButtonClick === "function") {
            this.props.onButtonClick(idx, content);
        }
    }

    clickedMenuToggle() {
        this.setState({ menuHidden: !this.state.menuHidden });
        this._menuClicked = true;
    }
    clickedMenu() {
        this._menuClicked = true;
    }
    clickedWindow() {
        if (!this._menuClicked && !this.state.menuHidden) {
            this.setState({ menuHidden: true });
        }
        this._menuClicked = false;
    }

    showSearch() {
        this.setState({ searchActive: true });
        if (typeof this.props.onSearchActive === "function") {
            this.props.onSearchActive();
        }
    }
    hideSearch() {
        this.setState({ searchActive: false });
        if (typeof this.props.onSearchInactive === "function") {
            this.props.onSearchInactive();
        }
    }
}

class TopBarButton extends React.Component {
    static propTypes = {
        onClick: PropTypes.func,
        selected: PropTypes.bool,
    };

    render() {
        return (
            <button
                data-testid="top-bar-button"
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