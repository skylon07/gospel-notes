import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import BoardNode from "./BoardNode.js";
import { createNodeStoreForTesting } from "./datastore.js"

let root = null;
let nodeStore = null
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
    
    nodeStore = createNodeStoreForTesting()
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;
    
    nodeStore = null
});

function grabBoardNode() {
    return document.querySelector("[data-testid='board-node']")
}

function grabChildFrom(boardNode) {
    return boardNode.querySelector("[data-testid='note-box']") ||
        boardNode.querySelector("[data-testid='drop-bar']") ||
        boardNode.querySelector("[data-testid='folder']")
}

function grabDropBarContentFrom(dropBar) {
    return dropBar.querySelector("[data-testid='drop-bar-content']");
}

function grabNoteBoxData(noteBox) {
    const titleElem = noteBox.querySelector("textarea.Title");
    const contentElem = noteBox.querySelector("textarea.Content");
    
    const title = (titleElem || {value: null}).value
    const content = (contentElem || {value: null}).value
    return {title, content};
}

function grabDropBarData(dropBar) {
    const titleElem = dropBar.querySelector(".Bar")
    let title = null
    for (let i = 0; i < titleElem.childNodes.length; i++) {
        title = titleElem.childNodes[i]
        if (title.nodeType === Node.TEXT_NODE) {
            title = title.textContent
            break
        }
        title = null
    }
    return {title}
}

function grabFolderData(folder) {
    // TODO
}

it("renders without crashing", () => {
    const node = nodeStore.createNode("NoteBox")
    render(<BoardNode nodeId={node.id} />, root)
})

describe("rendering tests", () => {
    it("renders NoteBox nodes", () => {
        const title = "title"
        const content = "content"
        const node = nodeStore.createNode("NoteBox", {title, content})
        act(() => {
            render(<BoardNode node={node} />, root)
        })
        const boardNode = grabBoardNode()
        const noteBox = grabChildFrom(boardNode)
        const noteBoxData = grabNoteBoxData(noteBox)
        
        expect(noteBox).toHaveClass("NoteBox")
        expect(noteBoxData).toStrictEqual({title, content})
    })
    
    it("renders nodes by ID (using NoteBox type)", () => {
        const title = "title"
        const content = "content"
        const nodeId = nodeStore.createNode("NoteBox", { title, content }).id
        act(() => {
            render(<BoardNode node={nodeId} />, root)
        })
        const boardNode = grabBoardNode()
        const noteBox = grabChildFrom(boardNode)
        const noteBoxData = grabNoteBoxData(noteBox)
        
        expect(noteBox).toHaveClass("NoteBox")
        expect(noteBoxData).toStrictEqual({ title, content })
    })
    
    it("renders DropBar nodes", () => {
        const title = "title"
        const node = nodeStore.createNode("DropBar", {title})
        act(() => {
            render(<BoardNode node={node} />, root)
        })
        const boardNode = grabBoardNode()
        const dropBar = grabChildFrom(boardNode)
        const dropBarData = grabDropBarData(dropBar)
        
        expect(dropBar).toHaveClass("DropBar")
        expect(dropBarData).toStrictEqual({title})
    })
    
    it("renders DropBar nodes with children", () => {
        const node = nodeStore.createNode("DropBar")
        const title = "note title"
        const content = "note content"
        const child = nodeStore.createNode("NoteBox", { title, content })
        node.addChild(child)
        act(() => {
            render(<BoardNode node={node} />, root)
        })
        const boardNode = grabBoardNode()
        const dropBar = grabChildFrom(boardNode)
        const noteBox = grabDropBarContentFrom(dropBar)
        const noteBoxData = grabNoteBoxData(noteBox)
        
        expect(noteBox).toHaveClass("NoteBox")
        expect(noteBoxData).toStrictEqual({ title, content })
    })
})

// TODO: onChange tests
// TODO: remove notebox children nodes when empty
