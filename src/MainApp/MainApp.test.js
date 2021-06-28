import React from "react"
import PropTypes from "prop-types"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"
import { callHookOn } from "common/hooks/HookTester.js"

import MainApp, { useRootNode, useViewStack } from "./MainApp.js"
import { nodeStore } from "noteboard"

let root = null
beforeEach(() => {
    root = document.createElement("div")
    document.body.appendChild(root)
})
afterEach(() => {
    unmountComponentAtNode(root)
    document.body.removeChild(root)
    root = null
})

function grabMainApp() {
    return document.querySelector("[data-testid='main-app']")
}

it("renders without crashing", () => {
    render(<MainApp />, root)
})

it("renders with a CSS class", () => {
    act(() => {
        render(<MainApp />, root)
    })
    const app = grabMainApp()

    expect(app).toHaveClass("MainApp")
})

describe("custom hook tests", () => {
    describe("useViewStack() tests", () => {
        afterEach(() => {
            nodeStore.DANGEROUS_clearForTestingOnly()
        })

        function genNumNodes(numNodes) {
            const nodes = []
            for (let i = 0; i < numNodes; i++) {
                const newNode = nodeStore.createNode("Dummy")
                nodes.push(newNode)
            }
            return nodes
        }

        function mapNodesToIds(nodes) {
            return nodes.map((node) => node.id)
        }

        function callUseViewStack(...args) {
            return callHookOn(root, useViewStack, ...args)
        }

        it("returns hook data as an array", () => {
            const hookResult = callUseViewStack()

            expect(hookResult).toBeInstanceOf(Array)
            const [viewList, push, pop, clear] = hookResult
            expect(viewList).toBe(null)
            expect(typeof push).toBe("function")
            expect(typeof pop).toBe("function")
            expect(typeof clear).toBe("function")
        })

        function getCurrViewList() {
            return callUseViewStack()[0]
        }

        function pushNodeIdsToStack(nodeIds) {
            const pushToStack = callUseViewStack()[1]
            act(() => {
                pushToStack(nodeIds)
            })
        }

        it("can push a node id list and return it", () => {
            const firstNodes = genNumNodes(1)
            pushNodeIdsToStack(mapNodesToIds(firstNodes))

            const firstViewList = getCurrViewList()
            expect(firstViewList).toStrictEqual(
                firstNodes.map((node) => node.id)
            )

            const secondNodes = genNumNodes(3)
            pushNodeIdsToStack(mapNodesToIds(secondNodes))

            const secondViewList = getCurrViewList()
            expect(secondViewList).toStrictEqual(
                secondNodes.map((node) => node.id)
            )
        })

        function popNodeIdsFromStack() {
            const popFromStack = callUseViewStack()[2]
            act(() => {
                popFromStack()
            })
        }

        it("can pop previously pushed node id lists and return reverted values", () => {
            const firstNodes = genNumNodes(2)
            pushNodeIdsToStack(mapNodesToIds(firstNodes))
            const secondNodes = genNumNodes(4)
            pushNodeIdsToStack(mapNodesToIds(secondNodes))
            const thirdNodes = [
                firstNodes[0],
                secondNodes[1],
                secondNodes[0],
                firstNodes[1],
                secondNodes[3],
            ]
            pushNodeIdsToStack(mapNodesToIds(thirdNodes)) // [3 items]

            const firstViewList = getCurrViewList()
            expect(firstViewList).toStrictEqual(
                thirdNodes.map((node) => node.id)
            )

            popNodeIdsFromStack() // [2 items]

            const secondViewList = getCurrViewList()
            expect(secondViewList).toStrictEqual(
                secondNodes.map((node) => node.id)
            )

            popNodeIdsFromStack() // [1 item]

            const thirdViewList = getCurrViewList()
            expect(thirdViewList).toStrictEqual(
                firstNodes.map((node) => node.id)
            )

            popNodeIdsFromStack() // [0 items]

            const lastViewList = getCurrViewList()
            expect(lastViewList).toBe(null)
        })

        function clearNodeIdsInStack() {
            const clearStack = callUseViewStack()[3]
            act(() => {
                clearStack()
            })
        }

        it("can completely empty/clear the view stack", () => {
            pushNodeIdsToStack(mapNodesToIds(genNumNodes(2)))
            pushNodeIdsToStack(mapNodesToIds(genNumNodes(1)))
            pushNodeIdsToStack(mapNodesToIds(genNumNodes(3)))
            clearNodeIdsInStack()

            const viewList = getCurrViewList()
            expect(viewList).toBe(null)
        })

        describe("error throwing tests", () => {
            it("throws when the initial list is not an array", () => {
                expect(() => {
                    const validNodeIdButNotAList = genNumNodes(1)[0].id
                    callUseViewStack(validNodeIdButNotAList)
                }).toThrow(TypeError)
            })

            it("throws when the initial list is not a 2D array", () => {
                expect(() => {
                    const validNodeIdsButNot2D = mapNodesToIds(genNumNodes(3))
                    callUseViewStack(validNodeIdsButNot2D)
                }).toThrow(TypeError)
            })

            it("throws when the initial list does not contain node ids", () => {
                expect(() => {
                    const array2DButWithBadThings = [
                        ["these", "are"],
                        ["not", "valid", "node", "ids"],
                    ]
                    callUseViewStack(array2DButWithBadThings)
                }).toThrow(TypeError)
            })

            it("throws when even one item in the initial list is not a node id", () => {
                expect(() => {
                    const firstIdList = mapNodesToIds(genNumNodes(4))
                    firstIdList.splice(2, 0, "not a valid id")
                    const secondIdList = mapNodesToIds(genNumNodes(3))
                    secondIdList.splice(1, 0, "not a valid id")
                    const array2DButWithSomeNonIds = [firstIdList, secondIdList]
                    callUseViewStack(array2DButWithSomeNonIds)
                }).toThrow(TypeError)
            })

            it("throws when pushing a non-array to the stack", () => {
                expect(() => {
                    const validNodeIdButNotAList = genNumNodes(1)[0].id
                    pushNodeIdsToStack(validNodeIdButNotAList)
                }).toThrow(TypeError)
            })

            it("throws when pushing an array that does not contain node ids", () => {
                expect(() => {
                    const arrayOfNonIds = ["this", "has", "no", "node", "ids"]
                    pushNodeIdsToStack(arrayOfNonIds)
                }).toThrow(TypeError)
            })

            it("throws when pushing a list that has even one item that is not a node id", () => {
                expect(() => {
                    const arrayWithSomeNonIds = mapNodesToIds(genNumNodes(3))
                    arrayWithSomeNonIds.splice(1, 0, "invalid node id")
                    pushNodeIdsToStack(arrayWithSomeNonIds)
                }).toThrow(TypeError)
            })
        })
    })

    describe("useRootNode() tests", () => {
        function callUseRootNode(...args) {
            return callHookOn(root, useRootNode, ...args)
        }

        it("returns a valid node", () => {
            const rootNode = callUseRootNode()

            expect(nodeStore.isNode(rootNode)).toBe(true)
        })

        it("returns the same node across renders", () => {
            const firstNode = callUseRootNode()
            const secondNode = callUseRootNode()

            expect(secondNode).toBe(firstNode)

            const thirdNode = callUseRootNode()

            expect(thirdNode).toBe(firstNode)
        })

        // TODO: after nodeStore is an online database, write cross-session
        //       tests...? (how do you do that?)
    })
})

describe("MainApp empty node removal tests", () => {
    // TODO: test for DOM (and nodeStore?) removal of empty
    //       NoteBoxes and DropBars
})

describe("MainApp search index tests", () => {
    // TODO: test when nodes are added/removed or their data is changed, the
    //       search index updates
})
