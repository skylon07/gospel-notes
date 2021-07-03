import React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { fireEvent, screen } from "@testing-library/react"
import { act } from "react-dom/test-utils"

import NoteBox from "./NoteBox.js"

let root = null
beforeEach(() => {
    root = document.createElement("div")
    document.body.appendChild(root)
})
afterEach(() => {
    unmountComponentAtNode(root)
    document.body.removeChild(root)
    root = null
})

function grabNoteBox() {
    return document.querySelector("[data-testid='note-box']")
}

function grabTitleAndContentFrom(noteBox) {
    const title = noteBox.querySelector("textarea.Title")
    const content = noteBox.querySelector("textarea.Content")
    return [title, content]
}

it("renders without crashing", () => {
    render(<NoteBox />, root)
})

it("renders with a CSS class", () => {
    act(() => {
        render(<NoteBox />, root)
    })
    const noteBox = grabNoteBox()

    expect(noteBox).toHaveClass("NoteBox")
})

describe("rendering tests", () => {
    it("renders a title", () => {
        const titleText = "Test Title"
        act(() => {
            render(<NoteBox initTitle={titleText} />, root)
        })
        const noteBox = grabNoteBox()
        const [title] = grabTitleAndContentFrom(noteBox)

        expect(title).toHaveTextContent(titleText)
    })

    it("renders the content", () => {
        const contentText = "Test content by props"
        act(() => {
            render(<NoteBox initContent={contentText} />, root)
        })
        const noteBox = grabNoteBox()
        // eslint-disable-next-line no-unused-vars
        const [_, content] = grabTitleAndContentFrom(noteBox)

        expect(content).toHaveTextContent(contentText)
    })
})

describe("listener callbacks", () => {
    it("triggers onTitleChange(title)", () => {
        const firstTitle = "first title"
        const secondTitle = "second title"
        const onTitleChange = jest.fn()
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    initTitle={firstTitle}
                    onTitleChange={onTitleChange}
                />,
                root
            )
        })
        const noteBox = grabNoteBox()
        const [title] = grabTitleAndContentFrom(noteBox)

        expect(onTitleChange).not.toHaveBeenCalled()

        act(() => {
            title.focus()
            title.value = secondTitle
            title.blur()
        })

        expect(onTitleChange).toHaveBeenCalledTimes(1)
        expect(onTitleChange).toHaveBeenCalledWith(secondTitle)
    })

    it("triggers onContentChange(content)", () => {
        const firstContent = "first content"
        const secondContent = "second content"
        const onContentChange = jest.fn()
        act(() => {
            render(
                <NoteBox
                    // prettier-ignore
                    initContent={firstContent}
                    onContentChange={onContentChange}
                />,
                root
            )
        })
        const noteBox = grabNoteBox()
        // eslint-disable-next-line no-unused-vars
        const [_, content] = grabTitleAndContentFrom(noteBox)

        expect(onContentChange).not.toHaveBeenCalled()

        act(() => {
            content.focus()
            content.value = secondContent
            content.blur()
        })

        expect(onContentChange).toHaveBeenCalledTimes(1)
        expect(onContentChange).toHaveBeenCalledWith(secondContent)
    })
})

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
            )
        })
        const noteBox = grabNoteBox()
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
            )
        })
        const noteBox = grabNoteBox()
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
            )
        })

        expect(onTitleChange).not.toHaveBeenCalled()

        const newTitle = "new title"
        act(() => {
            ref.current.setTitle(newTitle)
        })

        expect(onTitleChange).toHaveBeenCalledTimes(1)
        expect(onTitleChange).toHaveBeenCalledWith(newTitle)
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
            )
        })

        expect(onContentChange).not.toHaveBeenCalled()

        const newContent = "new content"
        act(() => {
            ref.current.setContent(newContent)
        })

        expect(onContentChange).toHaveBeenCalledTimes(1)
        expect(onContentChange).toHaveBeenCalledWith(newContent)
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
            )
        })

        expect(onTitleChange).not.toHaveBeenCalled()

        const newTitle = "new title"
        act(() => {
            ref.current.setTitle(newTitle, true)
        })

        expect(onTitleChange).not.toHaveBeenCalled()
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
            )
        })

        expect(onContentChange).not.toHaveBeenCalled()

        const newContent = "new content"
        act(() => {
            ref.current.setContent(newContent, true)
        })

        expect(onContentChange).not.toHaveBeenCalled()
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
            )
        })

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
            )
        })

        expect(() => {
            const badContent = { bad: "content data" }
            act(() => {
                ref.current.setContent(badContent)
            })
        }).toThrow(TypeError)
    })
})
