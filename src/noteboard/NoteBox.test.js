import React from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, fireEvent, screen, act } from "@testing-library/react";

import NoteBox from "./NoteBox.js";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<NoteBox />, div);
});

it("renders a title", () => {
    render(<NoteBox title="Test Title" />);

    const title = screen.getByLabelText("note-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Test Title");
});

it("renders content by props", () => {
    render(<NoteBox content="Test Content by props" />);

    const content = screen.getByLabelText("note-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Test Content by props");
});

it("renders content by children", () => {
    render(<NoteBox>Test Content by children</NoteBox>);

    const content = screen.getByLabelText("note-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Test Content by children");
});

it("renders children over content prop", () => {
    render(
        <NoteBox content="Test Content by props">
            Test Content by children
        </NoteBox>
    );

    const content = screen.getByLabelText("note-content");
    expect(content).toBeInTheDocument();
    expect(content).toHaveTextContent("Test Content by children");
});
