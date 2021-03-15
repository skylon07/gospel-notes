import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import DropMenu from "./DropMenu.js";

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

function grabDropMenu() {
    return document.querySelector("[data-testid='drop-menu']");
}

it("renders without crashing", () => {
    render(<DropMenu hidden />, root);
});

it("drops when not hidden", () => {
    act(() => {
        render(<DropMenu hidden={false} />, root);
    });
    const dropMenu = grabDropMenu();

    // NOTE: this doesn't seem to work (see the test below)
    // expect(dropMenu).toBeVisible();
    expect(dropMenu).toHaveClass("showing");
});

it("is raised when hidden", () => {
    act(() => {
        render(<DropMenu hidden={true} />, root);
    });
    const dropMenu = grabDropMenu();

    // NOTE: this does not seem to catch the opacity set in the .hidden CSS class
    // expect(dropMenu).not.toBeVisible();
    // NOTE: calculating style doesn't seem to work either
    // const style = window.getComputedStyle(dropMenu)
    // expect(style.height).toBe(0)
    // expect(style.display).toBe("flex") // is "block"?
    expect(dropMenu).toHaveClass("hiding");
});

// tests past the "initial state" logic
it("is raised after being dropped and raised", () => {
    act(() => {
        render(<DropMenu hidden={false} />, root);
    });
    const dropMenu = grabDropMenu();

    expect(dropMenu).toHaveClass("showing", "initAnimation");

    act(() => {
        render(<DropMenu hidden={true} />, root);
    });

    expect(dropMenu).toHaveClass("hiding");
});

it("is dropped after being raised and dropped", () => {
    act(() => {
        render(<DropMenu hidden={true} />, root);
    });
    const dropMenu = grabDropMenu();

    expect(dropMenu).toHaveClass("hiding", "initAnimation");

    act(() => {
        render(<DropMenu hidden={false} />, root);
    });

    expect(dropMenu).toHaveClass("showing");
});

it("triggers onClick() when clicked anywhere in the menu", () => {
    const onClick = jest.fn();
    act(() => {
        render(<DropMenu hidden={false} onClick={onClick} />, root);
    });
    const dropMenu = grabDropMenu();

    expect(onClick).not.toBeCalled();

    act(() => {
        dropMenu.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onClick).toBeCalledTimes(1);
});
