import React from 'react'
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

// a base component that provides a launching point for
// representing/modifying note nodes as a UI component
export default class BoardNode extends React.Component {
    static propTypes = {
        // update-ignored
        node: PropTypes.oneOfType([CustomTypes.node, CustomTypes.nodeId]).isRequired,
        
        // update-honored
        canAddChildren: PropTypes.bool,
        canChangeData: PropTypes.bool,
        onChange: PropTypes.func,
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        return nextProps.canAddChildren !== this.props.canAddChildren ||
            nextProps.canChangeData !== this.props.canChangeData ||
            nextProps.onChange !== this.props.onChange
    }

    constructor(props) {
        super(props)
        
        const node = nodeStore.isNode(props.node) ?
            props.node : nodeStore.getNodeById(props.node)
        this.node = node
        this._loggedNodeChanged = false
        
        this.on = {
            changeNode: () => this.forceUpdate(),
            NoteBox: {
                changeTitle: (newTitle) => this.onChangeSelf("title", newTitle),
                changeContent: (newContent) => this.onChangeSelf("content", newContent),
            },
            DropBar: {
                changeTitle: (newTitle) => this.onChangeSelf("title", newTitle),
                changeIcon: (newIcon) => this.onChangeSelf("iconType", newIcon),
            },
            Folder: {
                changeTitle: (newTitle) => this.onChangeSelf("title", newTitle),
            },
            addChild: () => this.addChildWithTrigger(),
            changeChild: (...args) => this.onChangeChild(...args),
        }
    }

    render() {
        // TODO: make prop-enabled ability to grow on mount (when they are dynamically added)
        return <div data-testid="board-node" className="BoardNode">
            {this.renderThisNode()}
        </div>
    }
    
    componentDidMount() {
        if (this.node) {
            this.node.subscribe(this.on.changeNode)
        }
    }
    
    componentDidUpdate() {
        this._warnOnNodeChange()
    }
    
    componentWillUnmount() {
        if (this.node) {
            this.node.unsubscribe(this.on.changeNode)
        }
    }
    
    renderThisNode() {
        const node = this.node
        if (!node || typeof node !== "object") {
            return <h1>INVALID NODE ID</h1>
        }
        
        const types = nodeStore.nodeTypes
        switch (node.type) {
            case types.NoteBox: {
                return this.renderNoteBox()
            }
            break
            
            case types.DropBar: {
                return this.renderDropBar()
            }
            break
            
            case types.Folder: {
                return this.renderFolder()
            }
            break
            
            default: {
                return <h1>INVALID NODE TYPE</h1>
            }
        }
    }
    
    // abstracted node rendering functions, given the NodeParent they represent
    renderNoteBox() {
        const { title, content } = this.node.data
        return <NoteBox
            forceTitle={title}
            forceContent={content}
            canChange={this.props.canChangeData}
            onChangeTitle={this.on.NoteBox.changeTitle}
            onChangeContent={this.on.NoteBox.changeContent}
        />
    }
    
    renderDropBar() {
        const { title, iconType } = this.node.data
        const children = this.node.mapChildren((node) => {
            return <BoardNode
                key={node.id}
                node={node}
                canAddChildren={this.props.canAddChildren}
                canChangeData={this.props.canChangeData}
                onChange={this.on.changeChild}
            />
        })
        if (this.props.canAddChildren) {
            children.push((
                <AddButton key="add button" onClick={this.on.addChild}>
                    Add Note
                </AddButton>
            ))
        }
        
        return <DropBar
            forceTitle={title}
            forceIconType={iconType}
            canChange={this.props.canChangeData}
            onChangeTitle={this.on.DropBar.changeTitle}
            onChangeIcon={this.on.DropBar.changeIcon}
        >
            {children}
        </DropBar>
    }
    
    renderFolder() {
        
    }
    
    // change this.node and trigger props.onChange()
    onChangeSelf(changeType, newData) {
        this.node.setData({ [changeType]: newData })
        this.triggerOnChange(this.node, changeType, newData)
    }
    
    // handle when a child node changes and trigger props.onChange()
    onChangeChild(childNode, changeType, newData) {
        this._removeIfEmptyNoteBox(childNode)
        this.triggerOnChange(childNode, changeType, newData)
    }
    
    // simply calls onChange() if it exists
    triggerOnChange(node, changeType, newData) {
        if (typeof this.props.onChange === "function") {
            this.props.onChange(node, changeType, newData)
        }
    }
    
    // adds a new node child to this.node and state
    addChild() {
        const newNode = nodeStore.createNode("NoteBox", {
            title: "New Note",
            content: "This is the note content",
        })
        this.node.addChild(newNode)
        return newNode
    }
    
    addChildWithTrigger() {
        const newNode = this.addChild()
        this.triggerOnChange(this.node, "children-add", newNode)
    }
    
    // removes a node child from this.node and state
    removeChild(child) {
        const node = this.node.removeChild(child)
        return node
    }
    
    removeChildWithTrigger(childNode) {
        this.removeChild(childNode)
        this.triggerOnChange(this.node, "children-remove", childNode)
    }
    
    _removeIfEmptyNoteBox(childNode) {
        const { title, content } = childNode.data
        const isEmpty = !title && !content
        if (isEmpty) {
            this.removeChildWithTrigger(childNode)
        }
    }
    
    _warnOnNodeChange() {
        if (this.node && this.node !== this.props.node && this.node.id !== this.props.node) {
            try {
                console.warn("BoardNode node props cannot be updated across renders")
            } catch (error) {
                // guess you won't know...
            }
        }
    }
}