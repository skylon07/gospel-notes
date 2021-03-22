import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import Draggable from "./Draggable.js";

// NOTE: modern is required as it allows setState() to run inside timeouts
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

// just some content for the draggable to have shape...
function renderDraggableContent() {
    return (
        <div
            style={{
                width: "100px",
                height: "100px",
            }}
        />
    );
}

it("renders without crashing", () => {
    render(<Draggable />, root);
});

it("moves when clicked and dragged across the screen", () => {
    // initial render of the component; act() is used since we are using the DOM
    act(() => {
        render(<Draggable>{renderDraggableContent()}</Draggable>, root);
    });
    // record some elements for later use
    const draggable = document.querySelector("[aria-label='draggable']");

    // the element should not have moved/transformed at all
    expect(draggable).toHaveStyle({ transform: null });

    // click the element and drag it 250ms later
    act(() => {
        draggable.dispatchEvent(
            new MouseEvent("mousedown", {
                bubbles: true,
                clientX: 50,
                clientY: 50,
            })
        );
        jest.advanceTimersByTime(250);
        draggable.dispatchEvent(
            new MouseEvent("mousemove", {
                bubbles: true,
                clientX: 150,
                clientY: 150,
            })
        );
    });

    // make sure the element moved the correct distance
    expect(draggable).toHaveStyle({ transform: "translate(100px, 100px)" });

    // drag the element some more
    act(() => {
        draggable.dispatchEvent(
            new MouseEvent("mousemove", {
                bubbles: true,
                cancelable: true,
                clientX: 200,
                clientY: 200,
            })
        );
    });

    // make sure the element moved the correct distance
    expect(draggable).toHaveStyle({ transform: "translate(150px, 150px)" });
});
