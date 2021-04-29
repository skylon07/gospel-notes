import React from 'react'
import PropTypes from 'prop-types'
import "./BoardNode.css"

import { nodeStore } from './datastore.js'

import NoteBox from "./NoteBox.js"
import DropBar from "./DropBar.js"

// a base component that provides a launching point for
// representing note nodes as a UI component
export default class BoardNode extends React.PureComponent {
    static propTypes = {
        nodeId: PropTypes.string.isRequired,
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
        const node = this.node = nodeStore.getNodeById(this.props.nodeId)
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
            onChangeTitle={on.changeTitle}
            onChangeContent={on.changeContent}
        />
    }
    
    renderDropBar() {
        const { title } = this.node.data
        return <DropBar
            title={title}
        />
    }
    
    renderFolder() {
        
    }
    
    triggerOnChange(type, newData) {
        if (typeof this.props.onChange === "function") {
            this.props.onChange(this.node, type, newData)
        }
    }
}