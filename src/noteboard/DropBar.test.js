import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import DropBar from "./DropBar.js";

// NOTE: imported this way to manually mock SVGIcon
import * as SVGIconModule from "common/svg-icon";
// TODO: find a better way to mock with jest (that works)
const origSVGIcon = SVGIconModule.SVGIcon;

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

    // reset mock
    SVGIconModule.SVGIcon = origSVGIcon;
});

function grabDropBar() {
    return document.querySelector("[data-testid='drop-bar']");
}

function grabMainBarFrom(dropBar) {
    return dropBar.querySelector(".Bar");
}

function grabIconFrom(dropBar) {
    return dropBar.querySelector("[data-testid='svg-icon']");
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
        // mock SVGIcon to track "type"
        SVGIconModule.SVGIcon = class MockSVGIcon extends React.Component {
            render() {
                return <div data-testid="svg-icon">{this.props.type}</div>;
            }
        };

        const iconType = "this is a fake icon type";
        act(() => {
            render(<DropBar iconType={iconType} />, root);
        });
        const dropBar = grabDropBar();
        const icon = grabIconFrom(dropBar);

        expect(icon).toHaveTextContent(iconType);
    });
});

describe("drop button tests", () => {
    it("drops when the drop button is clicked", () => {
        act(() => {
            render(<DropBar />, root);
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
            render(<DropBar />, root);
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
    it("triggers onMouseHold() when holdable bar is held", () => {
        const onMouseHold = jest.fn();
        act(() => {
            render(<DropBar onMouseHold={onMouseHold} />, root);
        });
        const dropBar = grabDropBar();
        const mainBar = grabMainBarFrom(dropBar);

        expect(onMouseHold).not.toBeCalled();

        act(() => {
            mainBar.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });

        expect(onMouseHold).not.toBeCalled();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onMouseHold).toBeCalledTimes(1);
    });

    // NOTE: DropBarGroups are not used anymore; _beforeDrop is obsolete
    // it("triggers the hidden _beforeDrop(ref, dropped) prop", () => {
    //     const _beforeDrop = jest.fn();
    //     act(() => {
    //         render(<DropBar _beforeDrop={_beforeDrop} />, root);
    //     });
    //     const dropBar = grabDropBar();
    //     const dropButton = grabDropButtonFrom(dropBar);

    //     expect(_beforeDrop).not.toBeCalled();

    //     act(() => {
    //         dropButton.dispatchEvent(
    //             new MouseEvent("click", { bubbles: true })
    //         );
    //     });

    //     const wasDropped = false; // it was not dropped before the click
    //     expect(_beforeDrop).toBeCalledWith(expect.any(Object), wasDropped);
    //     expect(_beforeDrop).toBeCalledTimes(1);
    // });
});

describe("group animation tests", () => {
    it("applies dropping classes to elements below the one dropping", () => {
        const base = "DropBarTransform"
        const dropping = "dropping"
        const raising = "raising"
        act(() => {
            render(<DropBar _beforeDrop={_beforeDrop} />, root);
        });
        const dropBars = root.children
    
        for (const dropBar of dropBars) {
            // NOTE: not sure, but toHaveClass(base, dropping, raising) was
            //       avoided since .not is being used, and that behavior isn't
            //       understood (what if two of three classes were present?)
            expect(dropBar).not.toHaveClass(base);
            expect(dropBar).not.toHaveClass(dropping)
            expect(dropBar).not.toHaveClass(raising)
        }
    
        const dropIdx = 2;
        act(() => {
            const dropBarToClick = dropBars[dropIdx];
            const dropButton = grabDropButtonFrom(dropBarToClick);
            dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
        const base = "DropBarTransform"
        const dropping = "dropping"
        const raising = "raising"
        act(() => {
            render(renderSeveralDropBars(), root);
        });
        const dropBars = root.children
    
        for (const dropBar of dropBars) {
            // NOTE: not sure, but toHaveClass(base, dropping, raising) was
            //       avoided since .not is being used, and that behavior isn't
            //       understood (what if two of three classes were present?)
            expect(dropBar).not.toHaveClass(base);
            expect(dropBar).not.toHaveClass(dropping)
            expect(dropBar).not.toHaveClass(raising)
        }
    
        const dropIdx = 1;
        const dropBarToClick = dropBars[dropIdx];
        const dropButton = grabDropButtonFrom(dropBarToClick);
        act(() => {
            dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // wait for drop (seperate "act()")
        act(() => {
            dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
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
})

// TODO: maybe provide some animation tests, since it
// primarilly applies animations to grouped children
