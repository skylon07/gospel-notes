import React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"

import { ConstantTextNode, StaticTextNode } from "."

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

function grabTextNode() {
    return document.querySelector("[data-testid='text-node']")
}

describe("constant nodes", () => {
    it("renders without crashing", () => {
        render(<ConstantTextNode />, root)
    })

    it("renders with a CSS class", () => {
        act(() => {
            render(<ConstantTextNode />, root)
        })
        const node = grabTextNode()

        expect(node).toHaveClass("TextNode")
    })

    // TODO: write more tests (not really sure how to mock element sizes while
    //       maintaining meaningful tests...)
})

describe("static nodes", () => {
    it("renders without crashing", () => {
        render(<StaticTextNode />, root)
    })

    it("renders with a CSS class", () => {
        act(() => {
            render(<StaticTextNode />, root)
        })
        const node = grabTextNode()

        expect(node).toHaveClass("TextNode")
    })
})
