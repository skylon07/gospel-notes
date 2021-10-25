import React from "react"
import { render, cleanup, screen, fireEvent, callRefHandle } from "common/test-utils"

import DropMenu from "./DropMenu.js"

afterEach(() => {
    cleanup()
})

const ARIA_MENU_LABEL = "test menu"

it("renders without crashing", () => {
    render(<DropMenu ariaMenuLabel={ARIA_MENU_LABEL} />)
})

it("renders with a CSS class", () => {
    render(<DropMenu ariaMenuLabel={ARIA_MENU_LABEL} />)
    const menu = screen.getByTestId("DropMenu")
    const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

    expect(menu).toHaveClass("DropMenu")
    expect(menuBox).toHaveClass("DropMenuBox")
})

describe("class rendering tests", () => {
    it("drops when not hidden", () => {
        render(<DropMenu initHidden={false} ariaMenuLabel={ARIA_MENU_LABEL} />)
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

        // // this doesn't seem to work (see the test below)
        // expect(dropMenu).toBeVisible();
        expect(menuBox).toHaveClass("showing", "noMountingAnimation")
    })

    it("is raised when hidden", () => {
        render(<DropMenu initHidden={true} ariaMenuLabel={ARIA_MENU_LABEL} />)
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

        // // this does not seem to catch the opacity set in the .hidden CSS class
        // expect(dropMenu).not.toBeVisible();

        // // calculating style doesn't seem to work either...
        // const style = window.getComputedStyle(dropMenu)
        // expect(style.height).toBe(0)
        // expect(style.display).toBe("flex") // is "block"?
        expect(menuBox).toHaveClass("hiding", "noMountingAnimation")
    })
})

describe("toggle button (and more class rendering) tests", () => {
    // tests past the "initial state" logic
    it("is raised after being dropped and raised", () => {
        render(<DropMenu initHidden={false} ariaMenuLabel={ARIA_MENU_LABEL} />)
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)
        const toggleButton = screen.getByLabelText(/button/)

        expect(menuBox).toHaveClass("showing", "noMountingAnimation")

        fireEvent(toggleButton, new MouseEvent("click", { bubbles: true }))

        expect(menuBox).toHaveClass("hiding")
    })

    it("is dropped after being raised and dropped", () => {
        render(<DropMenu initHidden={true} ariaMenuLabel={ARIA_MENU_LABEL} />)
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)
        const toggleButton = screen.getByLabelText(/button/)

        expect(menuBox).toHaveClass("hiding", "noMountingAnimation")

        fireEvent(toggleButton, new MouseEvent("click", { bubbles: true }))

        expect(menuBox).toHaveClass("showing")
    })
})

describe("window-click hiding tests", () => {
    it("hides the menu when somewhere outside the menu is clicked", () => {
        render(<DropMenu initHidden={false} ariaMenuLabel={ARIA_MENU_LABEL} />)
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

        expect(menuBox).toHaveClass("showing")

        fireEvent(document.body, new MouseEvent("click", { bubbles: true }))
        
        expect(menuBox).toHaveClass("hiding")
    })

    it("doesn't rerender after clicking if the menu is already hidden", () => {
        const onRender = jest.fn()
        render(
            <React.Profiler id="DropMenu" onRender={onRender}>
                <DropMenu initHidden={true} ariaMenuLabel={ARIA_MENU_LABEL} />
            </React.Profiler>
        )
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

        expect(menuBox).toHaveClass("hiding")
        expect(onRender).toHaveBeenCalledTimes(1)

        fireEvent(document.body, new MouseEvent("click", { bubbles: true }))

        expect(menuBox).toHaveClass("hiding")
        expect(onRender).toHaveBeenCalledTimes(1)
    })

    it("doesn't hide when the menu itself is clicked", () => {
        render(<DropMenu initHidden={false} ariaMenuLabel={ARIA_MENU_LABEL} />)
        const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

        expect(menuBox).toHaveClass("showing")

        fireEvent(menuBox, new MouseEvent("click", { bubbles: true }))

        expect(menuBox).toHaveClass("showing")
    })
})

it("renders menu content as given in JSX", () => {
    const content = <button>Clicky button</button>
    render(<DropMenu ariaMenuLabel={ARIA_MENU_LABEL}>{content}</DropMenu>)
    const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

    // TODO: should probably find a better way to test on children...
    expect(menuBox.children.length).toBe(2) // don't forget the .Shadow!
    const buttonChild = menuBox.children[1]
    expect(buttonChild.tagName.toLowerCase()).toBe("button")
    expect(buttonChild).toHaveTextContent("Clicky button")
})

it("provides an imperative hide() through a ref", () => {
    const ref = React.createRef()
    render(<DropMenu ref={ref} initHidden={false} ariaMenuLabel={ARIA_MENU_LABEL} />)
    const menuBox = screen.getByLabelText(ARIA_MENU_LABEL)

    callRefHandle(ref, "hide")

    expect(menuBox).toHaveClass("hiding")
})
