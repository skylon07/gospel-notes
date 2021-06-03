import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useForceUpdate } from "common/hooks"
import PropTypes from 'prop-types'
import "./BoardNode.css"

import { nodeStore } from './datastore.js'

import NoteBox from "./NoteBox.js"
import DropBar from "./DropBar.js"
import AddButton from "./AddButton.js"

const CustomTypes = {
    node(props, propName, componentName) {
        const node = props[propName]
        if (!nodeStore.isNode(node)) {
            const nodeAsStr = typeof node === "symbol" ? "(symbol)" : node + ""
            return new Error(`Invalid prop '${propName}' supplied to ${componentName}; expected a valid node, got '${nodeAsStr}'`)
        }
    },
    nodeId(props, propName, componentName) {
        const nodeId = props[propName]
        if (!nodeStore.isNodeId(nodeId)) {
            const nodeIdAsStr = typeof nodeId=== "symbol" ? "(symbol)" : nodeId + ""
            return new Error(`Invalid prop '${propName}' supplied to ${componentName}; expected a valid nodeId, got '${nodeIdAsStr}'`)
        }
    }
}

// this hook warns when the node reference has changed
function useSameNode(nodeOrId) {
    const node = nodeStore.getNodeById(nodeOrId)
    const origNode = useRef(node)
    const warned = useRef(false)
    
    if (origNode.current !== node && !warned.current) {
        console.warn("BoardNode rendered with a new node reference; this is unsupported and the original reference will be used")
        warned.current = true
    }
    
    return origNode.current
}

// a base component that provides a launching point for
// representing/modifying note nodes as a UI component
function BoardNode(props) {
    const node = useSameNode(props.node)
    const forceUpdate = useForceUpdate()
    
    useEffect(() => {
        if (node) {
            node.subscribe(forceUpdate)
            return () => node.unsubscribe(forceUpdate)
        }
    }, []) // node doesn't change; omitted from deps
    
    const triggerOnChange = (node, changeType, changeData) => {
        if (typeof props.onChange === "function") {
            props.onChange(node, changeType, changeData)
        }
    }
    
    // TODO: a lot of these callbacks assume there are only DropBars holding
    //       NoteBoxes; please reexamine these when implementing folders
    const addChild = (childNode) => {
        const newNode = nodeStore.createNode("NoteBox", {
            title: "New Note",
            content: "This is the note content",
        })
        node.addChild(newNode)
        return newNode
    }
    const addChildWithTrigger = () => {
        const newNode = addChild()
        triggerOnChange(node, "children-add", newNode)
    }
    const removeChild = (childNodeOrId) => {
        const childNode = node.removeChild(childNodeOrId)
        return childNode
    }
    const removeChildWithTrigger = (childNodeOrId) => {
        const childNode = removeChild(childNodeOrId)
        triggerOnChange(node, "children-remove", childNode)
    }
    const removeIfEmptyNoteBox = (childNode) => {
        const { title, content } = childNode.data
        const isEmpty = !title && !content
        if (isEmpty) {
            removeChildWithTrigger(childNode)
        }
    }
    
    const changeNode = (changeType, newData) => {
        node.setData({ [changeType]: newData })
        triggerOnChange(node, changeType, newData)
    }
    const onChildChange = (childNode, changeType, newData) => {
        triggerOnChange(childNode, changeType, newData)
        removeIfEmptyNoteBox(childNode)
    }
    
    const state = {
        node, changeNode, onChildChange,
        addChild: addChildWithTrigger,
    }
    // TODO: make prop-enabled ability to grow on mount (when they are dynamically added)
    return <div data-testid="board-node" className="BoardNode">
        {renderNode(props, state)}
    </div>
}
BoardNode.propTypes = {
    children: PropTypes.node,
    node: PropTypes.oneOfType([CustomTypes.node, CustomTypes.nodeId]).isRequired,
    canAddChildren: PropTypes.bool,
    canChangeData: PropTypes.bool,
    onChange: PropTypes.func,
}
export default BoardNode

function renderNode(props, state) {
    if (!nodeStore.isNode(state.node)) {
        return <h1>INVALID NODE ID</h1>
    }
    
    const types = nodeStore.nodeTypes
    switch (state.node.type) {
        case types.NoteBox:
            return renderNoteBox(props, state)
        
        case types.DropBar:
            return renderDropBar(props, state)
        
        case types.Folder:
            return renderFolder(props, state)
        
        default:
            return <h1>INVALID NODE TYPE</h1>
    }
}

// abstracted node rendering functions, given the NodeParent they represent
function renderNoteBox(props, state) {
    const { title, content } = state.node.data
    
    const changeNodeTitle = (newTitle) => {
        state.changeNode("title", newTitle)
    }
    const changeNodeContent = (newContent) => {
        state.changeNode("content", newContent)
    }
    
    return <NoteBox
        forceTitle={title}
        forceContent={content}
        canChange={props.canChangeData}
        onTitleChange={changeNodeTitle}
        onContentChange={changeNodeContent}
    />
}

function renderDropBar(props, state) {
    const { title, iconType } = state.node.data
    
    const dropBarChildren = state.node.mapChildren((node) => {
        return <BoardNode
            key={node.id}
            node={node}
            canAddChildren={props.canAddChildren}
            canChangeData={props.canChangeData}
            onChange={state.onChangeChild}
        />
    })
    
    let possibleAddButton = null
    if (props.canAddChildren) {
        possibleAddButton = <AddButton key="add button" onClick={state.addChild}>
            Add Note
        </AddButton>
    }
    
    const changeNodeTitle = (newTitle) => {
        state.changeNode("title", newTitle)
    }
    const changeNodeIconType = (newIconType) => {
        state.changeNode("iconType", newIconType)
    }
    
    return <DropBar
        forceTitle={title}
        forceIconType={iconType}
        canChange={props.canChangeData}
        onTitleChange={changeNodeTitle}
        onIconChange={changeNodeIconType}
    >
        {dropBarChildren}
        {possibleAddButton}
    </DropBar>
}

function renderFolder() {
    return null
}
