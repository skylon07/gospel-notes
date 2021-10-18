import React from "react"
import { render, cleanup, screen } from "common/test-utils"

import { SVGIcon } from "."

const origError = console.error
function ignorePropTypesWarnings() {
    console.error = (...errors) => {
        const isPropTypeWarning = /Warning: Failed.*type:.*Invalid prop/
        if (!isPropTypeWarning.test(errors + "")) {
            origError.call(console, ...errors)
        }
    }
}

afterEach(() => {
    // reset possible console.error() override
    console.error = origError
    
    cleanup()
})

it("renders without crashing", () => {
    render(<SVGIcon />)
})

it("renders with a CSS class", () => {
    render(<SVGIcon />)
    const icon = screen.getByLabelText(/icon/)

    expect(icon).toHaveClass("SVGIcon")
})

it("renders a blank icon by default", () => {
    render(<SVGIcon />)
    const icon = screen.getByLabelText(/icon/)
    const svg = icon.querySelector("svg")
    const children = [...svg.childNodes]

    // this assumes a blank icon is an SVG with no children
    expect(children).toStrictEqual([])
})

it("renders an icon when provided with a type", () => {
    const type = "burger"
    render(<SVGIcon type={type} />)
    const icon = screen.getByLabelText(/icon/)
    const svg = icon.querySelector("svg")

    // this assumes that the bars/burger icon consists of three lines
    expect(svg.children.length).toBe(3)
    for (const child of svg.children) {
        expect(child.tagName.toLowerCase()).toBe("line")
    }
})

describe("CSS class tests", () => {
    it("renders the icon type as a class name", () => {
        const type = "burger"
        render(<SVGIcon type={type} />)
        const icon = screen.getByLabelText(/icon/)

        expect(icon).toHaveClass(type)
    })

    it("renders the 'invalid' class name when an invalid type is given", () => {
        const type = "!_ there . is no-way this is a v@lid type"
        // ignore the prop types warning...
        // (I'm aware this is "bad", React)
        ignorePropTypesWarnings()
        render(<SVGIcon type={type} />)
        const icon = screen.getByLabelText(/icon/)

        expect(icon).toHaveClass("invalid")
    })
})
