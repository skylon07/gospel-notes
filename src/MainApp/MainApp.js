import React from "react";
import "./MainApp.css";

import { StorageRegistry } from "lib/storage-registry";

import { SVGIcon } from "common/svg-icon"

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { DropBar, NoteBox, DropBarGroup } from "noteboard";

class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            forceMenuHidden: null,
            notes: [], // {title, body, dateID}
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
                        { this.renderNotes() }
                        <button className="AddNoteButton">
                            <SVGIcon type="plus" />
                            Add Note
                        </button>
                    </DropBarGroup>
                </div>
            </MainWindow>
        );
    }

    renderMenu() {
        return <button onClick={() => this.hideMenu()}>Close Menu</button>;
    }
    
    renderNotes() {
        return this.state.notes.map(({title, note, dateID}) => {
            return <DropBar
                key={dateID}
                title={title}
                iconType="blank"
                onMouseHold={() => alert("// TODO: rename...")}
            >
                <NoteBox title="" content={note} />
            </DropBar>
        })
    }
    
    componentDidMount() {
        setTimeout(() => this.addNote("title", "test note string"), 7000)
    }
    
    addNote(title, note) {
        const dateID = new Date().getTime()
        const newNote = {title, note, dateID}
        this.setState((state) => {
            const notes = state.notes.concat(newNote)
            return {notes}
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
