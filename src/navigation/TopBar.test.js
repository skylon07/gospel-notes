import React from "react";
import ReactDOM from "react-dom";
import { render, fireEvent, screen } from "@testing-library/react";
import TopBar from "./TopBar";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<TopBar />, div);
});

// TODO: should this be in DropMenu.test.js?
it("shows the main menu when the menu button is clicked", () => {
    render(<TopBar />);

    // Make sure the main menu is not visible by default
    // TODO: Should probably find a better way than just to check for the class
    expect(screen.getByRole("menu", { label: /main-menu/i })).toHaveClass(
        "hiding"
    );
    //expect(screen.getByLabelText("main-menu")).toHaveClass("hiding");

    // Click the main menu button
    //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
    fireEvent.click(screen.getByLabelText("main-menu-button"));

    // Make sure the main menu is displayed now
    expect(screen.getByRole("menu", { label: /main-menu/i })).toHaveClass(
        "showing"
    );
    //expect(screen.getByLabelText("main-menu")).toHaveClass("showing");
});

// TODO: should this be in DropMenu.test.js?
it("hides the main menu when the menu button is clicked twice", () => {
    render(<TopBar />);

    // Make sure the main menu is not visible by default
    expect(screen.getByRole("menu", { label: /main-menu/i })).toHaveClass(
        "hiding"
    );
    //expect(screen.getByLabelText("main-menu")).toHaveClass("hiding");

    // Click the main menu button
    //fireEvent.click(screen.getByRole("button", { label: /main-menu-button/i }));
    fireEvent.click(screen.getByLabelText("main-menu-button"));
    fireEvent.click(screen.getByLabelText("main-menu-button"));

    // Make sure the main menu is hidden now
    expect(screen.getByRole("menu", { label: /main-menu/i })).toHaveClass(
        "hiding"
    );
    //expect(screen.getByLabelText("main-menu")).toHaveClass("showing");
});
