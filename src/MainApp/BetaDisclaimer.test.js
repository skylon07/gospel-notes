import React from "react"
import { render, cleanup } from "common/test-utils"
import BetaDisclaimer from "./BetaDisclaimer.js"

it("renders without crashing", () => {
    render(<BetaDisclaimer hidden />)
    cleanup()
})

// not many tests needed for this component
// since it is just a temporary disclosure
