// represents the database for all notes
class NodeStoreSingleton {
    constructor() {
        this._construct()
    }
    // NOTE: having a re-callable initializer allows resetting the singleton
    _construct() {
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
    
    getNodeById(nodeOrId) {
        if (this.isNode(nodeOrId)) {
            return nodeOrId
        }
        return this._nodesById[nodeOrId] || null
    }
    
    isNode(val) {
        return val instanceof NodeParent
    }
    
    isNodeId(str) {
        const regex = /^NODE\d+-\d+-\d+$/
        return typeof str === "string" && regex.test(str)
    }
    
    // creates a string indentifier that is unique between
    // all other note board elements (for this user, at least)
    _createId() {
        // pretty much unique...
        const time = new Date().getTime()
        // unique so long as you aren't running on a massive supercomputer...
        const specificTime = parseInt(performance.now())
        // for that one person that one time where their computers
        // decided to use two of the same times anyway... (it's "one in a million")
        const randNumJustInCase = Math.floor(Math.random() * 1000000)
        let fullId = `NODE${time}-${specificTime}-${randNumJustInCase}`
    
        // okay... let's guarantee this id is unique
        while (this._nodesById[fullId]) {
            fullId += Math.floor(Math.random() * 10)
        }
        
        return fullId
    }
    
    // in case one is using nodeStore as an imported value, this will simulate
    // creating a new nodeStore (obviously keeping the reference the same)
    DANGEROUS_clearForTestingOnly() {
        this._construct()
    }
}
export const nodeStore = new NodeStoreSingleton()

// NOTE: this only simulates creating a new node store, since NodeParents
//       reference the singleton directly (and allows other modules to test and
//       reset via nodeStore.clearForTesting())
export function createNodeStoreForTesting() {
    nodeStore.DANGEROUS_clearForTestingOnly()
    return nodeStore
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
        this._changeListeners = []
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
        this.setData(newData)
    }
    
    setData(newData) {
        if (typeof newData !== "object" || !newData) {
            newData = {}
        }
        
        const types = this.constructor.types
        switch (this._type) {
            case types.NoteBox:
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
                break
            
            case types.DropBar:
                this._data = {
                    // prettier-ignore
                    title: typeof newData.title === "string" ? newData.title :
                        typeof this._data.title === "string" ? this._data.title :
                        "(bad title data)",
                    iconType: typeof newData.iconType === "string" ? newData.iconType :
                        typeof this._data.iconType === "string" ? this._data.iconType :
                        "invalid",
                }
                break
            
            case types.Folder:
                this._data = {
                    // prettier-ignore
                    title: typeof newData.title === "string" ? newData.title :
                        typeof this._data.title === "string" ? this._data.title :
                        "(bad title data)"
                }
                break
            default:
                throw new Error("Bad node data type (should never happen...?)")
        }
        
        Object.freeze(this._data)
        this._changed("data")
    }
    
    subscribe(listener) {
        if (typeof listener !== "function") {
            throw new TypeError(`Cannot subscribe to node with non-function ${listener}`)
        }
        this._changeListeners.push(listener)
    }
    
    unsubscribe(listener) {
        const idx = this._changeListeners.indexOf(listener)
        if (idx !== -1) {
            this._changeListeners.splice(idx, 1)
        }
    }
    
    _changed(changeType) {
        for (let i = 0; i < this._changeListeners.length; i++) {
            const listener = this._changeListeners[i]
            listener(changeType)
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
        
        this._changed("children")
    }
    
    getChild(idx) {
        return this._children[idx]
    }
    
    get numChildren() {
        return this._children.length
    }
    
    indexOfChild(nodeOrId, start=0) {
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
    
    removeChildAt(idx) {
        const child = this._children.splice(idx, 1)[0]
        this._changed("children")
        return child
    }
    
    removeChild(nodeOrId) {
        const idx = this.indexOfChild(nodeOrId)
        if (idx !== -1) {
            return this.removeChildAt(idx)
        }
        return null
    }
    
    // TODO: make a custom list type that appears read-only, but has hidden
    //       function values, so there is no need to copy
    copyChildren() {
        return this.mapChildren((child) => child)
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
