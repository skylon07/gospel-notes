import React from "react";
import "./MainApp.css";

import { SearchIndex } from "lib/search-index";

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { nodeStore, AddButton, NoteBoard } from "noteboard";

const DISPLAY_MODES = {
    all: "all",
    search: "search",
}
export default class MainApp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // TODO: maybe pass hide() when rendering (a function child) instead of using props?
            forceMenuHidden: null,
            currentNodeIds: [], // array of strings
            nodeStack: [], // array of [ids]
            displayMode: DISPLAY_MODES.all,
        };

        this.index = new SearchIndex()

        this.on = {
            hideMenu: () => this.hideMenu(),
            addNode: () => {
                const newNode = this.promptNewNode()
                if (newNode) {
                    this.updateNodeOnIndex(newNode)
                    this.appendNodeToPage(newNode.id)
                }
            },
            change: {
                node: {
                    data: (...args) => this.onChangeNodeData(...args),
                    children: (...args) => this.onChangeNodeChildren(...args),
                },
            },
            search: (...args) => {
                if (this.state.displayMode !== DISPLAY_MODES.search) {
                    this.pushNodesToStack()
                }
                this.displaySearch(...args)
            },
            searchBack: () => {
                if (this.state.displayMode === DISPLAY_MODES.search) {
                    this.popNodesFromStack()
                    this.displayAll()
                }
            }
        }
        
        this._menuContent = <button onClick={this.on.hideMenu}>Close Menu</button>
    }
    
    render() {
        // TODO: render shadow at the top of the MainWindow (maybe make a new
        //       <ShadowBorder />, and use in DropBarContent and TopBar menu?)
        return (
            <div data-testid="main-app" className="MainApp">
                <BetaDisclaimer />
                <TopBar
                    menuContent={this._menuContent}
                    forceMenuHidden={this.state.forceMenuHidden}
                    onSearchClick={this.on.search}
                    onSearchInactive={this.on.searchBack}
                />
                <MainWindow>
                    <NoteBoard
                        onChangeData={this.on.change.node.data}
                        onChangeChildren={this.on.change.node.children}
                    >
                        {this.renderCurrNotes()}
                        {this.renderAddButton()}
                        <div className="ScrollExtension" />
                    </NoteBoard>
                </MainWindow>
            </div>
        );
    }

    renderCurrNotes() {
        return this.state.currentNodeIds
    }
    
    renderAddButton() {
        // BUG: when adding during a search, the node is not rendered in "display all"
        return <AddButton
            key="the (l)on(e)ly add button..."
            onClick={this.on.addNode}
        >
            Add Node
        </AddButton>
    }

    hideMenu() {
        this.setState({ forceMenuHidden: true }, () => {
            this.setState({ forceMenuHidden: null });
        });
    }
    
    // TODO: make a custom prompt that is easier to use and looks better
    //       (can probably rip stuff out of ./origGospelNotes)
    promptNewNode() {
        let type = window.prompt("Enter a type")
        while (type && !nodeStore.nodeTypes[type]) {
            type = window.prompt('Please enter a valid type ("NoteBox", "DropBar")')
        }
        if (!type) {
            return null // cancelled
        }
        
        const newNode = nodeStore.createNode(type, {
            title: "New Title",
            content: "This is the content",
        })
        return newNode
    }
    
    appendNodeToPage(nodeOrId) {
        let nodeId = nodeOrId
        if (nodeStore.isNode(nodeOrId)) {
            nodeId = nodeOrId.id
        }
        
        this.setState((state) => {
            const newIds = state.currentNodeIds.concat(nodeId)
            return { currentNodeIds: newIds }
        })
    }
    
    pushNodesToStack() {
        this.setState((state) => {
            const idsToPush = [state.currentNodeIds]
            const newStack = state.nodeStack.concat(idsToPush)
            const newIds = []
            return { currentNodeIds: newIds, nodeStack: newStack }
        })
    }
    
    popNodesFromStack() {
        this.setState((state) => {
            if (state.nodeStack.length === 0) {
                throw new Error("MainApp tried to pop from the node stack when it was empty!")
            }
            
            const newEnd = state.nodeStack.length - 1
            const newStack = state.nodeStack.slice(0, newEnd)
            const newIds = state.nodeStack[newEnd]
            return { currentNodeIds: newIds, nodeStack: newStack }
        })
    }
    
    onChangeNodeData(node) {
        this.updateNodeOnIndex(node)
    }
    
    updateNodeOnIndex(node) {
        const { NoteBox, DropBar } = nodeStore.nodeTypes
        switch (node.type) {
            case NoteBox: {
                this.updateNoteBoxOnIndex(node)
            }
            break
        
            case DropBar: {
                this.updateDropBarOnIndex(node)
            }
            break
            
            default: {
                throw new Error(`Cannot update index: Invalid node type ${node.type}`)
            }
        }
    }
    
    updateNoteBoxOnIndex(node) {
        const ref = node.id
        const { title, content } = node.data
        this.index.setReference(ref, title, content)
    }
    
    updateDropBarOnIndex(node) {
        const ref = node.id
        const { title } = node.data
        this.index.setReference(ref, title)
    }
    
    onChangeNodeChildren(node, changeType, nodeChild) {
        switch (changeType) {
            case "children-add":
                this.addNodeToIndex(nodeChild, node)
                break
            
            case "children-remove":
                this.removeNodeFromIndex(nodeChild, node)
                break
            
            default:
                throw new Error(`Cannot update index: invalid children change type ${changeType}`)
        }
    }
    
    addNodeToIndex(node, parent) {
        this.updateNodeOnIndex(node)
    }
    
    removeNodeFromIndex(node, parent) {
        this.index.deleteReference(node.id)
    }
    
    displayAll() {
        const newMode = DISPLAY_MODES.all
        this.setState({ displayMode: newMode })
    }
    
    displaySearch(queryStr) {
        const query = this.index.search(queryStr)
        const resultIds = query.mapResults((id) => id)
        const newMode = DISPLAY_MODES.search
        this.setState({ currentNodeIds: resultIds, displayMode: newMode })
    }
}

// a container that holds any settings/data pertaining to the window
class MainWindow extends React.Component {
    render() {
        return <div className="MainWindow">{this.props.children}</div>;
    }
}
