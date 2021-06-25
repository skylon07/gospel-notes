import React, { useRef, useCallback, useEffect, useContext } from "react"
import { useForceUpdate } from "common/hooks"
import PropTypes from "prop-types"
import "./BoardNode.css"

import nodeStore from "./datastore.js"
import NodePropTypes from "./datastore-proptypes.js"

import { NoteBoardCallbacks } from "./NoteBoard.js"
import NoteBox from "./NoteBox.js"
import DropBar from "./DropBar.js"
import BoardNodeGroup from "./BoardNodeGroup.js"
import AddButton from "./AddButton.js"

const DEV_MODE = process.env.NODE_ENV === "development"

// a base component that provides a launching point for
// representing/modifying note nodes as a UI component
const BoardNode = React.memo(function BoardNode(props) {
    // ensures this BoardNode returns the same type of specific board node
    // across renders
    const node = useSameNode(props.node)

    // TODO: make prop-enabled ability to grow on mount (when they are dynamically added)
    return (
        <div data-testid="board-node" className="BoardNode">
            {renderNode(props, node)}
        </div>
    )
})
BoardNode.propTypes = {
    node: NodePropTypes.nodeOrId,
    readOnly: PropTypes.bool,
}
BoardNode.defaultProps = {
    readOnly: false,
}
export default BoardNode

// this hook warns when the node reference has changed
export function useSameNode(nodeOrId, componentName = "(no name given)") {
    // this hook ensures "node" will either be a NodeParent or null
    const node = nodeStore.getNodeById(nodeOrId)
    const orig = useRef({ node, nodeOrId }).current
    const warned = useRef(false)

    if (DEV_MODE) {
        if (orig.node !== node && !warned.current) {
            console.warn(
                `${componentName} was given a new node reference to render; this is unsupported and the original reference will be used`
            )
            warned.current = true // warn only once
        } else if (!node && orig.nodeOrId !== nodeOrId && !warned.current) {
            console.warn(
                `${componentName} was given a different nonexistant node/nodeId to render; although this is not an error, node references should not change, and this is likely a bug`
            )
            warned.current = true // warn only once
        }
    }

    return orig.node
}

export function useNodeUpdate(node, type, callback) {
    useEffect(() => {
        if (node) {
            const subscription = node.subscribe(callback, type)
            return () => subscription.unsubscribe()
        }
    }, [node, type, callback])
}

function renderNode(props, node) {
    if (!nodeStore.isNode(node)) {
        return <h1>INVALID NODE ID</h1>
    }

    const types = nodeStore.nodeTypes
    switch (node.type) {
        case types.NoteBox:
            return <NoteBoxNode node={node} readOnly={props.readOnly} />

        case types.DropBar:
            return <DropBarNode node={node} readOnly={props.readOnly} />

        case types.Folder:
            return <FolderNode />

        default:
            return <h1>INVALID NODE TYPE</h1>
    }
}

function trigger(func, ...args) {
    if (typeof func === "function") {
        func(...args)
    }
}

// these specific board nodes have the job of syncing node data with their
// corrisponding elements, in both directions (ie elements change nodes, and
// node subscriptions update elements)

