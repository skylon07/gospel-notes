import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import BoardNode from "./BoardNode.js";
import { nodeStore } from "./datastore.js"

let root = null;
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;
});

function grabBoardNode() {
    return document.querySelector("[data-testid='board-node']")
}

function grabChildFrom(boardNode) {
    return boardNode.querySelector("[data-testid='note-box']") ||
        boardNode.querySelector("[data-testid='drop-bar']") ||
        boardNode.querySelector("[data-testid='folder']")
}

function grabNoteBoxData(noteBox) {
    const titleElem = noteBox.querySelector("textarea.Title");
    const contentElem = noteBox.querySelector("textarea.Content");
    
    const title = (titleElem || {value: null}).value
    const content = (contentElem || {value: null}).value
    return {title, content};
}

function grabDropBarData(dropBar) {
    // TODO
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
        const nodeId = nodeStore.createNode("NoteBox", {title, content}).id
        act(() => {
            render(<BoardNode nodeId={nodeId} />, root)
        })
        const boardNode = grabBoardNode()
        const noteBox = grabChildFrom(boardNode)
        const noteBoxData = grabNoteBoxData(noteBox)
        
        expect(noteBox).toHave
        expect(noteBoxData).toStrictEqual({title, content})
    })
})
