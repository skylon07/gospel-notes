// represents the database for all notes
class NodeStoreSingleton {
    constructor() {
        this._notesById = {}
    }
    
    get nodeTypes() {
        return NodeParent.types
    }
    
    createNode(type, data=null) {
        const id = this._createId()
        const node = new NodeParent(type, id, data)
        this._nodesById[id] = node
        return node
    }
    
    getNodeById(nodeId) {
        return this._nodesById[nodeId] || null
    }
    
    isNode(val) {
        return val instanceof NodeParent
    }
    
    isNodeId(str) {
        const tag = "NODE"
        return typeof str === "string" && str.substr(0, tag.length) === tag
    }
    
    // creates a string indentifier that is unique between
    // all other note board elements (for this user, at least)
    _createId() {
        // pretty much unique...
        const time = new Date().getTime()
        // unique so long as you aren't running on a massive supercomputer...
        const specificTime = performance.now()
        // for that one person that one time where their computers
        // decided to use two of the same times anyway... ("one in a million")
        const randNumJustInCase = Math.floor(Math.random() * 1000000)
        let fullId = `NODE${time}-${specificTime}-${randNumJustInCase}`
    
        // okay... let's guarantee this id is unique
        if (nodesById[fullId]) {
            fullId = this._createIdFor(node)
        }
        
        return fullId
    }
}
export const nodeStore = new NodeStoreSingleton()

// represents a set of data accessible by the database by a unique ID
class NodeParent {
    // populated after class definition
    static types = {}
    static reverseTypes = {}
    
    constructor(type, id, data) {
        if (!NodeParent.reverseTypes[type]) {
            throw new TypeError(`Invalid NodeParent type (${typeof type}) received; Please use one of NodeStore.nodeTypes`)
        }
        
        this._type = type
        this._id = id
        this._children = []
        this.data = data
    }
    
    get type() {
        return this._type
    }
    // NOTE: this exists solely for debugging purposes
    get typeStr() {
        return NodeParent.reverseTypes[this._type]
    }
    
    get nodeId() {
        return this._id
    }
    
    getChild(idx) {
        return this._children[idx]
    }
    
    get numChildren() {
        return this._children.length
    }
    
    mapChildren(fn) {
        return this._children.map(fn)
    }
}
// initialize the types...
const typeNames = [
    "NoteBox",
    "DropBar",
    "Folder",
]
for (const type of typeNames) {
    const sym = Symbol()
    NodeParent.types[type] = sym
    NodeParent.reverseTypes[sym] = type
}
