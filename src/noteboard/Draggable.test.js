import React from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, fireEvent, screen, act } from "@testing-library/react";

import Draggable from "./Draggable.js";

// NOTE: modern is required as it allows setState() to run inside timeouts
jest.useFakeTimers("modern");

// real dom is needed for dragging tests
// TODO: is DOM really needed though?
let container = null;
beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
});

afterEach(() => {
    unmountComponentAtNode(container);
    document.body.removeChild(container);
    container = null;
});

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Draggable />, div);
});

it("moves when clicked and dragged across the screen", () => {
    // initial render of the component; act() is used since we are using the DOM
    act(() => {
        ReactDOM.render(
            <Draggable>
                <div
                    data-testid="dragSquare"
                    style={{
                        width: "100px",
                        height: "100px",
                    }}
                />
            </Draggable>,
            container
        );
    });
    // record some elements for later use
    const draggable = document.querySelector("[aria-label='draggable']");
    const dragSquare = document.querySelector("[data-testid='dragSquare']");

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
