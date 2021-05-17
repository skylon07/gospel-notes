import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import AddButton from "./AddButton.js";

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

// TODO: these grab functions should probably be imported
//       instead of rewritten...
function grabAddButton() {
    return document.querySelector("[data-testid='add-button']")
}

it("renders without crashing", () => {
    render(<AddButton />, root)
})

it("renders with a CSS class", () => {
    act(() => {
        render(<AddButton />, root)
    })
    const addButton = grabAddButton()
    
    expect(addButton).toHaveClass("AddButton")
})