// DON'T FORGET that any time a node change function is called (setData,
// addChild, etc), their corresponding listener should be called
function NoteBoxNode(props) {
    const noteBoxRef = useRef(null)
    const ignoreNoteBoxRef = useRef(false)
    const callbacks = useContext(NoteBoardCallbacks)

    const node = props.node
    const { title, content } = node.data
    const onUpdate = useCallback(() => {
        const { title, content } = node.data
        const noteBox = noteBoxRef.current

        ignoreNoteBoxRef.current = true
        noteBox.setTitle(title)
        noteBox.setContent(content)
        ignoreNoteBoxRef.current = false
    }, [node])
    useNodeUpdate(node, "data", onUpdate)

    const changeNodeTitle = (newTitle) => {
        if (!ignoreNoteBoxRef.current) {
            node.setData({ title: newTitle })
            trigger(callbacks.onNodeDataChange, node, "title", newTitle)
            removeIfEmptyNoteBox(node, callbacks.onNodeChildrenChange)
        }
    }
    const changeNodeContent = (newContent) => {
        if (!ignoreNoteBoxRef.current) {
            node.setData({ content: newContent })
            trigger(callbacks.onNodeDataChange, node, "content", newContent)
            removeIfEmptyNoteBox(node, callbacks.onNodeChildrenChange)
        }
    }

    return (
        <NoteBox
            ref={noteBoxRef}
            initTitle={title}
            initContent={content}
            readOnly={props.readOnly}
            onTitleChange={changeNodeTitle}
            onContentChange={changeNodeContent}
        />
    )
}
NoteBoxNode.propTypes = {
    node: NodePropTypes.node.isRequired,
    readOnly: PropTypes.bool.isRequired,
}

// called when the user deletes a NoteBox's data
function removeIfEmptyNoteBox(node, onRemove) {
    const { title, content } = node.data
    if (node.type === "NoteBox" && title === "" && content === "") {
        removeEmptyNode(node, onRemove)
    }
}

// this function assumes that deleting one BoardNode deletes the node and,
// therefore, all BoardNodes tied to that node
function removeEmptyNode(node, onRemove) {
    const parents = node.removeFromParents()
    for (const parent of parents) {
        trigger(onRemove, parent)
    }
}

function DropBarNode(props) {
    const forceUpdate = useForceUpdate()
    const callbacks = useContext(NoteBoardCallbacks)

    const node = props.node
    const { title, iconType } = node.data
    useNodeUpdate(node, "data", forceUpdate)

    const addNoteBox = () => {
        const initData = {
            title: "New Note",
            content: "This is the note content",
        }
        const newNode = nodeStore.createNode("NoteBox", initData)
        node.addChild(newNode)
        trigger(callbacks.onNodeChildrenChange, node)
    }
    let possibleAddButton = null
    if (!props.readOnly) {
        possibleAddButton = (
            <AddButton key="add button" onClick={addNoteBox}>
                Add Note
            </AddButton>
        )
    }

    const promptChangeTitle = () => {
        if (props.readOnly) {
            return
        }

        const newTitle = window.prompt(
            `Enter a new title for '${title}'`,
            title
        )
        if (typeof newTitle !== "string") {
            return
        }

        node.setData({ title: newTitle })
        trigger(callbacks.onNodeDataChange, node, "title", newTitle)
        removeIfEmptyDropBar(node, callbacks.onNodeChildrenChange)
    }
    const promptChangeIconType = () => {
        if (props.readOnly) {
            return
        }

        const newIconType = window.prompt(
            `Enter a new icon for '${title}'`,
            iconType
        )
        if (typeof newIconType !== "string") {
            return
        }

        node.setData({ iconType: newIconType })
        trigger(callbacks.onNodeDataChange, node, "iconType", newIconType)
    }

    return (
        <DropBar
            title={title}
            iconType={iconType}
            onTitleHold={promptChangeTitle}
            onIconHold={promptChangeIconType}
        >
            <BoardNodeGroup node={node} readOnly={props.readOnly} />
            {possibleAddButton}
        </DropBar>
    )
}
DropBarNode.propTypes = {
    node: NodePropTypes.node.isRequired,
    readOnly: PropTypes.bool.isRequired,
}

// called when the user deletes a DropBar's data
function removeIfEmptyDropBar(node, onNodeRemoveChild) {
    if (node.type === "DropBar" && node.data.title === "") {
        const parents = node.removeFromParents()
        for (const parent of parents) {
            trigger(onNodeRemoveChild, parent, node)
        }
    }
}

function FolderNode() {
    return <h1>Folder BoardNode not implemented yet</h1>
}
