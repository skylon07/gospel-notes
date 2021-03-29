import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import DropBarGroup from "./DropBarGroup.js";
import DropBar from "./DropBar.js";

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

function grabDropBarGroup() {
    return document.querySelector("[data-testid='drop-bar-group']");
}

function grabDropBarsFrom(dropBarGroup) {
    return dropBarGroup.querySelectorAll("[data-testid='drop-bar']");
}

function grabDropButtonFrom(dropBar) {
    return dropBar.querySelector("[data-testid='dropdown-button']");
}

it("renders without crashing", () => {
    render(<DropBarGroup />, root);
});

it("applies dropping classes to elements below the one dropping", () => {
    act(() => {
        render(<DropBarGroup>{renderSeveralDropBars()}</DropBarGroup>, root);
    });
    const group = grabDropBarGroup();
    const dropBars = grabDropBarsFrom(group);

    for (const dropBar of dropBars) {
        // NOTE: testing for DropChild isn't necessary for this test, since it just
        //       helps describe the subclass more specifically
        // expect(dropBar).toHaveClass("DropChild");
        expect(dropBar).not.toHaveClass("dropping");
        expect(dropBar).not.toHaveClass("raising");
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
            // expect(dropBar).toHaveClass("DropChild");
            expect(dropBar).not.toHaveClass("dropping");
            expect(dropBar).not.toHaveClass("raising");
        } else if (i > dropIdx) {
            // expect(dropBar).toHaveClass("DropChild dropping");
            expect(dropBar).toHaveClass("dropping");
            expect(dropBar).not.toHaveClass("raising");
        }
    }
});

it("applies raising classes to elements below the one raising", () => {
    act(() => {
        render(<DropBarGroup>{renderSeveralDropBars()}</DropBarGroup>, root);
    });
    const group = grabDropBarGroup();
    const dropBars = grabDropBarsFrom(group);

    for (const dropBar of dropBars) {
        // NOTE: testing for DropChild isn't necessary for this test, since it just
        //       helps describe the subclass more specifically
        // expect(dropBar).toHaveClass("DropChild");
        expect(dropBar).not.toHaveClass("dropping");
        expect(dropBar).not.toHaveClass("raising");
    }

    const dropIdx = 1;
    const dropBarToClick = dropBars[dropIdx];
    const dropButton = grabDropButtonFrom(dropBarToClick);
    act(() => {
        dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    // wait for drop
    act(() => {
        dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    for (let i = 0; i < dropBars.length; i++) {
        const dropBar = dropBars[i];

        if (i <= dropIdx) {
            // expect(dropBar).toHaveClass("DropChild");
            expect(dropBar).not.toHaveClass("dropping");
            expect(dropBar).not.toHaveClass("raising");
        } else if (i > dropIdx) {
            // expect(dropBar).toHaveClass("DropChild raising");
            expect(dropBar).toHaveClass("raising");
            expect(dropBar).not.toHaveClass("dropping");
        }
    }
});
// TODO: maybe provide some animation tests, since it
// primarilly applies animations to grouped children
