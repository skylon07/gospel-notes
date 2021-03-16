import { act } from "@testing-library/react";
import React from "react";
import { render, unmountComponentAtNode } from "react-dom";

import SearchBar from "./SearchBar.js";

let root = null;
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;
});

function grabSearchBar() {
    return document.querySelector("[data-testid='search-bar']");
}

it("renders without crashing", () => {
    render(<SearchBar />, root);
});

it("triggers onSearch() with correct value on search button click", () => {
    const onSearch = jest.fn();
    act(() => {
        render(<SearchBar onSearch={onSearch} />, root);
    });
    const searchBar = grabSearchBar();
    const inputField = searchBar.querySelector("input");
    const searchButton = searchBar.querySelector(".SearchButton > button");

    const searchString = "this is a test";
    act(() => {
        inputField.value = searchString;
    });

    expect(onSearch).not.toBeCalled();

    act(() => {
        searchButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(inputField.value).toBe(searchString);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith(searchString);

    const searchString2 = "this is another test";
    act(() => {
        inputField.value = searchString2;
        searchButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(inputField.value).toBe(searchString2);
    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch).toHaveBeenLastCalledWith(searchString2);
});

it("triggers onSearch() when the enter key is pressed", () => {
    const onSearch = jest.fn();
    act(() => {
        render(<SearchBar onSearch={onSearch} />, root);
    });
    const searchBar = grabSearchBar();
    const inputField = searchBar.querySelector("input");

    expect(onSearch).not.toBeCalled();

    act(() => {
        inputField.dispatchEvent(
            new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
        );
    });

    expect(onSearch).toBeCalledTimes(1);
});

it("selects all text in the input field when focused", () => {
    act(() => {
        render(<SearchBar />, root);
    });
    const searchBar = grabSearchBar();
    const inputField = searchBar.querySelector("input");

    expect(inputField.selectionStart).toBe(0);
    expect(inputField.selectionEnd).toBe(0);

    const searchString = "test if this is selected";
    act(() => {
        inputField.value = searchString;
        inputField.focus();
    });

    expect(inputField.selectionStart).toBe(0);
    expect(inputField.selectionEnd).toBe(searchString.length);
});

it("triggers onSearch() with correct value on search button click", () => {
    const onSearch = jest.fn();
    act(() => {
        render(<SearchBar onSearch={onSearch} />, root);
    });
    const searchBar = grabSearchBar();
    const inputField = searchBar.querySelector("input");
    const searchButton = searchBar.querySelector(".SearchButton > button");

    const searchString = "this is a test";
    act(() => {
        inputField.value = searchString;
    });

    expect(onSearch).not.toBeCalled();

    act(() => {
        searchButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(inputField.value).toBe(searchString);
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenLastCalledWith(searchString);

    const searchString2 = "this is another test";
    act(() => {
        inputField.value = searchString2;
        searchButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(inputField.value).toBe(searchString2);
    expect(onSearch).toHaveBeenCalledTimes(2);
    expect(onSearch).toHaveBeenLastCalledWith(searchString2);
});

it("triggers onSearch() when the enter key is pressed", () => {
    const onSearch = jest.fn();
    act(() => {
        render(<SearchBar onSearch={onSearch} />, root);
    });
    const searchBar = grabSearchBar();
    const inputField = searchBar.querySelector("input");

    expect(onSearch).not.toBeCalled();

    act(() => {
        inputField.dispatchEvent(
            new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
        );
    });

    expect(onSearch).toBeCalledTimes(1);
});

it("selects all text in the input field when focused", () => {
    act(() => {
        render(<SearchBar />, root);
    });
    const searchBar = grabSearchBar();
    const inputField = searchBar.querySelector("input");

    expect(inputField.selectionStart).toBe(0)
    expect(inputField.selectionEnd).toBe(0)

    const searchString = "test if this is selected";
    act(() => {
        inputField.value = searchString;
        inputField.focus();
    });

    expect(inputField.selectionStart).toBe(0);
    expect(inputField.selectionEnd).toBe(searchString.length);
});
