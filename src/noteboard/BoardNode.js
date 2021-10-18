import React, { useRef, useCallback, useEffect, useContext } from "react"
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
    return <div className="BoardNode">{renderNode(props, node)}</div>
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

// callbacks passed to this function should ONLY update the DOM with the new
// data; DO NOT execute NoteBoard callbacks or modify any other data inside
// these callbacks
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

        case types.Dummy:
            // prettier-ignore
            return (
                <div className="Dummy">
                    Dummy Node: {node.data.data}
                    ({node.children.length} children)
                </div>
            )

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

        // TODO: we can get rid of the ignore ref; setTitle/Content() accepts
        //       a second "silent" argument that prevents calling the listeners
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
        }
    }
    const changeNodeContent = (newContent) => {
        if (!ignoreNoteBoxRef.current) {
            node.setData({ content: newContent })
            trigger(callbacks.onNodeDataChange, node, "content", newContent)
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

function DropBarNode(props) {
    // FIXME: useForceUpdate() was removed, and this line probably
    //        means this component need a refactor...
    const forceUpdate = () => {}
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
        trigger(callbacks.onNodeAddChild, node, newNode)
    }
    let possibleAddButton = null
    if (!props.readOnly) {
        // CHECKME: is this correct aria label usage?
        const addButtonLabel = `add note to header ${title}`
        possibleAddButton = (
            <AddButton key="add button" ariaLabel={addButtonLabel} onClick={addNoteBox}>
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

function FolderNode() {
    return <h1>Folder BoardNode not implemented yet</h1>
}
