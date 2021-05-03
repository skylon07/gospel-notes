import React from "react";
import "./MainApp.css";

import { StorageRegistry } from "lib/storage-registry";

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { nodeStore, AddButton, NoteBoard } from "noteboard";

// DEBUG
const ids = []
const types = ["NoteBox", "DropBar", "NoteBox"]
let i = 0
let interval = null

export default class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // TODO: maybe pass hide() when rendering (a function child) instead of using props?
            forceMenuHidden: null,
            // DEBUG: ids
            currentNodeIds: [...ids], // strings
        };

        // NOTE: storage will be a backup in case internet sync is not available
        this.storage = new StorageRegistry("Notes");

        this.on = {
            hideMenu: () => this.hideMenu(),
        }
        
        this._menuContent = <button onClick={this.on.hideMenu}>Close Menu</button>
        
        interval = () => {
            if (i >= 15) {
                return
            }
            const type = types[i++ % types.length]
            ids.push(nodeStore.createNode(type, null).id)
            if (type === "DropBar") {
                const node = nodeStore.getNodeById(ids[ids.length - 1])
                for (let j = 0; j < i - 3; j++) {
                    node.addChild(nodeStore.createNode("NoteBox", {title: "note " + j}))
                }
            }
            this.setState({currentNodeIds: ids}, () => setTimeout(() => {
                interval()
            }, 400))
        }
    }
    
    render() {
        return (
            <div className="MainApp">
                <BetaDisclaimer />
                <TopBar
                    menuContent={this.renderMenu()}
                    forceMenuHidden={this.state.forceMenuHidden}
                />
                <MainWindow>
                    <NoteBoard
                        canModifyData={false}
                        onNoteBoxChange={() => alert("// TODO: MainApp > NoteBoard.onNoteBoxChange()")}
                    >
                        {this.renderCurrNotes()}
                        {this.renderAddButton()}
                        <div className="ScrollExtension" />
                    </NoteBoard>
                </MainWindow>
            </div>
        );
    }

    renderMenu() {
        // NOTE: the menu stays the same to allow
        //       TopBar to work as a Pure Component
        return this._menuContent;
    }

    renderCurrNotes() {
        return this.state.currentNodeIds
    }
    
    renderAddButton() {
        return <AddButton
            key="the (l)on(e)ly add button..."
            onClick={() => alert("// TODO: MainApp > AddButton.onClick()")}
        >
            Add Node
        </AddButton>
    }
    
    componentDidMount() {
        setTimeout(interval, 700)
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
