import React from "react";
import ReactDOM from "react-dom";

import SearchBar from "./SearchBar.js";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<SearchBar />, div);
});
