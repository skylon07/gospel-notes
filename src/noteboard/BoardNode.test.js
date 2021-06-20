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

describe("change listener tests", () => {
    describe("Node-change listener", () => {
        it("rerenders when the node changes", () => {
            const node = nodeStore.createNode("NoteBox")
            const onRender = jest.fn()
            act(() => {
                render(<React.Profiler
                    id="BoardNode"
                    onRender={onRender}
                >
                    <BoardNode node={node} />
                </React.Profiler>, root)
            })
    
            expect(onRender).toHaveBeenCalledTimes(1)
    
            const title = "title"
            const content = "content"
            act(() => {
                node.setData({ title, content })
            })
    
            expect(onRender).toHaveBeenCalledTimes(2)
        })
    })
    
    describe("NoteBox props.onChange()", () => {
        it("triggers onChange() when the title changes", () => {
            const title = "init title"
            const node = nodeStore.createNode("NoteBox", { title })
            const onChange = jest.fn()
            act(() => {
                render(<BoardNode node={node} onChange={onChange} />, root)
            })
            const boardNode = grabBoardNode()
            const noteBox = grabChildFrom(boardNode)
            const [titleField] = grabNoteBoxFields(noteBox)
            
            // change via textarea
            const newTitleViaTextarea = "new title via textarea"
            act(() => {
                titleField.focus()
                titleField.value = newTitleViaTextarea
                titleField.blur()
            })
            
            expect(onChange).toHaveBeenCalledTimes(1)
            expect(onChange).toHaveBeenCalledWith(node, "title", newTitleViaTextarea)
            
            // change via node
            const newTitleViaNode = "new title via node"
            act(() => {
                node.setData({ title: newTitleViaNode })
            })
            
            // should NOT have called onChange(); this simulated another
            // node changing (which would've called its own onChange())
            expect(onChange).not.toHaveBeenCalledTimes(2)
            expect(onChange).toHaveBeenCalledTimes(1)
        })
        
        it("triggers onChange() when the content changes", () => {
            const content = "init content"
            const node = nodeStore.createNode("NoteBox", { content })
            const onChange = jest.fn()
            act(() => {
                render(<BoardNode node={node} onChange={onChange} />, root)
            })
            const boardNode = grabBoardNode()
            const noteBox = grabChildFrom(boardNode)
            const [_, contentField] = grabNoteBoxFields(noteBox)
            
            // change via textarea
            const newContentViaTextarea = "new content via textarea"
            act(() => {
                contentField.focus()
                contentField.value = newContentViaTextarea
                contentField.blur()
                // console.log(contentField) // DEBUG
            })
            
            expect(onChange).toHaveBeenCalledTimes(1)
            expect(onChange).toHaveBeenCalledWith(node, "content", newContentViaTextarea)
            
            // change via node
            const newContentViaNode = "new content via node"
            act(() => {
                node.setData({ content: newContentViaNode })
            })
            
            // should NOT have called onChange(); this simulated another
            // node changing (which would've called its own onChange())
            expect(onChange).not.toHaveBeenCalledTimes(2)
            expect(onChange).toHaveBeenCalledTimes(1)
        })
    })
    
    // TODO: DropBar props.onChange()
})

// TODO: test for removing notebox children nodes when empty
