import React from 'react'
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import NoteBoard from "./NoteBoard.js";

import { describe, it, test, expect, beforeAll, beforeEach, afterEach, afterAll, jest, setTimeout, setInterval, clearTimeout, clearInterval } from "/fakeJest.js";

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

function grabNoteBoard() {
    return document.querySelector("[data-testid='note-board']")
}

it("renders without crashing", () => {
    render(<NoteBoard />, root)
})