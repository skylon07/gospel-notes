import React from "react";
import ReactDOM from "react-dom";

import DropMenu from "./DropMenu.js";

import { render, fireEvent, screen } from "@testing-library/react";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<DropMenu hidden />, div);
});

it("calls onClick when clicked", () => {
    var clicked = false;
    function handleClick() {
        clicked = true;
    }
    const div = document.createElement("div");
    render(
        <DropMenu
            hidden
            ariaLabel="test-dropmenu"
            onClick={() => handleClick()}
        />,
        div
    );

    // Click the main menu button
    //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
    fireEvent.click(screen.getByLabelText("test-dropmenu"));

    expect(clicked).toBeTrue();
});
