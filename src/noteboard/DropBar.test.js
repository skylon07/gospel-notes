import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import DropBar from "./DropBar.js";

jest.useFakeTimers("modern");

let root = null;
const origRequestAnimationFrame = window.requestAnimationFrame;
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);

    // TODO: should probably use setTimeout() or some async function
    //       to test this
    window.requestAnimationFrame = (callback) => callback();
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;

    window.requestAnimationFrame = origRequestAnimationFrame;
});

function grabDropBar() {
    return document.querySelector("[data-testid='drop-bar']");
}

function grabMainBarFrom(dropBar) {
    return dropBar.querySelector(".Bar");
}

function grabTitleHoldableFrom(dropBar) {
    return dropBar.querySelector(".Bar .Title .Holdable");
}

function grabIconHoldableFrom(dropBar) {
    return dropBar.querySelector(".Bar .Icon .Holdable");
}

function grabIconTypeFrom(dropBar) {
    const iconElem = dropBar.querySelector("[data-testid='svg-icon']");
    const classList = [...iconElem.classList];
    return classList.filter((name) => name && name !== "SVGIcon")[0];
}

function grabDropButtonFrom(dropBar) {
    return dropBar.querySelector("[data-testid='dropdown-button']");
}

function grabContentFrom(dropBar) {
    return dropBar.querySelector("[data-testid='drop-bar-content']");
}

function renderSeveralDropBars() {
    return (
        <React.Fragment>
            <DropBar />
            <DropBar />
            <DropBar />
            <DropBar />
            <DropBar />
        </React.Fragment>
    );
}

it("renders without crashing", () => {
    render(<DropBar />, root);
});

it("renders with a CSS class", () => {
    act(() => {
        render(<DropBar />, root);
    });
    const dropBar = grabDropBar();

    expect(dropBar).toHaveClass("DropBar");
});

describe("rendering tests", () => {
    it("renders a title", () => {
        const title = "this is the title string to look for";
        act(() => {
            render(<DropBar title={title} />, root);
        });
        const dropBar = grabDropBar();
        const mainBar = grabMainBarFrom(dropBar);

        expect(mainBar).toHaveTextContent(title);
    });

    it("renders the correct icon type", () => {
        const iconType = "burger";
        act(() => {
            render(<DropBar iconType={iconType} />, root);
        });
        const dropBar = grabDropBar();
        const icon = grabIconTypeFrom(dropBar);

        expect(icon).toBe(iconType);
    });
});

describe("drop button tests", () => {
    it("drops when the drop button is clicked", () => {
        act(() => {
            render(<DropBar initDropped={false} />, root);
        });
        const dropBar = grabDropBar();
        const dropContent = grabContentFrom(dropBar);
        const dropButton = grabDropButtonFrom(dropBar);

        // ensure the drop bar is not dropped
        expect(dropContent).toHaveClass("raised");
        expect(dropButton).toHaveClass("raised");

        // click the dropper button
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        // ensure the drop bar and button are dropped now
        expect(dropContent).toHaveClass("dropped");
        expect(dropButton).toHaveClass("dropped");
    });

    it("raises when the drop button is clicked twice", () => {
        act(() => {
            // TODO: create a different test for initDropped, and then only
            //       click once this test
            render(<DropBar initDropped={false} />, root);
        });
        const dropBar = grabDropBar();
        const dropContent = grabContentFrom(dropBar);
        const dropButton = grabDropButtonFrom(dropBar);

        // ensure the drop bar is not dropped
        expect(dropContent).toHaveClass("raised");
        expect(dropButton).toHaveClass("raised");

        // click the dropper button twice
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        // ensure the drop bar and button are dropped now
        expect(dropContent).toHaveClass("raised");
        expect(dropButton).toHaveClass("raised");
    });
});

