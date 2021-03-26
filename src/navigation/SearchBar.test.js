import React from "react";
import ReactDOM from "react-dom";

import SearchBar from "./SearchBar.js";

import { render, fireEvent, screen } from "@testing-library/react";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<SearchBar />, div);
});

it("calls onSearchClick when the search button is clicked", () => {
    var clicked = false;
    function handleClick() {
        clicked = true;
    }
    const div = document.createElement("div");
    render(<SearchBar onSearchClick={() => handleClick()} />, div);

    // Click the main menu button
    //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
    fireEvent.click(screen.getByLabelText("search-button"));

    expect(clicked).toBeTrue();
});
