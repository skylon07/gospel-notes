import React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"

import BoardNodeGroup from "./BoardNodeGroup.js"
import nodeStore from "./datastore.js"

let root = null
beforeEach(() => {
    root = document.createElement("div")
    document.body.appendChild(root)
})
afterEach(() => {
    unmountComponentAtNode(root)
    document.body.removeChild(root)
    root = null

    nodeStore.DANGEROUS_clearForTestingOnly()
})

it("renders without crashing", () => {
    render(<BoardNodeGroup />, root)
})

it("renders children, as given, without wrapping in a DOM element", () => {
    act(() => {
        render(
            <BoardNodeGroup>
                <button />
            </BoardNodeGroup>,
            root
        )
    })

    expect(root.children[0].tagName.toLowerCase()).toBe("button")
})

it("renders a node's children without wrapping in a DOM element", () => {
    const node = nodeStore.createNode("Folder")
    node.addChild(nodeStore.createNode("NoteBox"))
    act(() => {
        render(<BoardNodeGroup node={node} />, root)
    })

    expect(root.children[0]).toHaveClass("BoardNode")
})

// TODO: probably should write more tests...
