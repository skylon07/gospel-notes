import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import TopBar from "./TopBar.js";

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

function grabTopBar() {
    return document.querySelector("[data-testid='top-bar']");
}

function grabMainMenuFrom(topBar) {
    const mainMenu = topBar.querySelector("[data-testid='drop-menu']");
    return mainMenu;
}

function grabSearchAndBackButtonFrom(topBar) {
    const search = topBar.querySelector(
        ".AnimationBounds .Nav [data-testid='top-bar-button']:last-child"
    );
    const back = topBar.querySelector(
        ".AnimationBounds .Search [data-testid='top-bar-button']"
    );
    return [search, back];
}

function grabNavAndSearchBoundsFrom(topBar) {
    const nav = topBar.querySelector(".AnimationBounds .Nav");
    const search = topBar.querySelector(".AnimationBounds .Search");
    return [nav, search];
}

function grabMenuChildrenFrom(menu) {
    const menuBox = menu.querySelector("[data-testid='drop-menu-box']")
    const allChildren = [...menuBox.childNodes]
    return allChildren.filter((child) => !child.className.includes("Shadow"))
}

it("renders without crashing", () => {
    render(<TopBar />, root);
});

it("renders with a CSS class", () => {
    act(() => {
        render(<TopBar />, root)
    })
    const topBar = grabTopBar()
    
    expect(topBar).toHaveClass("TopBar")
})

describe("menu tests", () => {
    it("renders the correct menu content to the menu", () => {
        const menuContent = [
            <button key="0">b0</button>,
            <button key="1">b1</button>,
            <button key="2">b2</button>,
            <p key="3">p3</p>,
            <button key="4">b4</button>,
        ];
        act(() => {
            render(<TopBar menuContent={menuContent} />, root);
        });
        const topBar = grabTopBar();
        const mainMenu = grabMainMenuFrom(topBar);

        // compare children
        const children = grabMenuChildrenFrom(mainMenu)
        expect(children.length).toBe(menuContent.length);
        for (let i = 0; i < children.length; i++) {
            const renderedChild = children[i];
            const childElement = menuContent[i];

            // compare tags
            const renderedTag = renderedChild.tagName.toLowerCase()
            const expectedTag = childElement.type.toLowerCase()
            expect(renderedTag).toBe(expectedTag);
            // compare innerHTML
            const innerHTML = childElement.props.children
            expect(renderedChild).toHaveTextContent(innerHTML);
        }
    });
});

describe("search bar tests", () => {
    it("shows the search bar when the search button is clicked", () => {
        act(() => {
            render(<TopBar />, root);
        });
        const topBar = grabTopBar();
        const [nav, search] = grabNavAndSearchBoundsFrom(topBar);
        const [searchButton] = grabSearchAndBackButtonFrom(topBar);

        expect(nav).toHaveClass("Uncollapsed");
        expect(search).toHaveClass("Collapsed");

        // Click the main menu button
        //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
        act(() => {
            searchButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        expect(nav).toHaveClass("Collapsed");
        expect(search).toHaveClass("Uncollapsed");
    });

    it("hides the search bar when the search button and then back button is clicked", () => {
        act(() => {
            render(<TopBar />, root);
        });
        const topBar = grabTopBar();
        const [nav, search] = grabNavAndSearchBoundsFrom(topBar);
        const [searchButton, backButton] = grabSearchAndBackButtonFrom(topBar);

        expect(nav).toHaveClass("Uncollapsed");
        expect(search).toHaveClass("Collapsed");

        // Click the main menu button
        //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
        act(() => {
            searchButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
            backButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        expect(nav).toHaveClass("Uncollapsed");
        expect(search).toHaveClass("Collapsed");
    });
});

describe("listener callback tests", () => {
    // TODO: complete this test when buttons are introduced
    // it("triggers onButtonClick()", () => {
    //     const onButtonClick = jest.fn();
    //     act(() => {
    //         render(<TopBar onButtonClick={onButtonClick} />, root);
    //     });
    // });

    it("triggers onModeChange()", () => {
        const onModeChange = jest.fn();
        act(() => {
            render(<TopBar onModeChange={onModeChange} />, root);
        });
        const topBar = grabTopBar();
        const [searchButton, backButton] = grabSearchAndBackButtonFrom(topBar);

        expect(onModeChange).not.toBeCalled();

        act(() => {
            searchButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        expect(onModeChange).toBeCalledTimes(1);
        expect(onModeChange).lastCalledWith("search")
        
        act(() => {
            backButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });
        
        expect(onModeChange).toBeCalledTimes(2);
        expect(onModeChange).lastCalledWith("nav")
    })
});
