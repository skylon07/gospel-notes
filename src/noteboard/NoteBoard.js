import React from 'react'
import PropTypes from 'prop-types'
import "./NoteBoard.css"

import { nodeStore } from "./datastore.js"

import BoardNode from "./BoardNode.js"

export default class NoteBoard extends React.Component {
    static propTypes = {
        children: PropTypes.array,
        canAddToDropBars: PropTypes.bool,
        canChangeData: PropTypes.bool,
        onNoteBoxChange: PropTypes.func,
        onDropBarChange: PropTypes.func,
    }
    
    constructor(props) {
        super(props)
        
        this.on = {
            nodeChange: (...args) => this.onNodeChange(...args),
        }
    }
    
    render() {
        return <div data-testid="note-board" className="NoteBoard">
            {this.renderNodes(this.props.children)}
        </div>
    }
    
    renderNodes(array) {
        if (!Array.isArray(array)) {
            return "note board must be given an array"
        }
        
        return array.map((child) => {
            if (nodeStore.isNodeId(child) || nodeStore.isNode(child)) {
                const id = typeof child === "string" ? child : child.id
                return <BoardNode
                    key={id}
                    node={child}
                    canAddChildren={this.canAddToDropBars()}
                    canChangeData={this.canChangeData()}
                    onChange={this.on.nodeChange}
                />
            } else if (Array.isArray(child)) {
                return this.renderNodes(child)
            }
            return child
        })
    }
    
    canAddToDropBars() {
        if (typeof this.props.canAddToDropBars === "boolean") {
            return this.props.canAddToDropBars
        }
        return true
    }
    
    canChangeData() {
        if (typeof this.props.canChangeData === "boolean") {
            return this.props.canChangeData
        }
        return true
    }
    
    onNodeChange(node, dataType, newData) {
        this.validateNode(node)
        
        const types = nodeStore.nodeTypes
        switch (node.type) {
            case types.NoteBox: {
                this.trigger(this.props.onNoteBoxChange, dataType, newData)
            }
            break
            
            case types.DropBar: {
                this.trigger(this.props.onDropBarChange, dataType, newData)
            }
            break
            
            case types.Folder: {
                
            }
            break
            
            default: {
                throw new TypeError(`Invalid node type requested in NoteBoard.onNodeChange()`)
            }
            break
        }
    }
    
    validateNode(obj) {
        if (!nodeStore.isNode(obj)) {
            throw new TypeError(`NoteBoards cannot process non-node objects (${obj})`)
        }
    }
    
    // used as a generic wrapper for prop functions (in case they don't exist)
    trigger(func, ...args) {
        if (typeof func === "function") {
            func.call(null, ...args)
        }
    }
}
