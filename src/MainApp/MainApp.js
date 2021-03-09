import React from "react";
import "./MainApp.css";

import { StaticTextNode } from "common/text-fit";
import { SVGIcon } from "common/svg-icon";
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
                            <div
                                style={{
                                    backgroundColor: "darkgrey",
                                    whiteSpace: "pre",
                                }}
                            >
                                {`// DEBUG\n\
                                Test\n\
                                Test\n\
                                Test\n\
                                Test\n\
                                Test`.replace(/\t/gi, "")}
                            </div>
                        </DropBar>
                        <div>MILLENIA!</div>
                        <DropBar
                            title="second test dropbar"
                            iconType="backArrow"
                            onMouseHold={() => alert("// TODO: rename...")}
                        >
                            <div
                                style={{
                                    backgroundColor: "darkgrey",
                                    whiteSpace: "pre",
                                }}
                            >
                                {`// DEBUG\n\
                                Test\n\
                                Test\n\
                                Test\n\
                                Test\n\
                                Test`.replace(/\t/gi, "")}
                            </div>
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
