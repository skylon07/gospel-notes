import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
// import { act } from "react-dom/test-utils";
import MainApp from "./MainApp.js";

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

it("renders without crashing", () => {
    render(<MainApp />, root);
});

// TODO: do we need to write more tests for this...?
