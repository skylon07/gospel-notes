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

function grabDraggable() {
    return document.querySelector("[data-testid='draggable']");
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
    const draggable = grabDraggable();

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

describe("ref tests", () => {
    it("correctly updates object-refs", () => {
        const dragRef = React.createRef();

        expect(dragRef.current).toBe(null);

        act(() => {
            render(<Draggable dragRef={dragRef} />, root);
        });

        expect(dragRef.current).not.toBe(null);
    });

    it("correctly updates function-refs", () => {
        const dragRef = jest.fn();
        expect(dragRef).not.toBeCalledWith(null);

        act(() => {
            render(<Draggable dragRef={dragRef} />, root);
        });

        expect(dragRef).toBeCalledTimes(1);
    });
});

describe("listener callbacks", () => {
    it("correctly calls beforeDrag()", () => {
        const beforeDrag = jest.fn();
        act(() => {
            render(
                <Draggable beforeDrag={beforeDrag}>
                    {renderDraggableContent()}
                </Draggable>,
                root
            );
        });
        const draggable = grabDraggable()

        expect(beforeDrag).not.toBeCalled();

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

        expect(beforeDrag).toBeCalledTimes(1);
    });

    it("correctly calls onDrag(diffX, diffY)", () => {
        const onDrag = jest.fn();
        act(() => {
            render(
                <Draggable onDrag={onDrag}>
                    {renderDraggableContent()}
                </Draggable>,
                root
            );
        });
        const draggable = grabDraggable();

        expect(onDrag).not.toBeCalled();

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

        expect(onDrag).toBeCalledTimes(1);
        expect(onDrag).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Number)
        );
        expect(onDrag).toHaveBeenLastCalledWith(100, 100); // dragging distance
    });

    it("correctly calls afterDrag()", () => {
        const afterDrag = jest.fn();
        act(() => {
            render(
                <Draggable afterDrag={afterDrag}>
                    {renderDraggableContent()}
                </Draggable>,
                root
            );
        });
        const draggable = grabDraggable();

        expect(afterDrag).not.toBeCalled();

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

        expect(afterDrag).not.toBeCalled();

        // release the element
        act(() => {
            draggable.dispatchEvent(
                new MouseEvent("mouseup", { bubbles: true })
            );
        });

        expect(afterDrag).toBeCalledTimes(1);
    });
});
