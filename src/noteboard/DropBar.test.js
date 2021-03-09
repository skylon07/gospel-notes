import React from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, fireEvent, screen, act } from "@testing-library/react";

import DropBar from "./DropBar.js";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DropBar />, div);
});

it("drops when the drop button is clicked", () => {
    render(<DropBar />);

    const dropBar = screen.getByLabelText("drop-bar");
    const dropContent = screen.getByLabelText("drop-content");
    const dropButton = screen.getByLabelText("drop-button");

    // ensure the drop bar is not dropped
    // TODO: Should probably find a better way than just to check for the class
    expect(dropContent).toHaveClass("raised");
    expect(dropButton).toHaveClass("raised");

    // click the dropper button
    fireEvent.click(dropButton);

    // ensure the drop bar and button are dropped now
    expect(dropContent).toHaveClass("dropped");
    expect(dropButton).toHaveClass("dropped");
});

it("raises when the drop button is clicked twice", () => {
    render(<DropBar />);

    const dropBar = screen.getByLabelText("drop-bar");
    const dropContent = screen.getByLabelText("drop-content");
    const dropButton = screen.getByLabelText("drop-button");

    // ensure the drop bar is not dropped
    // TODO: Should probably find a better way than just to check for the class
    expect(dropContent).toHaveClass("raised");
    expect(dropButton).toHaveClass("raised");

    // click the dropper button twice
    fireEvent.click(dropButton);
    fireEvent.click(dropButton);

    // ensure the drop bar and button are dropped now
    expect(dropContent).toHaveClass("raised");
    expect(dropButton).toHaveClass("raised");
});
