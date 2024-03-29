// represents the database for all notes
class NodeStoreSingleton {
    constructor() {
        this._construct()
    }
    // having a re-callable initializer allows resetting the singleton
    // (for testing)
    _construct() {
        this._nodesById = {}
    }

    get nodeTypes() {
        return NodeParent.types
    }

    createNode(type, data = {}, initChildren = []) {
        const id = this._createId()
        const node = new NodeParent(type, id, data, initChildren)
        this._nodesById[id] = node
        return node
    }

    getNodeById(nodeOrId) {
        if (this.isNode(nodeOrId)) {
            return nodeOrId
        }
        return this._nodesById[nodeOrId] || null
    }

    // TODO: implement some kind of node deletion/garbage collection

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
export default nodeStore

// represents a set of data accessible by the database by a unique ID
class NodeParent {
    // populated after class definition
    static types = (() => {
        const typeNames = ["NoteBox", "DropBar", "Folder", "Dummy"]
        const types = {}
        for (const type of typeNames) {
            types[type] = type
        }
        return types
    })()

    static changeTypes = (() => {
        const typeNames = ["data", "children"]
        const changeTypes = {}
        for (const type of typeNames) {
            changeTypes[type] = type
        }
        return changeTypes
    })()

    constructor(type, id, data = {}, initChildren = []) {
        if (!type || type !== this.constructor.types[type]) {
            throw new TypeError(
                `Invalid NodeParent type (${typeof type}) received`
            )
        }

        this._type = type
        this._id = id

        this._children = new NodeList(initChildren)
        this._parentCounter = {}

        this._data = {}
        this.setData(data)

        this._changeListeners = {}
        this._currListenerId = 0
    }

    toString() {
        return `[object NodeParent("${this.type}")]`
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
                    iconType:
                        typeof newData.iconType === "string"
                            ? newData.iconType
                            : typeof this._data.iconType === "string"
                            ? this._data.iconType
                            : "invalid",
                }
                break

            case types.Folder:
                this._data = {
                    // prettier-ignore
                    title: typeof newData.title === "string" ? newData.title :
                        typeof this._data.title === "string" ? this._data.title :
                        "(bad title data)",
                }
                break

            case types.Dummy:
                this._data = newData
                break

            default:
                throw new TypeError(
                    `Missing node.setData() implementation for node type '${this._type}'`
                )
        }

