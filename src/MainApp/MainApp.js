import React, { useState, useRef } from "react";
import "./MainApp.css";

import NodeSearchIndex from "./nodeindex.js";

import BetaDisclaimer from "./BetaDisclaimer.js";
import { TopBar } from "navigation";
import { nodeStore, AddButton, NoteBoard } from "noteboard";

const DISPLAY_MODES = {
    all: "all",
    search: "search",
}

const searchIndex = new NodeSearchIndex()

function MainApp() {
    const [nodeStack, pushToNodeStack, popFromNodeStack] = useNodeStack()
    const currNodeIds = nodeStack[0] || []
    const [displayMode, setDisplayMode] = useState(DISPLAY_MODES.all)
    const topBarRef = useRef(null)
    
    const updateNodeInIndex = (newNode, parentNode) => {
        searchIndex.updateNode(newNode)
    }
    const removeNodeFromIndex = (removedNode, parentNode) => {
        searchIndex.deleteNode(removedNode)
    }
    
    const displayAll = () => {
        if (displayMode === DISPLAY_MODES.search) {
            popFromNodeStack()
        }
        setDisplayMode(DISPLAY_MODES.all)
    }
    const displaySearch = (queryStr) => {
        const query = searchIndex.search(queryStr)
        const resultIds = query.mapResults((id) => id)
        
        if (displayMode === DISPLAY_MODES.search) {
            popFromNodeStack()
        }
        pushToNodeStack(resultIds)
        setDisplayMode(DISPLAY_MODES.search)
    }
    
    const onAddNode = (newNode) => {
        searchIndex.updateNode(newNode)
        
        popFromNodeStack()
        pushToNodeStack(currNodeIds.concat(newNode.id))
    }
    
    return <div data-testid="main-app" className="MainApp">
        <BetaDisclaimer /> 
        <TopBar
            ref={topBarRef}
            menuContent={renderMenuContent(topBarRef)}
            onSearchClick={displaySearch}
            onModeChange={(newMode) => {
                if (newMode === "nav") {
                    displayAll()
                }
            }}
        />
        <MainWindow>
            <NoteBoard
                onChangeData={updateNodeInIndex}
                onAddChild={updateNodeInIndex}
                onRemoveChild={removeNodeFromIndex}
            >
                {currNodeIds}
                {renderAddButton(onAddNode)}
                <div className="ScrollExtension" />
            </NoteBoard>
        </MainWindow>
    </div>
}
export default MainApp

// a hook that stores a stack of lists of nodes in state
export function useNodeStack(initNodes=[]) {
    // YES, we want a 2D array in state; "[initNodes]" is correct
    const [nodeStack, setNodeStack] = useState([initNodes])
    
    const pushNodesToStack = (nodeIds) => {
        setNodeStack((nodeStack) => {
            return [nodeIds, ...nodeStack]
        })
    }
    
    const popNodesFromStack = () => {
        setNodeStack((nodeStack) => {
            if (nodeStack.length === 0) {
                throw new Error("MainApp: Cannot pop from empty node stack!")
            }
            return nodeStack.slice(1)
        })
    }
    
    return [nodeStack, pushNodesToStack, popNodesFromStack]
}



function renderMenuContent(topBarRef) {
    const hideMenu = () => topBarRef.current.hideMenu()
    return <button onClick={hideMenu}>Close Menu</button>
}

function renderAddButton(onAddNode) {
    // BUG: when adding during a search, the node is not rendered in "display all"
    const addNode = () => {
        const newNode = promptNewNode()
        if (newNode) {
            onAddNode(newNode)
        }
    }
    return <AddButton
        key="the (l)on(e)ly add button..."
        onClick={addNode}
    >
        Add Node
    </AddButton>
}

function promptNewNode() {
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

// a container that holds any settings/data pertaining to the window
function MainWindow(props) {
    return <div className="MainWindow">{props.children}</div>;
}
