import React from "react";
import "./MainApp.css";

import { StorageRegistry } from "lib/storage-registry";

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { DropBar, NoteBox, DropBarGroup } from "noteboard";

class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            forceMenuHidden: null,
        };

        // NOTE: storage will be a backup in case internet sync is not available
        this.storage = new StorageRegistry("Notes");
    }
    render() {
        return (
            <MainWindow>
                <BetaDisclaimer />
                <TopBar
                    menuContent={this.renderMenu()}
                    forceMenuHidden={this.state.forceMenuHidden}
                />
                <div className="PageViewer">
                    <DropBarGroup>
                        <DropBar
                            title="first test dropbar"
                            iconType="plus"
                            onMouseHold={() => alert("// TODO: rename...")}
                        >
                            <NoteBox
                                title="Test Note 1"
                                content="this is some text testing the use of the content prop"
                            />
                        </DropBar>
                        <div>MILLENIA!</div>
                        <DropBar
                            title="second test dropbar"
                            iconType="backArrow"
                            onMouseHold={() => alert("// TODO: rename...")}
                        >
                            <NoteBox title="Test Note 2">
                                This is some test text using the children
                                attribute
                            </NoteBox>
                        </DropBar>
                        <div>MILLENIA!</div>
                    </DropBarGroup>
                </div>
            </MainWindow>
        );
    }

    renderMenu() {
        return <button onClick={() => this.hideMenu()}>Close Menu</button>;
    }

    hideMenu() {
        this.setState({ forceMenuHidden: true }, () => {
            this.setState({ forceMenuHidden: null });
        });
    }
}

// a container that holds any settings/data pertaining to the window
class MainWindow extends React.Component {
    render() {
        return <div className="MainWindow">{this.props.children}</div>;
    }
}

export default MainApp;
