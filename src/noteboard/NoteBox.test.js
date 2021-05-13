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

it("renders with a CSS class", () => {
    act(() => {
        render(<NoteBox />, root)
    })
    const noteBox = grabNoteBox()
    
    expect(noteBox).toHaveClass("NoteBox")
})

describe("rendering tests", () => {
    it("renders a title", () => {
        const titleText = "Test Title";
        act(() => {
            render(<NoteBox initTitle={titleText} />, root);
        });
        const noteBox = grabNoteBox();
        const [title] = grabTitleAndContentFrom(noteBox);

        expect(title).toHaveTextContent(titleText);
    });

    it("renders content by props", () => {
        const contentText = "Test content by props";
        act(() => {
            render(<NoteBox initContent={contentText} />, root);
        });
        const noteBox = grabNoteBox();
        const [_, content] = grabTitleAndContentFrom(noteBox);
        
        expect(content).toHaveTextContent(contentText);
    });

    // NOTE: rendering by children is no longer supported
    // it("renders content by children", () => {
    //     const contentText = "Test content by children";
    //     act(() => {
    //         render(<NoteBox>{contentText}</NoteBox>, root);
    //     });
    //     const noteBox = grabNoteBox();
    //     const [_, content] = grabTitleAndContentFrom(noteBox);

    //     expect(content).toHaveTextContent(contentText);
    // });

    // it("renders children over content prop", () => {
    //     const contentPropText = "Test content by props";
    //     const contentChildText = "Test content by children";
    //     act(() => {
    //         render(
    //             <NoteBox
    //                 initContent={contentPropText}
    //             >
    //                 {contentChildText}
    //             </NoteBox>,
    //             root
    //         );
    //     });
    //     const noteBox = grabNoteBox();
    //     const [_, content] = grabTitleAndContentFrom(noteBox);

    //     expect(content).toHaveTextContent(contentChildText);
    // });
    
    it("does not rerender when initTitle or initContent changes", () => {
        const ref = React.createRef()
        const titleText = "origtitle"
        const contentText = "origcontent"
        act(() => {
            render(
                <NoteBox
                  ref={ref}
                  initTitle={titleText}
                  initContent={contentText}
                />,
                root
            )
        })
        const noteBox = grabNoteBox();
        const [title, content] = grabTitleAndContentFrom(noteBox);
        
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
        const newTitleText = "newtitle"
        const newContentText = "newcontent"
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    initTitle={newTitleText}
                    initContent={newContentText}
                />,
                root
            )
        })
        
        // element tests
        expect(title).toHaveTextContent(titleText)
        expect(title).not.toHaveTextContent(newTitleText)
        expect(content).toHaveTextContent(contentText)
        expect(content).not.toHaveTextContent(newContentText)
        // test for the performance optimization... (shouldComponentUpdate)
        expect(wrappedRender).not.toBeCalled()
    })
    
    it("still rerenders when other props change (not initTitle or initContent)", () => {
        const ref = React.createRef()
        const onChangeTitle = () => {}
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    onChangeTitle={onChangeTitle}
                />,
                root
            )
        })
        
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
        
        const newOnChangeTitle = () => {}
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    onChangeTitle={newOnChangeTitle}
                />,
                root
            )
        })
        
        expect(wrappedRender).toBeCalledTimes(1)
    })
    
    it("rerenders when forceTitle is given", () => {
        const ref = React.createRef()
        const initTitle = "init title"
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    initTitle={initTitle}
                />,
                root
            )
        })
        const noteBox = grabNoteBox()
        const [titleElem] = grabTitleAndContentFrom(noteBox)
        
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
        
        const newTitle = "new title"
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    forceTitle={newTitle}
                />,
                root
            )
        })
        
        expect(wrappedRender).toBeCalledTimes(1)
        expect(titleElem).toHaveTextContent(newTitle)
    })
    
    it("rerenders when forceContent is given", () => {
        const ref = React.createRef()
        const initContent = "init content"
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    initContent={initContent}
                />,
                root
            )
        })
        const noteBox = grabNoteBox()
        const [_, contentElem] = grabTitleAndContentFrom(noteBox)
    
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
    
        const newContent = "new content"
        act(() => {
            render(
                <NoteBox
                    ref={ref}
                    forceContent={newContent}
                />,
                root
            )
        })
    
        expect(wrappedRender).toBeCalledTimes(1)
        expect(contentElem).toHaveTextContent(newContent)
    })
});

describe("listener callbacks", () => {
    it("triggers onChangeTitle(title)", () => {
        const firstTitle = "first title";
        const secondTitle = "second title";
        const onChangeTitle = jest.fn();
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    initTitle={firstTitle}
                    canChange={true}
                    onChangeTitle={onChangeTitle}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        const [title] = grabTitleAndContentFrom(noteBox);

        expect(onChangeTitle).not.toBeCalled();

        act(() => {
            title.focus();
            title.value = secondTitle;
            title.blur();
            // title.dispatchEvent(new Event("change")) // implementation uses onBlur() instead
        });

        expect(onChangeTitle).toBeCalledWith(secondTitle);
        expect(onChangeTitle).toBeCalledTimes(1);
    });

    it("triggers onChangeContent(content)", () => {
        const firstContent = "first content";
        const secondContent = "second content";
        const onChangeContent = jest.fn();
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    initContent={firstContent}
                    canChange={true}
                    onChangeContent={onChangeContent}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        const [_, content] = grabTitleAndContentFrom(noteBox);

        expect(onChangeContent).not.toBeCalled();

        act(() => {
            content.focus();
            content.value = secondContent;
            content.blur();
            // content.dispatchEvent(new Event("change")) // implementation uses onBlur() instead
        });

        expect(onChangeContent).toBeCalledWith(secondContent);
        expect(onChangeContent).toBeCalledTimes(1);
    });
});
