import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import nodeStore from "./datastore.js"

import NoteBoard from "./NoteBoard.js";

let root = null;
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;
    
    nodeStore.DANGEROUS_clearForTestingOnly()
});

function grabNoteBoard() {
    return document.querySelector("[data-testid='note-board']")
}

function grabChildFrom(boardNode) {
    return boardNode.querySelector("[data-testid='note-box']") ||
        boardNode.querySelector("[data-testid='drop-bar']") ||
        boardNode.querySelector("[data-testid='folder']")
}

it("renders without crashing", () => {
    render(<NoteBoard />, root)
})

it("renders with a CSS class", () => {
    act(() => {
        render(<NoteBoard />, root)
    })
    const board = grabNoteBoard()
    
    expect(board).toHaveClass("NoteBoard")
})

it("renders BoardNodes from nodes or their IDs", () => {
    // TODO: should probably split this into multiple tests
    const children = [
        nodeStore.createNode("NoteBox"),
        <div key="div that shouldn't be checked">
           "not a node"
           {nodeStore.createNode("NoteBox").id}
        </div>,
        "not a node",
        ["not a node", nodeStore.createNode("DropBar").id, "not a node"],
    ]
    act(() => {
        render(<NoteBoard>{children}</NoteBoard>, root)
    })
    const board = grabNoteBoard()
    
    // test that it changed the ID string to a BoardNode
    const elem0 = board.childNodes[0]
    expect(elem0).toHaveClass("BoardNode")
    // test that it rendered the board node correctly
    const child0 = grabChildFrom(elem0)
    expect(child0).toHaveClass("NoteBox")
    
    const elem1 = board.childNodes[1]
    expect(elem1.tagName.toLowerCase()).toBe("div")
    const child1_0 = elem1.childNodes[0]
    expect(child1_0.textContent.includes("not a node")).toBe(true)
    // test that board nodes nested in elements are NOT rendered
    // (valid node ids remain strings and are not actual nodes)
    const child1_1 = elem1.childNodes[1]
    expect(child1_1.textContent.includes("NODE")).toBe(true)
    
    const elem2 = board.childNodes[2]
    expect(elem2.textContent.includes("not a node")).toBe(true)
    
    // test the array was rendered correctly
    const elem3 = board.childNodes[3]
    expect(elem3.textContent.includes("not a node")).toBe(true)
    const elem4 = board.childNodes[4]
    expect(elem4).toHaveClass("BoardNode")
    const child4 = grabChildFrom(elem4)
    expect(child4).toHaveClass("DropBar")
    const elem5 = board.childNodes[5]
    expect(elem5.textContent.includes("not a node")).toBe(true)
})

// TODO: write more tests
