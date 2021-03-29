import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import NoteBox from "./NoteBox.js";

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

function grabNoteBox() {
    return document.querySelector("[data-testid='note-box']");
}

function grabTitleAndContentFrom(noteBox) {
    const title = noteBox.querySelector("textarea.Title");
    const content = noteBox.querySelector("textarea.Content");
    return [title, content];
}

it("renders without crashing", () => {
    render(<NoteBox />, root);
});

describe("rendering tests", () => {
    it("renders a title", () => {
        const titleText = "Test Title";
        act(() => {
            render(<NoteBox title={titleText} />, root);
        });
        const noteBox = grabNoteBox();
        const [title] = grabTitleAndContentFrom(noteBox);

        expect(title).toHaveTextContent(titleText);
    });

    it("renders content by props", () => {
        const contentText = "Test content by props";
        act(() => {
            render(<NoteBox content={contentText} />, root);
        });
        const noteBox = grabNoteBox();
        const [_, content] = grabTitleAndContentFrom(noteBox);

        expect(content).toHaveTextContent(contentText);
    });

    it("renders content by children", () => {
        const contentText = "Test content by children";
        act(() => {
            render(<NoteBox>{contentText}</NoteBox>, root);
        });
        const noteBox = grabNoteBox();
        const [_, content] = grabTitleAndContentFrom(noteBox);

        expect(content).toHaveTextContent(contentText);
    });

    it("renders children over content prop", () => {
        const contentPropText = "Test content by props";
        const contentChildText = "Test content by children";
        act(() => {
            render(
                <NoteBox content={contentPropText}>{contentChildText}</NoteBox>,
                root
            );
        });
        const noteBox = grabNoteBox();
        const [_, content] = grabTitleAndContentFrom(noteBox);

        expect(content).toHaveTextContent(contentChildText);
    });
});

describe("listener callbacks", () => {
    it("triggers onTitleChange(title)", () => {
        const firstTitle = "first title";
        const secondTitle = "second title";
        const onTitleChange = jest.fn();
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    title={firstTitle}
                    onTitleChange={onTitleChange}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        const [title] = grabTitleAndContentFrom(noteBox);

        expect(onTitleChange).not.toBeCalled();

        act(() => {
            title.focus();
            title.value = secondTitle;
            title.blur();
            // title.dispatchEvent(new Event("change")) // implementation uses onBlur() instead
        });

        expect(onTitleChange).toBeCalledWith(secondTitle);
        expect(onTitleChange).toBeCalledTimes(1);
    });

    it("triggers onContentChange(content)", () => {
        const firstContent = "first content";
        const secondContent = "second content";
        const onContentChange = jest.fn();
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    content={firstContent}
                    onContentChange={onContentChange}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        const [_, content] = grabTitleAndContentFrom(noteBox);

        expect(onContentChange).not.toBeCalled();

        act(() => {
            content.focus();
            content.value = secondContent;
            content.blur();
            // content.dispatchEvent(new Event("change")) // implementation uses onBlur() instead
        });

        expect(onContentChange).toBeCalledWith(secondContent);
        expect(onContentChange).toBeCalledTimes(1);
    });
});
