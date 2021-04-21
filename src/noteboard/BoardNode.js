import React from 'react'
import PropTypes from 'prop-types'

import { nodeStore } from './datastore.js'

// a base component that provides a launching point for
// representing note nodes as a UI component
export default class BoardNode extends React.Component {
    static propTypes = {
        children: PropTypes.func,
        nodeId: PropTypes.string,
    }

    constructor(props) {
        super(props)

        this.state = {
            childNodes: [], // nodeIds of nodes with this as the direct parent
        }

        this.on = {
            changeData: (...args) => this.changeData(...args),
            addChild: () => this.addChild(),
            removeChild: () => this.removeChild(),
        }
    }

    render() {
        return <div className="BoardNode">
            {this.renderNode()}
        </div>
    }
    
    renderNode() {
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

    renderChildren() {
        const types = nodeStore.nodeTypes
        return this.state.childNodes.map((nodeId) => {
            const node = nodeStore.getNodeById(nodeId)
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
            }
        })
    }
    
    renderNoteBox(node) {
        
    }
    
    renderDropBar(node) {
        
    }
    
    renderFolder(node) {
        
    }

    // adds a child, optionally before a certain node (given by their id)
    addChild(beforeNodeId = null) {
        alert("// TODO: add node children")
    }

    // removes a child from (or ensures a node is not a child of) this node
    removeChild(nodeId) {
        alert("// TODO: remove node children")
    }
}