        Object.freeze(this._data)
        this._changed("data")
    }

    // please note this is a READ ONLY array
    get children() {
        return this._children.copyReadOnly()
    }

    addChild(nodeOrId, idx = null) {
        let node = nodeOrId
        if (typeof nodeOrId === "string") {
            node = nodeStore.getNodeById(nodeOrId)
            if (!nodeStore.isNodeId(nodeOrId) || !nodeStore.isNode(node)) {
                throw new TypeError(
                    `NodeParents can only add strings if the string is a valid node id (got ${nodeOrId})`
                )
            }
        } else if (!nodeStore.isNode(node)) {
            throw new TypeError(
                `NodeParents can only add other NodeParents as children (got ${node}`
            )
        }

        if (typeof idx === "number") {
            this._children.insertAt(node, idx)
        } else {
            this._children.push(node)
        }

        node._countParent(this)
        this._changed("children")
    }

    getChild(idx) {
        return this._children.get(idx)
    }

    get numChildren() {
        return this._children.length
    }

    indexOfChild(nodeOrId, start = 0) {
        let id = nodeOrId
        if (typeof nodeOrId !== "string") {
            if (!nodeStore.isNode(nodeOrId)) {
                throw new TypeError(
                    `An invalid node was passed to NodeParent.indexOf() (got ${nodeOrId})`
                )
            }
            id = nodeOrId.id
        }
        if (!nodeStore.isNodeId(id)) {
            throw new TypeError(
                `An invalid node id was passed to NodeParent.indexOf() (got ${id})`
            )
        }

        for (let i = start; i < this._children.length; i++) {
            const childId = this._children.get(i).id
            if (childId === id) {
                return i
            }
        }
        return -1
    }

    removeChildAt(idx) {
        const child = this._children.removeAt(idx)
        child._uncountParent(this)
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

    // this removes ALL occurences of a node from ALL of its parents, and
    // returns a list of every parent node that was affected
    removeFromParents() {
        const parents = []
        for (const parentId in this._parentCounter) {
            const count = this._parentCounter[parentId]
            const parent = nodeStore.getNodeById(parentId)
            for (let rmCount = 0; rmCount < count; rmCount++) {
                parent.removeChild(this)
            }
            if (count > 0) {
                parents.push(parent)
            }
        }
        this._resetCounter()
        return parents
    }

    subscribe(listener, listenFor = null) {
        if (typeof listener !== "function") {
            throw new TypeError(
                `Cannot subscribe to node with non-function '${listener}'`
            )
        }

        if (listenFor !== null && !NodeParent.changeTypes[listenFor]) {
            throw new TypeError(
                `Node subscription listeners cannot listen for invalid change type '${listenFor}'`
            )
        }

        const id = this._currListenerId
        this._currListenerId += 1
        this._changeListeners[id] = { listener, listenFor }
        return {
            unsubscribe: () => delete this._changeListeners[id],
            get listeningFor() {
                return this._changeListeners[id].listenFor
            },
        }
    }

    _changed(changeType) {
        if (!NodeParent.changeTypes[changeType]) {
            throw new TypeError(
                `Internal NodeParent error: listeners received an invalid changeType to be called with: ${changeType}`
            )
        }

        for (const id in this._changeListeners) {
            const { listener, listenFor } = this._changeListeners[id]
            if (listenFor === changeType || listenFor === null) {
                listener(changeType)
            }
        }
    }

    _countParent(parent) {
        if (!this._parentCounter[parent.id]) {
            this._parentCounter[parent.id] = 1
        } else {
            this._parentCounter[parent.id] += 1
        }
    }

    _uncountParent(parent) {
        this._parentCounter[parent.id] -= 1
    }

    _resetCounter() {
        this._parentCounter = {}
    }
}

class NodeList {
    constructor(iterable = []) {
        this._arr = [...iterable]
        this._readOnlyArr = null
    }

    toString() {
        return `[object NodeList(${this._arr})]`
    }

    get length() {
        return this._arr.length
    }

    get(idx) {
        return this._arr[idx]
    }

    copyReadOnly() {
        if (!this._readOnlyArr) {
            this._readOnlyArr = this._arr.slice()
            Object.freeze(this._readOnlyArr)
        }
        return this._readOnlyArr
    }

    insertAt(node, idx) {
        if (typeof idx !== "number") {
            throw new TypeError(
                `A NodeParent was given an invalid number to insert at: ${idx}`
            )
        } else if (idx < 0 || idx > this._arr.length) {
            throw new RangeError(
                `A NodeParent tried to insert a child at ${idx}, which is outside the bounds 0..${this._arr.length} (length)`
            )
        }

        this._arr.splice(idx, 0, node)
        this._wasModified()
    }

    push(node) {
        this._arr.push(node)
        this._wasModified()
    }

    removeAt(idx) {
        if (typeof idx !== "number") {
            throw new TypeError(
                `A NodeParent was given an invalid number to remove at: ${idx}`
            )
        } else if (idx < 0 || idx >= this._arr.length) {
            throw new RangeError(
                `A NodeParent tried to remove a child at ${idx}, which is outside the bounds 0..${
                    this._arr.length - 1
                } (length - 1)`
            )
        }

        const removedNodes = this._arr.splice(idx, 1)
        this._wasModified()
        return removedNodes[0]
    }

    _wasModified() {
        this._readOnlyArr = null
    }
}
