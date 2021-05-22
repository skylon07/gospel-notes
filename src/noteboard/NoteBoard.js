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
        onAddChild: PropTypes.func,
        onRemoveChild: PropTypes.func,
        onChangeData: PropTypes.func,
    }
    
    constructor(props) {
        super(props)
        
        this.on = {
            changeNode: (...args) => this.onChangeNode(...args),
        }
    }
    
    render() {
        return <div data-testid="note-board" className="NoteBoard">
            {this.renderNodes(this.props.children || [])}
        </div>
    }
    
    renderNodes(array) {
        if (!Array.isArray(array)) {
            throw new TypeError("NoteBoards must be given an array to render!")
        }
        
        return array.map((child) => {
            if (nodeStore.isNodeId(child) || nodeStore.isNode(child)) {
                const id = typeof child === "string" ? child : child.id
                return <BoardNode
                    key={id}
                    node={child}
                    canAddChildren={this.canAddToDropBars()}
                    canChangeData={this.canChangeData()}
                    onChange={this.on.changeNode}
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
    
    onChangeNode(node, changeType, newData) {
        switch (changeType) {
            case "children-add":
                const addedNode = newData
                this.trigger(this.props.onAddChild, addedNode, node)
                break
        
            case "children-remove":
                const removedNode = newData
                this.trigger(this.props.onRemoveChild, removedNode, node)
                break
        
            default:
                this.trigger(this.props.onChangeData, node, changeType, newData)
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
            func.apply(null, args)
        }
    }
}
