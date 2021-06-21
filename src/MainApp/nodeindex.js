import { SearchIndex } from "lib/search-index";
import { nodeStore } from "noteboard";

export class NodeSearchIndex {
    constructor() {
        this._index = new SearchIndex()
    }
    
    // calls index.setReference() with relevant node data
    updateNode(nodeOrId) {
        const node = this._validateNode(nodeOrId)
        const nodeData = this._getFieldsFrom(node)
        // TODO: don't spread the nodeData when I don't need to use fakeJest.js
        //       (reminder: change the tests too; setReference() is tracked)
        this._index.setReference(node.id, ...nodeData)
    }
    
    // calls index.deleteReference() with relevant node data
    deleteNode(nodeOrId) {
        const node = this._validateNode(nodeOrId)
        this._index.deleteReference(node.id)
    }
    
    // equivelant to index.search(); nothing node-y here!
    search(...args) {
        return this._index.search(...args)
    }
    
    // ensures the passed value represents a node object
    _validateNode(nodeOrId) {
        const node = nodeStore.getNodeById(nodeOrId)
        if (!nodeStore.isNode(node)) {
            throw new TypeError("NodeSearchIndex can only work with valid node objects")
        }
        return node
    }
    
    // returns important node.data values as an array of field information
    _getFieldsFrom(node) {
        const { NoteBox, DropBar } = nodeStore.nodeTypes
        switch (node.type) {
            case NoteBox:
                return this._getFieldsFromNoteBox(node)
        
            case DropBar:
                return this._getFieldsFromDropBar(node)
        
            default:
                throw new Error(`NodeSearchIndex received an invalid node type ${node.type}`)
        }
    }
    
    _getFieldsFromNoteBox(node) {
        const { title, content } = node.data
        return [title, content]
    }
    
    _getFieldsFromDropBar(node) {
        const { title } = node.data
        return [title]
    }
}
export default NodeSearchIndex
