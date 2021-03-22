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

function grabMainMenuAndButtonFrom(topBar) {
    const mainMenu = topBar.querySelector("[data-testid='drop-menu']");
    const mainMenuButton = topBar.querySelector(
        ".AnimationBounds + [data-testid='top-bar-button']"
    );
    return [mainMenu, mainMenuButton];
}

function grabSearchAndBackButtonFrom(topBar) {
    const search = topBar.querySelector(
        ".AnimationBounds .Main [data-testid='top-bar-button']:last-child"
    );
    const back = topBar.querySelector(
        ".AnimationBounds .Search [data-testid='top-bar-button']"
    );
    return [search, back];
}

function grabMainAndSearchBoundsFrom(topBar) {
    const main = topBar.querySelector(".AnimationBounds .Main");
    const search = topBar.querySelector(".AnimationBounds .Search");
    return [main, search];
}

it("renders without crashing", () => {
    render(<TopBar />, root);
});

describe("menu tests", () => {
    it("shows the main menu when the menu button is clicked", () => {
        act(() => {
            render(<TopBar />, root);
        });
        const topBar = grabTopBar();
        const [mainMenu, mainMenuButton] = grabMainMenuAndButtonFrom(topBar);

        // Make sure the main menu is not visible by default
        // TODO: Should probably find a better way than just to check for the class
        expect(mainMenu).toHaveClass("hiding");
        //expect(screen.getByLabelText("main-menu")).toHaveClass("hiding");

        // Click the main menu button
        act(() => {
            mainMenuButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });
        //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));

        // Make sure the main menu is displayed now
        expect(mainMenu).toHaveClass("showing");
        //expect(screen.getByLabelText("main-menu")).toHaveClass("showing");
    });

    it("hides the main menu when the menu button is clicked twice", () => {
        act(() => {
            render(<TopBar />, root);
        });
        const topBar = grabTopBar();
        const [mainMenu, mainMenuButton] = grabMainMenuAndButtonFrom(topBar);

        // Make sure the main menu is not visible by default
        expect(mainMenu).toHaveClass("hiding");
        //expect(screen.getByLabelText("main-menu")).toHaveClass("hiding");

        // Click the main menu button
        //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
        act(() => {
            mainMenuButton.dispatchEvent(
                new MouseEvent("click", { blubbles: true })
            );
            mainMenuButton.dispatchEvent(
                new MouseEvent("click", { blubbles: true })
            );
        });

        // Make sure the main menu is hidden now
        expect(mainMenu).toHaveClass("hiding");
        //expect(screen.getByLabelText("main-menu")).toHaveClass("showing");
    });

    it("force-hides/shows the menu when a boolean is given", () => {
        act(() => {
            render(<TopBar forceMenuHidden={true} />, root);
        });
        const topBar = grabTopBar();
        const [mainMenu, mainMenuButton] = grabMainMenuAndButtonFrom(topBar);

        expect(mainMenu).toHaveClass("hiding");

        act(() => {
            render(<TopBar forceMenuHidden={false} />, root);
        });

        expect(mainMenu).toHaveClass("showing");

        act(() => {
            mainMenuButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
            render(<TopBar forceMenuHidden={false} />, root);
        });

        expect(mainMenu).toHaveClass("showing");
    });

    it("does not force-hide/show the menu when null or undefined", () => {
        act(() => {
            // this prop is intended to be undefined
            render(<TopBar forceMenuHidde={undefined} />, root);
        });
        const topBar = grabTopBar();
        const [mainMenu, mainMenuButton] = grabMainMenuAndButtonFrom(topBar);

        expect(mainMenu).toHaveClass("hiding");

        act(() => {
            render(<TopBar forceMenuHidden={null} />, root);
        });

        expect(mainMenu).toHaveClass("hiding");

        act(() => {
            mainMenuButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
            render(<TopBar forceMenuHidden={null} />, root);
        });

        expect(mainMenu).toHaveClass("showing");

        act(() => {
            // this prop is intended to be undefined
            render(<TopBar forceMenuHidden={undefined} />, root);
        });

        expect(mainMenu).toHaveClass("showing");
    });
});

describe("search bar tests", () => {
    it("shows the search bar when the search button is clicked", () => {
        act(() => {
            render(<TopBar />, root);
        });
        const topBar = grabTopBar();
        const [main, search] = grabMainAndSearchBoundsFrom(topBar);
        const [searchButton] = grabSearchAndBackButtonFrom(topBar);

        expect(main).toHaveClass("Uncollapsed");
        expect(search).toHaveClass("Collapsed");

        // Click the main menu button
        //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
        act(() => {
            searchButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        expect(main).toHaveClass("Collapsed");
        expect(search).toHaveClass("Uncollapsed");
    });

    it("hides the search bar when the search button and then back button is clicked", () => {
        act(() => {
            render(<TopBar />, root);
        });
        const topBar = grabTopBar();
        const [main, search] = grabMainAndSearchBoundsFrom(topBar);
        const [searchButton, backButton] = grabSearchAndBackButtonFrom(topBar);

        expect(main).toHaveClass("Uncollapsed");
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

        expect(main).toHaveClass("Uncollapsed");
        expect(search).toHaveClass("Collapsed");
    });
});

describe("listener tests", () => {
    // TODO: complete this test when buttons are introduced
    // it("triggers onButtonClick()", () => {
    //     const onButtonClick = jest.fn();
    //     act(() => {
    //         render(<TopBar onButtonClick={onButtonClick} />, root);
    //     });
    // });

    it("triggers onSearchActive()", async () => {
        const onSearchActive = jest.fn();
        act(() => {
            render(<TopBar onSearchActive={onSearchActive} />, root);
        });
        const topBar = grabTopBar();
        const [searchButton] = grabSearchAndBackButtonFrom(topBar);

        expect(onSearchActive).not.toBeCalled();

        await act(async () => {
            searchButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
            // NOTE: timeout is needed since onSearchActive() is called asyncronously
            await new Promise((res) => setTimeout(res, 10));
        });

        expect(onSearchActive).toBeCalledTimes(1);
    });

    it("triggers onSearchInactive()", async () => {
        const onSearchInactive = jest.fn();
        act(() => {
            render(<TopBar onSearchInactive={onSearchInactive} />, root);
        });
        const topBar = grabTopBar();
        const [searchButton, backButton] = grabSearchAndBackButtonFrom(topBar);

        expect(onSearchInactive).not.toBeCalled();

        act(() => {
            searchButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        expect(onSearchInactive).not.toBeCalled();

        await act(async () => {
            backButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
            // NOTE: timeout is needed since onSearchInactive() is called asyncronously
            await new Promise((res) => setTimeout(res, 10));
        });

        expect(onSearchInactive).toBeCalledTimes(1);
    });
});
