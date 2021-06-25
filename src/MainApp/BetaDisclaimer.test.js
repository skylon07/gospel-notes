import React from "react"
import { render } from "react-dom"
// import { act } from "react-dom/test-utils";
import BetaDisclaimer from "./BetaDisclaimer.js"

it("renders without crashing", () => {
    const div = document.createElement("div")
    render(<BetaDisclaimer hidden />, div)
})

// not many tests needed for this component
// since it is just a temporary disclosure
