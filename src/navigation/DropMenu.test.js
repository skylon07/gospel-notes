import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import DropMenu from "./DropMenu.js";

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

function grabDropMenu() {
    return document.querySelector("[data-testid='drop-menu']");
}

function grabToggleButtonFrom(dropMenu) {
    return dropMenu.querySelector(".ToggleButton")
}

function grabMenuBoxFrom(dropMenu) {
    return dropMenu.querySelector("[data-testid='drop-menu-box']")
}

it("renders without crashing", () => {
    render(<DropMenu />, root);
});

it("renders with a CSS class", () => {
    act(() => {
        render(<DropMenu />, root)
    })
    const menu = grabDropMenu()
    const box = grabMenuBoxFrom(menu)
    
    expect(menu).toHaveClass("DropMenu")
    expect(box).toHaveClass("DropMenuBox")
})

describe("class rendering/animation stunting tests", () => {
    it("drops when not hidden", () => {
        act(() => {
            render(<DropMenu initHidden={false} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)

        // NOTE: this doesn't seem to work (see the test below)
        // expect(dropMenu).toBeVisible();
        expect(menuBox).toHaveClass("showing");
    });

    it("is raised when hidden", () => {
        act(() => {
            render(<DropMenu initHidden={true} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)

        // NOTE: this does not seem to catch the opacity set in the .hidden CSS class
        // expect(dropMenu).not.toBeVisible();
        // NOTE: calculating style doesn't seem to work either
        // const style = window.getComputedStyle(dropMenu)
        // expect(style.height).toBe(0)
        // expect(style.display).toBe("flex") // is "block"?
        expect(menuBox).toHaveClass("hiding");
    });
})

describe("toggle button (and more class rendering) tests", () => {
    // tests past the "initial state" logic
    it("is raised after being dropped and raised", () => {
        act(() => {
            render(<DropMenu initHidden={false} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)
        const toggleButton = grabToggleButtonFrom(dropMenu)
        
        expect(menuBox).toHaveClass("showing", "initAnimation");

        act(() => {
            toggleButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            )
        });

        expect(menuBox).toHaveClass("hiding");
    });

    it("is dropped after being raised and dropped", () => {
        act(() => {
            render(<DropMenu initHidden={true} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)
        const toggleButton = grabToggleButtonFrom(dropMenu)
        
        expect(menuBox).toHaveClass("hiding", "initAnimation");
        
        act(() => {
            toggleButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            )
        });
        
        expect(menuBox).toHaveClass("showing");
    });
});

describe("window-click hiding tests", () => {
    it("hides the menu when somewhere outside the menu is clicked", () => {
        act(() => {
            render(<DropMenu initHidden={false} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)

        expect(menuBox).toHaveClass("showing")

        act(() => {
            document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });

        expect(menuBox).toHaveClass("hiding")
    });
    
    it("doesn't rerender after clicking if the menu is already hidden", () => {
        const onRender = jest.fn()
        act(() => {
            render(<React.Profiler
                id="DropMenu"
                onRender={onRender}
            >
                <DropMenu initHidden={true} />
            </React.Profiler>, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)
        
        expect(menuBox).toHaveClass("hiding")
        expect(onRender).toBeCalledTimes(1)
        
        act(() => {
            document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        
        expect(menuBox).toHaveClass("hiding")
        expect(onRender).toBeCalledTimes(1)
    })
    
    it("doesn't hide when the menu itself is clicked", () => {
        act(() => {
            render(<DropMenu initHidden={false} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)
        
        expect(menuBox).toHaveClass("showing")
        
        act(() => {
            menuBox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        
        expect(menuBox).toHaveClass("showing")
    })
});

describe("menuContent tests", () => {
    it("renders menu content as given in JSX", () => {
        const content = <button>Clicky button</button>
        act(() => {
            render(<DropMenu menuContent={content} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)

        expect(menuBox.children.length).toBe(2) // don't forget the .Shadow!
        const buttonChild = menuBox.children[1]
        expect(buttonChild.tagName.toLowerCase()).toBe("button")
        expect(buttonChild).toHaveTextContent("Clicky button")
    })

    it("runs a function and renders the content it generates", () => {
        const contentFunc = () => <button>Clicky button</button>
        act(() => {
            render(<DropMenu menuContent={contentFunc} />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)

        expect(menuBox.children.length).toBe(2) // don't forget the .Shadow!
        const buttonChild = menuBox.children[1]
        expect(buttonChild.tagName.toLowerCase()).toBe("button")
        expect(buttonChild).toHaveTextContent("Clicky button")
    })

    it("passes a hideMenu() callback (and should also work...)", () => {
        const contentFunc = (hideMenu) => [
            <button key="useless">Useless button</button>,
            <button key="clicky" onClick={hideMenu}>Clicky button</button>,
        ]
        act(() => {
            render(<DropMenu
                initHidden={false}
                menuContent={contentFunc}
            />, root);
        });
        const dropMenu = grabDropMenu();
        const menuBox = grabMenuBoxFrom(dropMenu)
        // don't forget the .Shadow!
        const [_, uselessButton, clickyButton] = menuBox.children

        expect(menuBox).toHaveClass("showing")

        act(() => {
            uselessButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            )
        })

        expect(menuBox).toHaveClass("showing")
        
        act(() => {
            clickyButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            )
        })
        
        expect(menuBox).toHaveClass("hiding")
    })
})
