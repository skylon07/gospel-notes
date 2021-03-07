import React from "react";
import ReactDOM from "react-dom";
import BetaDisclaimer from "./BetaDisclaimer";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<BetaDisclaimer hidden />, div);
});
