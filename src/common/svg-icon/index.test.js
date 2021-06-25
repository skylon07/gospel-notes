import React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { act } from "react-dom/test-utils"

import { SVGIcon } from "."

let root = null
const origError = console.error
beforeEach(() => {
    root = document.createElement("div")
    document.body.appendChild(root)

    // mock console to ignore prop types errors
    console.error = (...errors) => {
        if (!(errors[0] + "").includes("Warning: Failed prop type")) {
            origError.call(console, ...errors)
        }
    }
})
afterEach(() => {
    unmountComponentAtNode(root)
    document.body.removeChild(root)
    root = null

    // reset mock
    console.error = origError
})

function grabSVGIcon() {
    return document.querySelector("[data-testid='svg-icon']")
}

function grabSVGFrom(icon) {
    return icon.querySelector("svg")
}

it("renders without crashing", () => {
    render(<SVGIcon />, root)
})

it("renders with a CSS class", () => {
    act(() => {
        render(<SVGIcon />, root)
    })
    const icon = grabSVGIcon()

    expect(icon).toHaveClass("SVGIcon")
})

it("renders a blank icon by default", () => {
    act(() => {
        render(<SVGIcon />, root)
    })
    const icon = grabSVGIcon()
    const svg = grabSVGFrom(icon)
    const children = [...svg.childNodes]

    // this assumes a blank icon is an SVG with no children
    expect(children).toStrictEqual([])
})

it("renders an icon when provided with a type", () => {
    const type = "burger"
    act(() => {
        render(<SVGIcon type={type} />, root)
    })
    const icon = grabSVGIcon()
    const svg = grabSVGFrom(icon)

    // this also tests that the bars/burger icon consists of three lines;
    // that is less important than the fact it simply has an icon
    expect(svg.children.length).toBe(3)
    for (const child of svg.children) {
        expect(child.tagName.toLowerCase()).toBe("line")
    }
})

describe("CSS class tests", () => {
    it("renders the icon type as a class name", () => {
        const type = "burger"
        act(() => {
            render(<SVGIcon type={type} />, root)
        })
        const icon = grabSVGIcon()

        expect(icon).toHaveClass(type)
    })

    // TODO: this is a valid/working test, but React's invalid prop warnings
    //       need to be silenced (at least, when run in spck mobile editor)
    it("renders the 'invalid' class name when an invalid type is given", () => {
        const type = "there is no way this is a valid type"
        act(() => {
            // ignore the prop types warning... I'm aware I'm doing something bad
            const origTypes = SVGIcon.propTypes
            SVGIcon.propTypes = {}
            render(<SVGIcon type={type} />, root)
            SVGIcon.propTypes = origTypes
        })
        const icon = grabSVGIcon()

        expect(icon).toHaveClass("invalid")
    })
})
