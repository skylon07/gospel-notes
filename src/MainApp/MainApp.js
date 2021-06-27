import React, { useState, useRef, useCallback } from "react"
import PropTypes from "prop-types"
import "./MainApp.css"

import NodeSearchIndex from "./nodeindex.js"

import BetaDisclaimer from "./BetaDisclaimer.js"
import { TopBar } from "navigation"
import { nodeStore, AddButton, NoteBoard } from "noteboard"

const DEV_MODE = process.env.NODE_ENV === "development"

const DISPLAY_MODES = {
    all: "all",
    search: "search",
}

const searchIndex = new NodeSearchIndex()

function MainApp() {
    // TODO: run garbage collection on the nodeStore

    const rootNode = useRootNode()
    // prettier-ignore
    // eslint-disable-next-line no-unused-vars
    const [viewNodes, pushToViewStack, popFromViewStack, clearViewStack] = useViewStack([rootNode.children])
    const [displayMode, setDisplayMode] = useState(DISPLAY_MODES.all)
    const displaySearch = (queryStr) => {
        const query = searchIndex.search(queryStr)
        const resultIds = query.mapResults((id) => id)

        pushToViewStack(resultIds)
        setDisplayMode(DISPLAY_MODES.search)
    }
    const displayAll = () => {
        if (displayMode === DISPLAY_MODES.search) {
            popFromViewStack()
        }
        setDisplayMode(DISPLAY_MODES.all)
    }

    const topBarRef = useRef(null)

    const updateNodeDataInIndex = useCallback((newNode) => {
        searchIndex.updateNode(newNode)
    }, [])
    const addNodeToIndex = useCallback((parentNode, childNode) => {
        searchIndex.updateNode(childNode)
        // assuming children affect a parent node's search score
        searchIndex.updateNode(parentNode)
    }, [])
    const removeNodeFromIndex = useCallback((parentNode, childNode) => {
        searchIndex.deleteNode(childNode)
        // assuming children affect a parent node's search score
        searchIndex.updateNode(parentNode)
    }, [])
    const onAddNode = (newNode) => {
        searchIndex.updateNode(newNode)

        popFromViewStack()
        pushToViewStack(viewNodes.concat(newNode.id))
    }

    return (
        <div data-testid="main-app" className="MainApp">
            <BetaDisclaimer />
            <TopBar
                ref={topBarRef}
                menuContent={renderMenuContent(topBarRef)}
                onSearch={displaySearch}
                onModeChange={(newMode) => {
                    if (newMode === "nav") {
                        displayAll()
                    }
                }}
            />
            <MainWindow>
                <NoteBoard
                    onNodeDataChange={updateNodeDataInIndex}
                    onNodeAddChild={addNodeToIndex}
                    onNodeRemoveChild={removeNodeFromIndex}
                >
                    {viewNodes}
                    {renderAddButton(onAddNode)}
                    <div className="ScrollExtension" />
                </NoteBoard>
            </MainWindow>
        </div>
    )
}
export default MainApp

// returns the root node for the entire notebook
export function useRootNode() {
    // TODO: when nodeStore is an actual database, query and return the actual
    //       node, instead of creating a new one every session (like this)
    const [rootNode] = useState(() => nodeStore.createNode("Dummy"))
    return rootNode
}

export function useViewStack(initStack = []) {
    const [viewStack, setStack] = useState(() => {
        if (DEV_MODE) {
            validateInitStackForUseViewStack(initStack)
        }
        return initStack
    })
    const pushToStack = (nodeIdList) => {
        if (DEV_MODE) {
            validatePushedListForUseViewStack(nodeIdList)
        }
        setStack((viewStack) => {
            return [nodeIdList, ...viewStack]
        })
    }
    const popFromStack = () => {
        setStack((viewStack) => {
            if (viewStack.length === 0) {
                throw new Error(
                    "(Internal MainApp error): Cannot pop from empty node stack!"
                )
            }
            return viewStack.slice(1)
        })
    }
    const clearStack = () => {
        setStack([])
    }

    return [viewStack[0] || null, pushToStack, popFromStack, clearStack]
}
function validateInitStackForUseViewStack(initStack) {
    if (!Array.isArray(initStack)) {
        throw new Error(
            `(Internal MainApp error): The initial view stack must be an array, not '${initStack}'`
        )
    }
    for (let listIdx = 0; listIdx < initStack.length; listIdx++) {
        const list = initStack[listIdx]
        if (!Array.isArray(list)) {
            throw new Error(
                `(Internal MainApp error): The initial view stack must be an array of arrays; got '${list}' at initStack[${listIdx}]`
            )
        }
        for (let nodeIdIdx = 0; nodeIdIdx < list.length; nodeIdIdx++) {
            const nodeId = list[nodeIdIdx]
            if (!nodeStore.isNodeId(nodeId)) {
                throw new Error(
                    `(Internal MainApp error): The initial view stack must only contain valid node ids; got '${nodeId}' at initStack[${listIdx}][${nodeIdIdx}]`
                )
            }
        }
    }
}
function validatePushedListForUseViewStack(nodeIdList) {
    if (!Array.isArray(nodeIdList)) {
        throw new Error()
    }
    for (
        let nodeIdIdx = 0;
        nodeIdIdx < nodeIdList.length;
        nodeIdIdx++
    ) {
        const nodeId = nodeIdList[nodeIdIdx]
        if (!nodeStore.isNodeId(nodeId)) {
            throw new Error(
                `(Internal MainApp error): All lists pushed to the view stack must only contain valid node ids; got '${nodeId}' at listToPush[${nodeIdIdx}]`
            )
        }
    }
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
    return (
        <AddButton key="the (l)on(e)ly add button..." onClick={addNode}>
            Add Node
        </AddButton>
    )
}

function promptNewNode() {
    let type = window.prompt("Enter a type")
    while (type && !nodeStore.nodeTypes[type]) {
        type = window.prompt("Please enter a valid type (NoteBox, DropBar)")
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
    return <div className="MainWindow">{props.children}</div>
}
MainWindow.propTypes = {
    children: PropTypes.node,
}
