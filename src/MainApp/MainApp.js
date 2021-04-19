import React from "react";
import "./MainApp.css";

import { StorageRegistry } from "lib/storage-registry";

import { SVGIcon } from "common/svg-icon"

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { DropBar, NoteBox, DropBarGroup, AddButton } from "noteboard";

class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            forceMenuHidden: null,
            // TODO: come up with a better name for these...
            noteBars: [], // {title, dateID}
        };

        // NOTE: storage will be a backup in case internet sync is not available
        this.storage = new StorageRegistry("Notes");

        this.on = {
            hideMenu: () => this.hideMenu(),
            dropBar: {
                mouseHold: () => alert("// TODO: rename drop bar")
            },
            addNoteBar: () => this.addNoteBar("New Bar"),
        }
        
        this._menuContent = <button onClick={this.on.hideMenu}>Close Menu</button>
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
                        { this.renderNotes() }
                        <AddButton onClick={this.on.addNoteBar}>
                            Add NoteBar
                        </AddButton>
                    </DropBarGroup>
                </div>
            </MainWindow>
        );
    }

    renderMenu() {
        // NOTE: the menu stays the same to allow
        //       TopBar to work as a Pure Component
        return this._menuContent;
    }

    renderNotes() {
        return this.state.noteBars.map(({ title, dateID }) => {
            return <DropBar
                key={dateID}
                title={title}
                iconType="blank"
                canModify={true}
                onMouseHold={this.on.dropBar.mouseHold}
            />
        })
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
            const newNotebars = state.noteBars.map((currBar, currIdx) => {
                if (currIdx === targetIdx) {
                    let { title, dateID } = currBar
                    title = newTitle
                    const newBar = { title, dateID }
                    return newBar
                }
                return currBar
            })
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

export default MainApp;