import React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"
import MainApp from "./MainApp.js"

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

// TODO: do we need to write more tests for this...?

// TODO: write tests for useNodeStack
