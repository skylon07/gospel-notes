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
// representing note nodes as a UI component
export default class BoardNode extends React.PureComponent {
    static propTypes = {
        node: PropTypes.oneOfType([CustomTypes.node, CustomTypes.nodeId]).isRequired,
        canAddChildren: PropTypes.bool,
        canChangeData: PropTypes.bool,
        onChange: PropTypes.func,
    }

    constructor(props) {
        super(props)
        
        this.on = {
            NoteBox: {
                changeTitle: (newTitle) => this.triggerOnChange("title", newTitle),
                changeContent: (newContent) => this.triggerOnChange("content", newContent),
            },
            DropBar: {
                changeTitle: (newTitle) => this.triggerOnChange("title", newTitle),
                changeIcon: (newIcon) => this.triggerOnChange("icon", newIcon)
            },
            Folder: {
                changeTitle: (newTitle) => this.triggerOnChange("title", newTitle),
            },
            addChild: () => alert('// TODO: BoardNode().on.addChild()'),
            removeChild: () => alert('// TODO: BoardNode().on.removeChild()'),
        }
        
        this.node = null // updated every render
    }

    render() {
        return <div data-testid="board-node" className="BoardNode">
            {this.renderThisNode()}
        </div>
    }
    
    renderThisNode() {
        const node = nodeStore.isNode(this.props.node) ? 
            this.props.node : nodeStore.getNodeById(this.props.node)
        this.node = node
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
        const on = this.on.NoteBox
        return <NoteBox
            initTitle={title}
            initContent={content}
            canChange={this.props.canChangeData}
            onChangeTitle={on.changeTitle}
            onChangeContent={on.changeContent}
        />
    }
    
    renderDropBar() {
        const { title } = this.node.data
        let children = this.node.mapChildren((child) => {
            return <BoardNode key={child.id} node={child} />
        })
        if (this.props.canAddChildren) {
            children.push((
                <AddButton key="add button" onClick={this.on.addChild}>
                    Add Note
                </AddButton>
            ))
        }
        return <DropBar
            initTitle={title}
            initIcon="blank"
            canChange={this.props.canChangeData}
            onChangeTitle={this.on.DropBar.changeTitle}
            onChangeIcon={this.on.DropBar.changeIcon}
        >
            {children}
        </DropBar>
    }
    
    renderFolder() {
        
    }
    
    triggerOnChange(changeType, newData) {
        if (typeof this.props.onChange === "function") {
            this.props.onChange(this.node, changeType, newData)
        }
    }
}