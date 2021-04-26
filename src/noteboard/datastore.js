// represents the database for all notes
class NodeStoreSingleton {
    constructor() {
        this._nodesById = {}
    }
    
    get nodeTypes() {
        return NodeParent.types
    }
    
    createNode(type, data) {
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
        const specificTime = parseInt(performance.now())
        // for that one person that one time where their computers
        // decided to use two of the same times anyway... ("one in a million")
        const randNumJustInCase = Math.floor(Math.random() * 1000000)
        let fullId = `NODE${time}-${specificTime}-${randNumJustInCase}`
    
        // okay... let's guarantee this id is unique
        if (this._nodesById[fullId]) {
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
    
    constructor(type, id, data) {
        if (type !== this.constructor.types[type]) {
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
    
    get id() {
        return this._id
    }
    
    get data() {
        return this._data
    }
    
    set data(newData) {
        if (typeof newData !== "object" || !newData) {
            newData = {}
        }
        
        const types = this.constructor.types
        switch (this._type) {
            case types.NoteBox: {
                this._data = {
                    title: typeof newData.title === "string" ?
                        newData.title : "(bad title data)",
                    content: typeof newData.content === "string" ?
                        newData.content : "(bad content data)",
                }
            }
            break
            
            case types.DropBar: {
                // TODO
            }
            break
            
            case types.Folder: {
                // TODO
            }
            break
        }
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
    NodeParent.types[type] = type
}
