import { createNodeStoreForTesting } from './datastore.js'

let nodeStore = null
beforeEach(() => {
    nodeStore = createNodeStoreForTesting()
})
afterEach(() => {
    nodeStore = null
})

describe("NodeStorage tests", () => {
    it("returns the valid node types as an object of strings", () => {
        const { NoteBox, DropBar, Folder } = nodeStore.nodeTypes
        expect(NoteBox).toBe("NoteBox")
        expect(DropBar).toBe("DropBar")
        expect(Folder).toBe("Folder")
    })
    
    describe("node creation tests", () => {
        it("can create NoteBox nodes", () => {
            const type = nodeStore.nodeTypes.NoteBox
            const node = nodeStore.createNode(type)
            
            expect(typeof node).toBe("object")
            expect(node).not.toBe(null)
            expect(node.type).toBe(type)
        })
        
        it("can create DropBar nodes", () => {
            const type = nodeStore.nodeTypes.DropBar
            const node = nodeStore.createNode(type)
            
            expect(typeof node).toBe("object")
            expect(node).not.toBe(null)
            expect(node.type).toBe(type)
        })
        
        it("can create Folder nodes", () => {
            const type = nodeStore.nodeTypes.Folder
            const node = nodeStore.createNode(type)
            
            expect(typeof node).toBe("object")
            expect(node).not.toBe(null)
            expect(node.type).toBe(type)
        })
        
        it("errors when invalid types are passed", () => {
            expect(() => nodeStore.createNode("bad type")).toThrow(TypeError)
            expect(() => nodeStore.createNode()).toThrow(TypeError)
        })
    })
    
    it("can retrieve previously created node objects by id", () => {
        const nodes = []
        const numNodes = 20
        for (let i = 0; i < numNodes; i++) {
            const node = nodeStore.createNode("NoteBox")
            nodes.push(node)
        }
        
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            expect(nodeStore.getNodeById(node.id)).toBe(node)
        }
    })
    
    it("can detect valid node objects", () => {
        const validNode = nodeStore.createNode("NoteBox")
        const invalidNode = new (class {})
        const obj = {}
        const number = 5
        
        expect(nodeStore.isNode(validNode)).toBe(true)
        expect(nodeStore.isNode(invalidNode)).toBe(false)
        
        const objFn = jest.fn(() => nodeStore.isNode(obj))
        expect(objFn).not.toThrow()
        expect(objFn).toHaveReturnedWith(false)
        const numFn = jest.fn(() => nodeStore.isNode(number))
        expect(numFn).not.toThrow()
        expect(numFn).toHaveReturnedWith(false)
    })
    
    it("can detect valid node id strings", () => {
        const validNodeId = nodeStore.createNode("NoteBox").id
        const invalidNodeId = "this is a string"
        const number = 72
        
        expect(nodeStore.isNodeId(validNodeId)).toBe(true)
        expect(nodeStore.isNodeId(invalidNodeId)).toBe(false)
        
        const numFn = jest.fn(() => nodeStore.isNodeId(number))
        expect(numFn).not.toThrow()
        expect(numFn).toHaveReturnedWith(false)
    })
})

describe("Node tests", () => {
    it("is created with valid NoteBox data", () => {
        // NOTE: "valid data" = title (string) and content (string)
        const title = "title"
        const content = "content"
        const dataNotToInclude = "this should not be in the data"
        const node = nodeStore.createNode("NoteBox", { title, content, dataNotToInclude })
        
        expect(node.data).toStrictEqual({ title, content })
    })
    
    it("is created with valid DropBar data", () => {
        // NOTE: "valid data" = title (string)
        const title = "title"
        const dataNotToInclude = "this should not be in the data"
        const node = nodeStore.createNode("DropBar", { title, dataNotToInclude })
        
        expect(node.data).toStrictEqual({ title })
    })
    
    it("is created with valid Folder data", () => {
        // NOTE: "valid data" = title (string)
        const title = "title"
        const dataNotToInclude = "this should not be in the data"
        const node = nodeStore.createNode("Folder", { title, dataNotToInclude })
    
        expect(node.data).toStrictEqual({ title })
    })
    
    it("has a read-only id property that returns a valid id string", () => {
        const node = nodeStore.createNode("NoteBox")
        const nodeIdPrefix = "NODE"
        
        expect(typeof node.id).toBe("string")
        expect(node.id.substr(0, nodeIdPrefix.length)).toBe(nodeIdPrefix)
        expect(() => node.id = "error!").toThrow()
    })
    
    it("has a read-only type property that returns a string", () => {
        const node = nodeStore.createNode("NoteBox")
        
        expect(node.type).toBe("NoteBox")
        expect(() => node.type = "error!").toThrow()
    })
    
    describe("children tests", () => {
        let mainNode = null
        beforeEach(() => {
            mainNode = nodeStore.createNode("Folder")
        })
        afterEach(() => {
            mainNode = null
        })
        
        it("initializes with no children", () => {
            expect(mainNode._children).toStrictEqual([])
        })
        
        it("adds node children by node", () => {
            const child = nodeStore.createNode("NoteBox")
            const another = nodeStore.createNode("NoteBox")
            mainNode.addChild(child)
            mainNode.addChild(another)
            
            expect(mainNode._children).toStrictEqual([child, another])
        })
        
        it("adds node children by id", () => {
            const child = nodeStore.createNode("NoteBox")
            mainNode.addChild(child.id)
            
            expect(mainNode._children).toStrictEqual([child])
        })
        
        it("removes children by index and returns the node", () => {
            const node = nodeStore.createNode("NoteBox")
            const numNodes = 5
            const insertIdx = 2
            for (let i = 0; i < numNodes; i++) {
                if (i === insertIdx) {
                    mainNode.addChild(node)
                } else {
                    mainNode.addChild(nodeStore.createNode("NoteBox"))
                }
            }
            
            const returned = mainNode.removeChildAt(insertIdx)
            expect(returned).toBe(node)
        })
        
        it("numbers its children", () => {
            let numChildren = 10
            for (let i = 0; i < numChildren; i++) {
                mainNode.addChild(nodeStore.createNode("NoteBox"))
            }
            
            expect(mainNode.numChildren).toBe(numChildren)
            
            let numToRemove = 4
            numChildren -= numToRemove
            for (let i = 0; i < numToRemove; i++) {
                mainNode.removeChildAt(1)
            }
            
            expect(mainNode.numChildren).toBe(numChildren)
            
            let numToAdd = 7
            numChildren += numToAdd
            for (let i = 0; i < numToAdd; i++) {
                mainNode.addChild(nodeStore.createNode("NoteBox"))
            }
            
            expect(mainNode.numChildren).toBe(numChildren)
        })
    })
})
