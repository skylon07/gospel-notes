import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
// import { act } from "react-dom/test-utils"
import { ConstantTextNode, StaticTextNode } from ".";

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

describe("constant nodes", () => {
    it("renders without crashing", () => {
        render(<ConstantTextNode />, root);
    });

    // NOTE: not really sure how to mock element sizes while
    //       maintaining meaningful tests...
});

describe("static nodes", () => {
    it("renders without crashing", () => {
        render(<StaticTextNode />, root);
    });
});
