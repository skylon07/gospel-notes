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
export let nodeStore = new NodeStoreSingleton()
export function createNodeStoreForTesting() {
    // NOTE: resets nodeStore to correct the references used by NodeParents
    return nodeStore = new NodeStoreSingleton()
}

// represents a set of data accessible by the database by a unique ID
class NodeParent {
    // populated after class definition
    static types = {}
    
    constructor(type, id, data) {
        if (!type || type !== this.constructor.types[type]) {
            throw new TypeError(`Invalid NodeParent type (${typeof type}) received; Please use one of NodeStore.nodeTypes`)
        }
        
        this._type = type
        this._id = id
        this._children = []
        this._data = {}
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
                    // prettier-ignore
                    title: typeof newData.title === "string" ? newData.title :
                        typeof this._data.title === "string" ? this._data.title :
                        "(bad title data)",
                    // prettier-ignore
                    content: typeof newData.content === "string" ? newData.content :
                        typeof this._data.content === "string" ? this._data.content :
                        "(bad content data)",
                }
            }
            break
            
            case types.DropBar: {
                this._data = {
                    // prettier-ignore
                    title: typeof newData.title === "string" ? newData.title :
                        typeof this._data.title === "string" ? this._data.title :
                        "(bad title data)"
                }
            }
            break
            
            case types.Folder: {
                this._data = {
                    // prettier-ignore
                    title: typeof newData.title === "string" ? newData.title :
                        typeof this._data.title === "string" ? this._data.title :
                        "(bad title data)"
                }
            }
            break
        }
    }
    
    addChild(nodeOrId, idx=null) {
        let node = nodeOrId
        if (typeof nodeOrId === "string") {
            node = nodeStore.getNodeById(nodeOrId)
            if (!nodeStore.isNodeId(nodeOrId) || !nodeStore.isNode(node)) {
                throw new TypeError(`NodeParents can only add strings if the string is a valid node id (got ${nodeOrId})`)
            }
        } else if (!nodeStore.isNode(node)) {
            throw new TypeError(`NodeParents can only add other NodeParents as children (got ${node}`)
        }
        
        if (typeof idx === "number") {
            this._children.splice(idx, 0, node)
        } else {
            this._children.push(node)
        }
    }
    
    removeChildAt(idx) {
        return this._children.splice(idx, 1)[0]
    }
    
    indexOf(nodeOrId, start=0) {
        let id = nodeOrId
        if (typeof nodeOrId !== "string") {
            if (!nodeStore.isNode(nodeOrId)) {
                throw new TypeError(`An invalid node was passed to NodeParent.indexOf() (got ${nodeOrId})`)
            }
            id = nodeOrId.id
        }
        if (!nodeStore.isNodeId(id)) {
            throw new TypeError(`An invalid node id was passed to NodeParent.indexOf() (got ${id})`)
        }
        
        for (let i = start; i < this._children.length; i++) {
            const childId = this._children[i].id
            if (childId === id) {
                return i
            }
        }
        return -1
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
    
    filterChildren(fn) {
        return this._children.filter(fn)
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
