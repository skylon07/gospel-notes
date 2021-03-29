import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { SVGIcon } from ".";

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

function grabSVGIcon() {
    return document.querySelector("[data-testid='svg-icon']");
}

it("renders without crashing", () => {
    render(<SVGIcon />, root);
});

it("renders a blank icon by default", () => {
    act(() => {
        render(<SVGIcon />, root);
    });
    const icon = grabSVGIcon();
    const svg = icon.querySelector("svg");

    // NOTE: this assumes a blank icon is an SVG with no children
    expect(svg).toBeEmptyDOMElement();
});

it("renders an icon when provided with a type", () => {
    act(() => {
        render(<SVGIcon type="burger" />, root);
    });
    const icon = grabSVGIcon();
    const svg = icon.querySelector("svg");

    // NOTE: this also tests that the bars/burger icon consists of three lines;
    //       that is less important than the fact it simply has an icon
    expect(svg.children.length).toBe(3);
    for (const child of svg.children) {
        expect(child.tagName.toLowerCase()).toBe("line");
    }
});
