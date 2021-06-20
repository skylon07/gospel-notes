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

    it("renders the content", () => {
        const contentText = "Test content by props";
        act(() => {
            render(<NoteBox initContent={contentText} />, root);
        });
        const noteBox = grabNoteBox();
        // eslint-disable-next-line no-unused-vars
        const [_, content] = grabTitleAndContentFrom(noteBox);
        
        expect(content).toHaveTextContent(contentText);
    })
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
                    initTitle={firstTitle}
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
        });

        expect(onTitleChange).toBeCalledTimes(1);
        expect(onTitleChange).toBeCalledWith(secondTitle);
    });

    it("triggers onContentChange(content)", () => {
        const firstContent = "first content";
        const secondContent = "second content";
        const onContentChange = jest.fn();
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    initContent={firstContent}
                    onContentChange={onContentChange}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        // eslint-disable-next-line no-unused-vars
        const [_, content] = grabTitleAndContentFrom(noteBox);

        expect(onContentChange).not.toBeCalled();

        act(() => {
            content.focus();
            content.value = secondContent;
            content.blur();
        });

        expect(onContentChange).toBeCalledTimes(1);
        expect(onContentChange).toBeCalledWith(secondContent);
    });
});

describe("ref tests", () => {
    it("has a setTitle()", () => {
        const ref = React.createRef()
        const initTitle = "init title"
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initTitle={initTitle}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        const [title] = grabTitleAndContentFrom(noteBox)
        
        expect(title.value).toBe(initTitle)
        
        const newTitle = "new title"
        act(() => {
            ref.current.setTitle(newTitle)
        })
        
        expect(title.value).toBe(newTitle)
    })
    
    it("has a setContent()", () => {
        const ref = React.createRef()
        const initContent = "init content"
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initContent={initContent}
                />,
                root
            );
        });
        const noteBox = grabNoteBox();
        // eslint-disable-next-line no-unused-vars
        const [_, content] = grabTitleAndContentFrom(noteBox)
        
        expect(content.value).toBe(initContent)
        
        const newContent = "new content"
        act(() => {
            ref.current.setContent(newContent)
        })
        
        expect(content.value).toBe(newContent)
    })
    
    it("calls onTitleChange() when using setTitle()", () => {
        const ref = React.createRef()
        const initTitle = "init title"
        const onTitleChange = jest.fn()
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initTitle={initTitle}
                    onTitleChange={onTitleChange}
                />,
                root
            );
        });
        
        expect(onTitleChange).not.toBeCalled()
        
        const newTitle = "new title"
        act(() => {
            ref.current.setTitle(newTitle)
        })
        
        expect(onTitleChange).toBeCalledTimes(1)
        expect(onTitleChange).toBeCalledWith(newTitle)
    })
    
    it("calls onContentChange() when using setContent()", () => {
        const ref = React.createRef()
        const initContent = "init content"
        const onContentChange = jest.fn()
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initContent={initContent}
                    onContentChange={onContentChange}
                />,
                root
            );
        });
        
        expect(onContentChange).not.toBeCalled()
        
        const newContent = "new content"
        act(() => {
            ref.current.setContent(newContent)
        })
        
        expect(onContentChange).toBeCalledTimes(1)
        expect(onContentChange).toBeCalledWith(newContent)
    })
    
    it("can setTitle() silently", () => {
        const ref = React.createRef()
        const initTitle = "init title"
        const onTitleChange = jest.fn()
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initTitle={initTitle}
                    onTitleChange={onTitleChange}
                />,
                root
            );
        });
        
        expect(onTitleChange).not.toBeCalled()
        
        const newTitle = "new title"
        act(() => {
            ref.current.setTitle(newTitle, true)
        })
        
        expect(onTitleChange).not.toBeCalled()
    })
    
    it("can setContent() silently", () => {
        const ref = React.createRef()
        const initContent = "init content"
        const onContentChange = jest.fn()
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initContent={initContent}
                    onContentChange={onContentChange}
                />,
                root
            );
        });
        
        expect(onContentChange).not.toBeCalled()
        
        const newContent = "new content"
        act(() => {
            ref.current.setContent(newContent, true)
        })
        
        expect(onContentChange).not.toBeCalled()
    })
    
    it("throws when setTitle() is not given a string", () => {
        const ref = React.createRef()
        const initTitle = "init title"
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initTitle={initTitle}
                />,
                root
            );
        });
        
        expect(() => {
            const badTitle = { bad: "title data" }
            act(() => {
                ref.current.setTitle(badTitle)
            })
        }).toThrow(TypeError)
    })
    
    it("throws when setContent() is not given a string", () => {
        const ref = React.createRef()
        const initContent = "init content"
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    ref={ref}
                    initContent={initContent}
                />,
                root
            );
        });
        
        expect(() => {
            const badContent = { bad: "content data" }
            act(() => {
                ref.current.setContent(badContent)
            })
        }).toThrow(TypeError)
    })
})
