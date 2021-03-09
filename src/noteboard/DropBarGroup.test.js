import React from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, fireEvent, screen, act } from "@testing-library/react";

import DropBarGroup from "./DropBarGroup.js";
import DropBar from "./DropBar.js";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DropBarGroup />, div);
});

// TODO: maybe provide some animation tests, since it
// primarilly applies animations to grouped children
