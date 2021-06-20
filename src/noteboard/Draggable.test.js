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
    
    updateTouchId()
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;
});

let currTouchId = 0
function updateTouchId() {
    currTouchId = Date.now()
}

// NOTE: an object with clientX/Y normally suffices, but
//       spck env requires me to generate actual touches
function makeTouch(target, clientX, clientY) {
    if (window.Touch) {
        return new Touch({
            identifier: currTouchId,
            target,
            clientX,
            clientY,
        })
    } else {
        return {
            target,
            clientX,
            clientY,
        }
    }
}

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

it("renders with a CSS class", () => {
    act(() => {
        render(<Draggable />, root)
    })
    const draggable = grabDraggable()
    
    expect(draggable).toHaveClass("Draggable")
})

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

it("moves when touched and dragged across the screen", () => {
    act(() => {
        render(<Draggable>{renderDraggableContent()}</Draggable>, root);
    });
    const draggable = grabDraggable();

    expect(draggable).toHaveStyle({ transform: null });

    // tap the element and drag it 250ms later
    act(() => {
        draggable.dispatchEvent(
            new TouchEvent("touchstart", {
                bubbles: true,
                touches: [
                    makeTouch(draggable, 50, 50),
                ],
            })
        );
        jest.advanceTimersByTime(250);
        draggable.dispatchEvent(
            new TouchEvent("touchmove", {
                bubbles: true,
                touches: [
                    makeTouch(draggable, 150, 150),
                ],
            })
        );
    });

    // make sure the element moved the correct distance
    expect(draggable).toHaveStyle({ transform: "translate(100px, 100px)" });

    // drag the element some more
    act(() => {
        draggable.dispatchEvent(
            new TouchEvent("touchmove", {
                bubbles: true,
                cancelable: true,
                touches: [
                    makeTouch(draggable, 200, 200),
                ],
            })
        );
    });

    // make sure the element moved the correct distance
    expect(draggable).toHaveStyle({ transform: "translate(150px, 150px)" });
});

// NOTE: this is currently not aupported, however may be brought back if required
// describe("ref tests", () => {
//    it("correctly updates dragRef when given object-refs", () => {
//        const dragRef = React.createRef();
//        expect(dragRef.current).toBe(null);
//         act(() => {
//             render(<Draggable dragRef={dragRef} />, root);
//         });
// 
//         expect(dragRef.current).not.toBe(null);
//     });
// 
//     it("correctly updates dragRef when given function-refs", () => {
//         const dragRef = jest.fn();
//         expect(dragRef).not.toHaveBeenCalledWith(null);
// 
//         act(() => {
//             render(<Draggable dragRef={dragRef} />, root);
//         });
// 
//         expect(dragRef).toHaveBeenCalledTimes(1);
//     });
// });

describe("listener callback tests", () => {
    describe("...using mouse events", () => {
        it("correctly calls beforeDrag(rect)", () => {
            const beforeDrag = jest.fn();
            act(() => {
                render(
                    <Draggable beforeDrag={beforeDrag}>
                        {renderDraggableContent()}
                    </Draggable>,
                    root
                );
            });
            const draggable = grabDraggable();

            expect(beforeDrag).not.toHaveBeenCalled();

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

            expect(beforeDrag).toHaveBeenCalledTimes(1);
            expect(beforeDrag).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 0,
                    y: 0,
                    left: 0,
                    top: 0,
                    right: expect.any(Number),
                    bottom: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number),
                })
            );
        });

        it("correctly calls onDrag(rect)", () => {
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

            expect(onDrag).not.toHaveBeenCalled();

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

            expect(onDrag).toHaveBeenCalledTimes(1);
            expect(onDrag).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 100,
                    y: 100,
                    left: 100,
                    top: 100,
                    right: expect.any(Number),
                    bottom: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number),
                })
            );
        });

        it("correctly calls afterDrag(rect)", () => {
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

            expect(afterDrag).not.toHaveBeenCalled();

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

            expect(afterDrag).not.toHaveBeenCalled();

            // release the element
            act(() => {
                draggable.dispatchEvent(
                    new MouseEvent("mouseup", { bubbles: true })
                );
            });

            expect(afterDrag).toHaveBeenCalledTimes(1);
            expect(afterDrag).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 100,
                    y: 100,
                    left: 100,
                    top: 100,
                    right: expect.any(Number),
                    bottom: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number),
                })
            );
        });
    });

    describe("...using touch events", () => {
        it("correctly calls beforeDrag(rect)", () => {
            const beforeDrag = jest.fn();
            act(() => {
                render(
                    <Draggable beforeDrag={beforeDrag}>
                        {renderDraggableContent()}
                    </Draggable>,
                    root
                );
            });
            const draggable = grabDraggable();

            expect(beforeDrag).not.toHaveBeenCalled();

            // tap the element and drag it 250ms later
            act(() => {
                draggable.dispatchEvent(
                    new TouchEvent("touchstart", {
                        bubbles: true,
                        touches: [
                            makeTouch(draggable, 50, 50),
                        ],
                    })
                );
                jest.advanceTimersByTime(250);
                draggable.dispatchEvent(
                    new TouchEvent("touchmove", {
                        bubbles: true,
                        touches: [
                            makeTouch(draggable, 150, 150),
                        ],
                    })
                );
            });
            
            expect(beforeDrag).toHaveBeenCalledTimes(1);
            expect(beforeDrag).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 0,
                    y: 0,
                    left: 0,
                    top: 0,
                    right: expect.any(Number),
                    bottom: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number),
                })
            );
        });

        it("correctly calls onDrag(rect)", () => {
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

            expect(onDrag).not.toHaveBeenCalled();

            // click the element and drag it 250ms later
            act(() => {
                draggable.dispatchEvent(
                    new TouchEvent("touchstart", {
                        bubbles: true,
                        touches: [
                            makeTouch(draggable, 50, 50),
                        ],
                    })
                );
                jest.advanceTimersByTime(250);
                draggable.dispatchEvent(
                    new TouchEvent("touchmove", {
                        bubbles: true,
                        touches: [
                            makeTouch(draggable, 150, 150),
                        ],
                    })
                );
            });

            expect(onDrag).toHaveBeenCalledTimes(1);
            expect(onDrag).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 100,
                    y: 100,
                    left: 100,
                    top: 100,
                    right: expect.any(Number),
                    bottom: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number),
                })
            );
        });

        it("correctly calls afterDrag(rect)", () => {
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

            expect(afterDrag).not.toHaveBeenCalled();

            // click the element and drag it 250ms later
            act(() => {
                draggable.dispatchEvent(
                    new TouchEvent("touchstart", {
                        bubbles: true,
                        touches: [
                            makeTouch(draggable, 50, 50),
                        ],
                    })
                );
                jest.advanceTimersByTime(250);
                draggable.dispatchEvent(
                    new TouchEvent("touchmove", {
                        bubbles: true,
                        touches: [
                            makeTouch(draggable, 150, 150),
                        ],
                    })
                );
            });

            expect(afterDrag).not.toHaveBeenCalled();

            // release the element
            act(() => {
                draggable.dispatchEvent(
                    new TouchEvent("touchend", { bubbles: true })
                );
            });

            expect(afterDrag).toHaveBeenCalledTimes(1);
            expect(afterDrag).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: 100,
                    y: 100,
                    left: 100,
                    top: 100,
                    right: expect.any(Number),
                    bottom: expect.any(Number),
                    width: expect.any(Number),
                    height: expect.any(Number),
                })
            );
        });
    });
});
