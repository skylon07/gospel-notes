import React from "react";
import ReactDOM from "react-dom";

import DropMenu from "./DropMenu.js";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DropMenu hidden />, div);
});
