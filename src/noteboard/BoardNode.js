import React from 'react'
import PropTypes from 'prop-types'

import { nodeStore } from './datastore.js'

import NoteBox from "./NoteBox.js"

// a base component that provides a launching point for
// representing note nodes as a UI component
export default class BoardNode extends React.Component {
    static propTypes = {
        nodeId: PropTypes.string,
    }

    constructor(props) {
        super(props)

        this.on = {
            NoteBox: {
                changeTitle: (...args) => this.trigger(this.props.onNoteBoxChangeTitle, ...args),
                changeContent: (...args) => this.trigger(this.props.onNoteBoxChangeContent, ...args),
            },
            DropBar: {
                changeTitle: (...args) => this.trigger(this.props.onDropBarChangeTitle, ...args),
            },
            Folder: {
                changeTitle: (...args) => this.trigger(this.props.onFolderChangeTitle, ...args),
            },
            addChild: () => alert('// TODO: BoardNode().on.addChild()'),
            removeChild: () => alert('// TODO: BoardNode().on.removeChild()'),
        }
    }

    render() {
        return <div className="BoardNode">
            {this.renderThisNode()}
        </div>
    }
    
    renderThisNode() {
        const node = nodeStore.getNodeById(this.props.nodeId)
        if (!node) {
            return <h1>INVALID NODE ID</h1>
        }
        
        switch (node.type) {
            case types.NoteBox: {
                return this.renderNoteBox(node)
            }
            break
            
            case types.DropBar: {
                return this.renderDropBar(node)
            }
            break
            
            case types.Folder: {
                return this.renderFolder(node)
            }
            break
            
            default: {
                return <h1>INVALID NODE TYPE</h1>
            }
        }
    }
    
    // abstracted node rendering functions, given the NodeParent they represent
    renderNoteBox(node) {
        const { title, content } = node.data
        const on = this.on.NoteBox
        return <NoteBox
            initTitle={title}
            initContent={content}
            onChangeTitle={on.changeTitle}
            onChangeContent={on.changeContent}
        />
    }
    
    renderDropBar(node) {
        
    }
    
    renderFolder(node) {
        
    }
}