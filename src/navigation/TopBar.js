import React from "react";
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

export default class TopBar extends React.Component {
    static propTypes = {
        menuContent: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.elementType,
            PropTypes.array,
        ]),

        // TODO: write test
        selectedIdx: PropTypes.number,
        forceMenuHidden: PropTypes.bool,

        // TODO: write tests for below
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
            <div data-testid="top-bar" className="TopBar">
                <div className="AnimationBounds">
                    <div className={this.getMainClass()}>
                        {buttons.map((button, idx) =>
                            this.renderButton(button, idx)
                        )}
                        <div className="Spacer" />
                        <TopBarButton onClick={() => this.showSearch()}>
                            <SVGIcon type="magGlass" />
                        </TopBarButton>
                    </div>
                    <div className={this.getSearchClass()}>
                        <TopBarButton onClick={() => this.hideSearch()}>
                            <SVGIcon type="backArrow" />
                        </TopBarButton>
                        {/* TODO: replace with <spacer /> */}
                        <div className="Spacer" />
                        <SearchBar
                            ref={this._searchFocusRef}
                            onSearchClick={this.props.onSearchClick}
                        />
                    </div>
                </div>
                <TopBarButton onClick={() => this.clickedMenuToggle()}>
                    <SVGIcon type="bars" />
                </TopBarButton>
                <DropMenu
                    hidden={this.state.menuHidden}
                    onClick={() => this.clickedMenu()}
                >
                    {this.props.menuContent}
                </DropMenu>
            </div>
        );
    }

    renderButton(content, idx) {
        const result = (
            <TopBarButton
                selected={idx === this.props.selectedIdx}
                onClick={() => this.clickedButton(idx, content)}
            >
                {content}
            </TopBarButton>
        );

        // TODO: replace <div className="Spacer" /> with <spacer />
        return [result, <div className="Spacer" />];
    }

    getMainClass() {
        const base = "Main";
        const collapsed = this.state.searchActive ? "Collapsed" : "Uncollapsed";
        const initAnimation = !this.mounted ? "initAnimation" : "";
        return `${base} ${collapsed} ${initAnimation}`;
    }

    getSearchClass() {
        const base = "Search";
        const collapsed = !this.state.searchActive
            ? "Collapsed"
            : "Uncollapsed";
        const initAnimation = !this.mounted ? "initAnimation" : "";
        return `${base} ${collapsed} ${initAnimation}`;
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

    clickedButton(idx) {
        if (typeof this.props.onButtonClick === "function") {
            this.props.onButtonClick(idx);
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
        // allows animation to play first
        setTimeout(() => {
            if (typeof this.props.onSearchActive === "function") {
                this.props.onSearchActive();
            }
        });
    }
    hideSearch() {
        this.setState({ searchActive: false });
        // allows animation to play first
        setTimeout(() => {
            if (typeof this.props.onSearchInactive === "function") {
                this.props.onSearchInactive();
            }
        });
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
