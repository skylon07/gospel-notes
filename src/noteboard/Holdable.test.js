import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import Holdable from "./Holdable.js";

jest.useFakeTimers("modern");

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

function grabHoldable() {
    return document.querySelector("[data-testid='holdable']");
}

it("renders without crashing", () => {
    render(<Holdable />, root);
});

it("calls onHold() when clicked and held", () => {
    const onHold = jest.fn();
    act(() => {
        render(<Holdable onHold={onHold} />, root);
    });
    const holdable = grabHoldable();

    // click on the holdable
    act(() => {
        holdable.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    });

    // onHold() should not have activated yet
    expect(onHold).not.toHaveBeenCalled();

    // wait some time...
    act(() => {
        jest.advanceTimersByTime(100);
    });

    // still should not have activated...
    expect(onHold).not.toHaveBeenCalled();

    // wait the rest of the time
    act(() => {
        jest.advanceTimersByTime(1000);
    });
    expect(onHold).toHaveBeenCalledTimes(1);
});
