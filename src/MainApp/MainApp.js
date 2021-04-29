import React from "react";
import "./MainApp.css";

import { StorageRegistry } from "lib/storage-registry";

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { nodeStore, AddButton, NoteBoard } from "noteboard";

// DEBUG
const ids = []
const types = ["NoteBox", "DropBar", "NoteBox"]
for (let i = 0; i < 10; i++) {
    const type = types[i % types.length]
    ids.push(nodeStore.createNode(type, null).id)
}

export default class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // TODO: maybe pass hide() when rendering (a function child) instead of using props?
            forceMenuHidden: null,
            // DEBUG
            currentNodeIds: [...ids], // strings
        };

        // NOTE: storage will be a backup in case internet sync is not available
        this.storage = new StorageRegistry("Notes");

        this.on = {
            hideMenu: () => this.hideMenu(),
        }
        
        this._menuContent = <button onClick={this.on.hideMenu}>Close Menu</button>
    }
    render() {
        return (
            <div className="MainApp">
                <BetaDisclaimer />
                <TopBar
                    menuContent={this.renderMenu()}
                />
                <MainWindow>
                    <NoteBoard
                        onNoteBoxChange={() => alert("// TODO: MainApp > NoteBoard.onNoteBoxChange()")}
                    >
                        {this.renderCurrNotes()}
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
        return this.state.currentNodeIds.concat(this.renderAddButton())
    }
    
    renderAddButton() {
        return <AddButton
            key="React gets mad if this doesn't exist"
            onClick={() => alert("// TODO: MainApp > AddButton.onClick()")}
        >
            Add Node
        </AddButton>
    }

    addNoteBar(title) {
        const dateID = new Date().getTime()
        const newBar = { title, dateID }
        this.setState((state) => {
            const newNoteBars = state.noteBars.concat(newBar)
            return { noteBars: newNoteBars }
        })
    }

    setNoteBarTitle(targetIdx, newTitle) {
        this.setState((state) => {
            const newNoteBars = state.noteBars.map((currBar, currIdx) => {
                if (currIdx === targetIdx) {
                    let { title, dateID } = currBar
                    title = newTitle
                    const newBar = { title, dateID }
                    return newBar
                }
                return currBar
            })
            return {noteBars: newNoteBars}
        })
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
