import nodeStore from './datastore.js'

afterEach(() => {
    nodeStore.DANGEROUS_clearForTestingOnly()
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
        const title = "title"
        const content = "content"
        const dataNotToInclude = "this should not be in the data"
        const node = nodeStore.createNode("NoteBox", { title, content, dataNotToInclude })
        
        expect(node.data).toStrictEqual({ title, content })
    })
    
    it("is created with valid DropBar data", () => {
        const title = "title"
        const iconType = "icon type"
        const dataNotToInclude = "this should not be in the data"
        const node = nodeStore.createNode("DropBar", { title, iconType, dataNotToInclude })
        
        expect(node.data).toStrictEqual({ title, iconType })
    })
    
    it("is created with valid Folder data", () => {
        const title = "title"
        const dataNotToInclude = "this should not be in the data"
        const node = nodeStore.createNode("Folder", { title, dataNotToInclude })
    
        expect(node.data).toStrictEqual({ title })
    })
    
    it("merges new data when using setData()", () => {
        const title = "title"
        const content = "content"
        const node = nodeStore.createNode("NoteBox", { title, content })
        
        const newTitle = "new title"
        node.setData({ title: newTitle })
        
        expect(node.data).toStrictEqual({ title: newTitle, content })
    })
    
    it("errors when the data is modified directly", () => {
        const title = "title"
        const node = nodeStore.createNode("NoteBox", { title })
        expect(() => {
            node.data.title = "new title"
        }).toThrow()
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
            expect(mainNode.children).toStrictEqual([])
        })
        
        it("adds node children by node", () => {
            const child = nodeStore.createNode("NoteBox")
            const another = nodeStore.createNode("NoteBox")
            mainNode.addChild(child)
            mainNode.addChild(another)
            
            expect(mainNode.children).toStrictEqual([child, another])
        })
        
        it("adds node children by id", () => {
            const child = nodeStore.createNode("NoteBox")
            mainNode.addChild(child.id)
            
            expect(mainNode.children).toStrictEqual([child])
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
        
        // TODO: error tests for adding/removing non nodes, or removing nodes
        //       at bad idxs, etc.
        
        // TODO: test children array is read only
    })
    
    describe("parent removal tests", () => {
        it("tracks parents and can remove itself from them", () => {
            const node = nodeStore.createNode("NoteBox")
            const parents = [
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
            ]
            for (const parent of parents) {
                parent.addChild(node)
            }
            
            for (const parent of parents) {
                expect(parent.numChildren).toBe(1)
            }
            
            node.removeFromParents()
            
            for (const parent of parents) {
                expect(parent.numChildren).toBe(0)
            }
        })
        
        it("removes itself from parents the correct number of times", () => {
            const node = nodeStore.createNode("NoteBox")
            const parents = [
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
                nodeStore.createNode("Folder"),
            ]
            for (let i = 0; i < parents.length; i++) {
                const parent = parents[i]
                for (let j = 0; j <= i; j++) {
                    parent.addChild(node)
                }
            }
            parents[2].removeChild(node)
            parents[1].removeChildAt(0)
            parents[2].removeChildAt(1)
        
            for (const parent of parents) {
                expect(parent.numChildren > 0).toBe(true)
            }
        
            node.removeFromParents()
        
            for (const parent of parents) {
                expect(parent.numChildren).toBe(0)
            }
        })
        
        it("returns each affected parent (only once!) as an array", () => {
            const node = nodeStore.createNode("NoteBox")
            const parents = [
                    nodeStore.createNode("Folder"),
                    nodeStore.createNode("Folder"),
                    nodeStore.createNode("Folder"),
                    nodeStore.createNode("Folder"),
                    nodeStore.createNode("Folder"),
                ]
            for (let i = 0; i < parents.length; i++) {
                const parent = parents[i]
                for (let j = 0; j <= i; j++) {
                    parent.addChild(node)
                }
            }
            parents[2].removeChild(node)
            parents[1].removeChildAt(0)
            parents[2].removeChildAt(1)
            while (parents[3].numChildren > 0) {
                parents[3].removeChild(node)
            }
        
            for (const parent of parents) {
                if (parent !== parents[3]) {
                    expect(parent.numChildren > 0).toBe(true)
                }
            }
        
            const changedParents = node.removeFromParents()
        
            expect(changedParents).toStrictEqual([
                parents[0],
                parents[1],
                parents[2],
                // parents[3] had no children
                parents[4],
            ])
        })
    })
    
    describe("subscription tests", () => {
        it("calls subscribed functions on data change", () => {
            const node = nodeStore.createNode("NoteBox")
            const listener = jest.fn()
            node.subscribe(listener)
            
            expect(listener).not.toHaveBeenCalled()
            
            const title = "new title!"
            node.setData({ title })
            
            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith("data")
            
            const anotherListener = jest.fn()
            node.subscribe(anotherListener)
            
            expect(anotherListener).not.toHaveBeenCalled()
            
            const content = "new content yay!"
            node.setData({ content })
            
            expect(listener).toHaveBeenCalledTimes(2)
            expect(anotherListener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenLastCalledWith("data")
            expect(anotherListener).toHaveBeenCalledWith("data")
        })
        
        it("calls subscribed functions when children are added", () => {
            const node = nodeStore.createNode("Folder")
            const listener = jest.fn()
            node.subscribe(listener)
            
            expect(listener).not.toHaveBeenCalled()
            
            const child = nodeStore.createNode("Folder")
            node.addChild(child)
            
            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith("children")
        })
        
        it("calls subscribed functions when children are removed", () => {
            const node = nodeStore.createNode("Folder")
            const child = nodeStore.createNode("Folder")
            node.addChild(child)
        
            const listener = jest.fn()
            node.subscribe(listener)
            
            expect(listener).not.toHaveBeenCalled()
            
            node.removeChild(child)
        
            expect(listener).toHaveBeenCalledTimes(1)
            expect(listener).toHaveBeenCalledWith("children")
        })
        
        it("can remove subscribed functions and no longer calls them", () => {
            const node = nodeStore.createNode("DropBar")
            const listener = jest.fn()
            const anotherListener = jest.fn()
            const listenerSubscription = node.subscribe(listener)
            node.subscribe(anotherListener)
            
            const title = "new title woot!"
            node.setData({ title })
            
            expect(listener).toHaveBeenCalledTimes(1)
            expect(anotherListener).toHaveBeenCalledTimes(1)
            
            listenerSubscription.unsubscribe()
            
            const newTitle = "another new title YESSSS!"
            const iconType = "new icon type? ABSOLUTELY STUNNING!"
            node.setData({ title: newTitle, iconType })
            
            expect(listener).toHaveBeenCalledTimes(1)
            expect(anotherListener).toHaveBeenCalledTimes(2)
        })
        
        it("doesn't call listeners listening for a different type", () => {
            const node = nodeStore.createNode("NoteBox")
            const listener = jest.fn()
            node.subscribe(listener, "children")
            
            expect(listener).not.toHaveBeenCalled()
            
            const title = "new title!"
            node.setData({ title })
            
            expect(listener).not.toBeCalled()
        })
        
        it("throws when given a non-function listener", () => {
            expect(() => {
                const node = nodeStore.createNode("NoteBox")
                node.subscribe("not a function")
            }).toThrow(TypeError)
        })
        
        it("throws when asked to listen to a bad change type", () => {
            expect(() => {
                const node = nodeStore.createNode("NoteBox")
                const listener = jest.fn()
                node.subscribe(listener, "this is a bad change type")
            }).toThrow(TypeError)
        })
    })
})
