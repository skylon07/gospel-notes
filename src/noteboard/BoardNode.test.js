import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import { NoteBoardCallbacks } from "./NoteBoard.js"
import BoardNode from "./BoardNode.js";
import nodeStore from "./datastore.js"

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

function grabBoardNode() {
    return document.querySelector("[data-testid='board-node']")
}

function grabChildFrom(boardNode) {
    return boardNode.children[0]
}

function grabNoteBoxFields(noteBox) {
    const titleElem = noteBox.querySelector("textarea.Title");
    const contentElem = noteBox.querySelector("textarea.Content");
    return [titleElem, contentElem]
}

function grabNoteBoxData(noteBox) {
    const [titleElem, contentElem] = grabNoteBoxFields(noteBox)

    const title = (titleElem || { value: null }).value
    const content = (contentElem || { value: null }).value
    return { title, content };
}

function grabDropBarContentChildrenFrom(dropBar) {
    const content = dropBar.querySelector("[data-testid='drop-bar-content']");
    return content.querySelector(".Container").children
}

function grabDropBarChildAt(dropBar, idx) {
    const children = grabDropBarContentChildrenFrom(dropBar)
    return grabChildFrom(children[idx])
}

function grabDropBarData(dropBar) {
    const titleElem = dropBar.querySelector(".Bar .Title .Holdable")
    let title = null
    for (let i = 0; i < titleElem.childNodes.length; i++) {
        title = titleElem.childNodes[i]
        if (title.nodeType === Node.TEXT_NODE) {
            title = title.textContent
            break
        }
        title = null
    }
    
    const iconElem = dropBar.querySelector("[data-testid='svg-icon']")
    const classList = [...iconElem.classList]
    const iconType = classList.filter((name) => name && name !== "SVGIcon")[0]
    return { title, iconType }
}

function grabFolderData(folder) {
    // TODO
}

it("renders without crashing", () => {
    const node = nodeStore.createNode("NoteBox")
    render(<BoardNode node={node.id} />, root)
})

it("renders with a CSS class", () => {
    const node = nodeStore.createNode("NoteBox")
    act(() => {
        render(<BoardNode node={node} />, root)
    })
    const boardNode = grabBoardNode()
    
    expect(boardNode).toHaveClass("BoardNode")
})

describe("node rendering tests", () => {
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
        const iconType = "magGlass"
        const node = nodeStore.createNode("DropBar", { title, iconType })
        act(() => {
            render(<BoardNode node={node} />, root)
        })
        const boardNode = grabBoardNode()
        const dropBar = grabChildFrom(boardNode)
        const dropBarData = grabDropBarData(dropBar)
        
        expect(dropBar).toHaveClass("DropBar")
        expect(dropBarData).toStrictEqual({ title, iconType })
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
        const noteBox = grabDropBarChildAt(dropBar, 0)
        const noteBoxData = grabNoteBoxData(noteBox)
        
        expect(noteBox).toHaveClass("NoteBox")
        expect(noteBoxData).toStrictEqual({ title, content })
    })
})

describe("context change listener tests", () => {
    describe("...for NoteBoxes", () => {
        it("triggers onNodeDataChange() when the title changes", () => {
            const title = "init title"
            const node = nodeStore.createNode("NoteBox", { title })
            const callbacks = { onNodeDataChange: jest.fn() }
            act(() => {
                render(<NoteBoardCallbacks.Provider value={callbacks}>
                    <BoardNode node={node} />
                </NoteBoardCallbacks.Provider>, root)
            })
            const boardNode = grabBoardNode()
            const noteBox = grabChildFrom(boardNode)
            const [titleField] = grabNoteBoxFields(noteBox)
            
            // change via textarea: handled
            const newTitleViaTextarea = "new title via textarea"
            act(() => {
                titleField.focus()
                titleField.value = newTitleViaTextarea
                titleField.blur()
            })
            
            expect(callbacks.onNodeDataChange).toHaveBeenCalledTimes(1)
            expect(callbacks.onNodeDataChange)
                .toHaveBeenCalledWith(node, "title", newTitleViaTextarea)
            
            // change via node: NOT handled
            const newTitleViaNode = "new title via node"
            act(() => {
                node.setData({ content: newTitleViaNode })
            })
            
            // should NOT have called onChange(); this simulated another
            // node changing (which would've called onChange() itself)
            expect(callbacks.onNodeDataChange).not.toHaveBeenCalledTimes(2)
            expect(callbacks.onNodeDataChange).toHaveBeenCalledTimes(1)
        })
        
        it("triggers onNodeDataChange() when the content changes", () => {
            const content = "init content"
            const node = nodeStore.createNode("NoteBox", { content })
            const callbacks = { onNodeDataChange: jest.fn() }
            act(() => {
                render(<NoteBoardCallbacks.Provider value={callbacks}>
                    <BoardNode node={node} />
                </NoteBoardCallbacks.Provider>, root)
            })
            const boardNode = grabBoardNode()
            const noteBox = grabChildFrom(boardNode)
            // eslint-disable-next-line no-unused-vars
            const [_, contentField] = grabNoteBoxFields(noteBox)
            
            // change via textarea: handled
            const newContentViaTextarea = "new content via textarea"
            act(() => {
                contentField.focus()
                contentField.value = newContentViaTextarea
                contentField.blur()
            })
            
            expect(callbacks.onNodeDataChange).toHaveBeenCalledTimes(1)
            expect(callbacks.onNodeDataChange).toHaveBeenCalledWith(node, "content", newContentViaTextarea)
            
            // change via node: NOT handled
            const newContentViaNode = "new content via node"
            act(() => {
                node.setData({ content: newContentViaNode })
            })
            
            // should NOT have called onChange(); this simulated another
            // node changing (which would've called its own onChange())
            expect(callbacks.onNodeDataChange).not.toHaveBeenCalledTimes(2)
            expect(callbacks.onNodeDataChange).toHaveBeenCalledTimes(1)
        })
    })
    
    // TODO: DropBar props.onChange()
})

// TODO: test that BoardNode subscriptions update the UI when a node changes

// TODO: test for removing notebox/dropbar children nodes when empty