describe("listener callback tests", () => {
    it("triggers onTitleHold() when holdable title is held", () => {
        const onTitleHold = jest.fn();
        act(() => {
            render(<DropBar onTitleHold={onTitleHold} />, root);
        });
        const dropBar = grabDropBar();
        const holdable = grabTitleHoldableFrom(dropBar);

        expect(onTitleHold).not.toHaveBeenCalled();

        act(() => {
            holdable.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });

        expect(onTitleHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onTitleHold).toHaveBeenCalledTimes(1);
    });

    it("triggers onIconHold() when holdable icon is held", () => {
        const onIconHold = jest.fn();
        act(() => {
            render(<DropBar onIconHold={onIconHold} />, root);
        });
        const dropBar = grabDropBar();
        const holdable = grabIconHoldableFrom(dropBar);

        expect(onIconHold).not.toHaveBeenCalled();

        act(() => {
            holdable.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });

        expect(onIconHold).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onIconHold).toHaveBeenCalledTimes(1);
    });

    // TODO: remove at a later date, when this is *for sure* no longer needed
    // XXX: DropBarGroups are not used anymore; _beforeDrop is obsolete
    // it("triggers the hidden _beforeDrop(ref, dropped) prop", () => {
    //     const _beforeDrop = jest.fn();
    //     act(() => {
    //         render(<DropBar _beforeDrop={_beforeDrop} />, root);
    //     });
    //     const dropBar = grabDropBar();
    //     const dropButton = grabDropButtonFrom(dropBar);

    //     expect(_beforeDrop).not.toHaveBeenCalled();

    //     act(() => {
    //         dropButton.dispatchEvent(
    //             new MouseEvent("click", { bubbles: true })
    //         );
    //     });

    //     const wasDropped = false; // it was not dropped before the click
    //     expect(_beforeDrop).toHaveBeenCalledWith(expect.any(Object), wasDropped);
    //     expect(_beforeDrop).toHaveBeenCalledTimes(1);
    // });
});

describe("group animation tests", () => {
    it("applies dropping classes to elements below the one dropping", () => {
        const base = "DropBarTransform";
        const dropping = "dropping";
        const raising = "raising";
        act(() => {
            render(renderSeveralDropBars(), root);
        });
        const dropBars = root.children;

        for (const dropBar of dropBars) {
            // not sure, but toHaveClass(base, dropping, raising) was
            // avoided since .not is being used, and that behavior isn't
            // understood (what if two of three classes were present?)
            expect(dropBar).not.toHaveClass(base);
            expect(dropBar).not.toHaveClass(dropping);
            expect(dropBar).not.toHaveClass(raising);
        }

        const dropIdx = 2;
        const dropBarToClick = dropBars[dropIdx];
        const dropButton = grabDropButtonFrom(dropBarToClick);
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        for (let i = 0; i < dropBars.length; i++) {
            const dropBar = dropBars[i];
            if (i <= dropIdx) {
                expect(dropBar).not.toHaveClass(base);
                expect(dropBar).not.toHaveClass(dropping);
                expect(dropBar).not.toHaveClass(raising);
            } else if (i > dropIdx) {
                expect(dropBar).toHaveClass(base);
                expect(dropBar).toHaveClass(dropping);
                expect(dropBar).not.toHaveClass(raising);
            }
        }
    });

    it("applies raising classes to elements below the one raising", () => {
        const base = "DropBarTransform";
        const dropping = "dropping";
        const raising = "raising";
        act(() => {
            render(renderSeveralDropBars(), root);
        });
        const dropBars = root.children;

        for (const dropBar of dropBars) {
            // not sure, but toHaveClass(base, dropping, raising) was
            // avoided since .not is being used, and that behavior isn't
            // understood (what if two of three classes were present?)
            expect(dropBar).not.toHaveClass(base);
            expect(dropBar).not.toHaveClass(dropping);
            expect(dropBar).not.toHaveClass(raising);
        }

        const dropIdx = 1;
        const dropBarToClick = dropBars[dropIdx];
        const dropButton = grabDropButtonFrom(dropBarToClick);
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });
        // wait for drop (seperate "act()")
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        for (let i = 0; i < dropBars.length; i++) {
            const dropBar = dropBars[i];
            if (i <= dropIdx) {
                expect(dropBar).not.toHaveClass(base);
                expect(dropBar).not.toHaveClass(dropping);
                expect(dropBar).not.toHaveClass(raising);
            } else if (i > dropIdx) {
                expect(dropBar).toHaveClass(base);
                expect(dropBar).not.toHaveClass(dropping);
                expect(dropBar).toHaveClass(raising);
            }
        }
    });

    // TODO: animation tests that test up the DOM heirarchy with DropBars on
    //       various levels
});
