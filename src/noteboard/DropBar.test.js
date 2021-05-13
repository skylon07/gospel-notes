import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import DropBar from "./DropBar.js";

jest.useFakeTimers("modern");

const origPrompt = window.prompt
let root = null;
beforeEach(() => {
    root = document.createElement("div");
    document.body.appendChild(root);
});
afterEach(() => {
    unmountComponentAtNode(root);
    document.body.removeChild(root);
    root = null;

    // reset mock
    window.prompt = origPrompt
});

function grabDropBar() {
    return document.querySelector("[data-testid='drop-bar']");
}

function grabMainBarFrom(dropBar) {
    return dropBar.querySelector(".Bar");
}

function grabIconTypeFrom(dropBar) {
    const iconElem = dropBar.querySelector("[data-testid='svg-icon']");
    const classList = [...iconElem.classList]
    return classList.filter((name) => name && name !== "SVGIcon")[0]
}

function grabDropButtonFrom(dropBar) {
    return dropBar.querySelector("[data-testid='dropdown-button']");
}

function grabContentFrom(dropBar) {
    return dropBar.querySelector("[data-testid='drop-bar-content']");
}

function renderSeveralDropBars() {
    return (
        <React.Fragment>
            <DropBar />
            <DropBar />
            <DropBar />
            <DropBar />
            <DropBar />
        </React.Fragment>
    );
}

it("renders without crashing", () => {
    render(<DropBar />, root);
});

it("renders with a CSS class", () => {
    act(() => {
        render(<DropBar />, root)
    })
    const dropBar = grabDropBar()
    
    expect(dropBar).toHaveClass("DropBar")
})

describe("rendering tests", () => {
    it("renders a title", () => {
        const initTitle = "this is the title string to look for";
        act(() => {
            render(<DropBar initTitle={initTitle} />, root);
        });
        const dropBar = grabDropBar();
        const mainBar = grabMainBarFrom(dropBar);

        expect(mainBar).toHaveTextContent(initTitle);
    });

    it("renders the correct icon type", () => {
        const iconType = "burger";
        act(() => {
            render(<DropBar initIconType={iconType} />, root);
        });
        const dropBar = grabDropBar();
        const icon = grabIconTypeFrom(dropBar);

        expect(icon).toBe(iconType);
    });
    
    it("doesn't rerender when initTitle or initIconType changes", () => {
        const ref = React.createRef()
        const initTitle = "init title"
        const initIconType = "plus"
        act(() => {
            render(
                <DropBar
                    ref={ref}
                    initTitle={initTitle}
                    initIconType={initIconType}
                />,
                root
            )
        })
        const dropBar = grabDropBar()
        const mainBar = grabMainBarFrom(dropBar)
    
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
    
        const newTitle = "new title"
        const newIconType = "cross"
        act(() => {
            render(
                <DropBar
                    ref={ref}
                    initTitle={newTitle}
                    initIconType={newIconType}
                />,
                root
            )
        })
    
        expect(wrappedRender).not.toBeCalled()
        expect(mainBar).toHaveTextContent(initTitle)
        const icon = grabIconTypeFrom(dropBar)
        expect(icon).toBe(initIconType)
    })
    
    it("still rerenders when other props change", () => {
        const ref = React.createRef()
        const onChangeTitle = () => {}
        act(() => {
            render(
                <DropBar
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
                <DropBar
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
                <DropBar
                    ref={ref}
                    initTitle={initTitle}
                />,
                root
            )
        })
        const dropBar = grabDropBar()
        const mainBar = grabMainBarFrom(dropBar)
    
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
    
        const forceTitle = "new title"
        act(() => {
            render(
                <DropBar
                    ref={ref}
                    forceTitle={forceTitle}
                />,
                root
            )
        })
    
        expect(wrappedRender).toBeCalledTimes(1)
        expect(mainBar).toHaveTextContent(forceTitle)
    })
    
    it("rerenders when forceIconType is given", () => {
        const ref = React.createRef()
        const initIconType = "plus"
        act(() => {
            render(
                <DropBar
                    ref={ref}
                    initIconType={initIconType}
                />,
                root
            )
        })
        const dropBar = grabDropBar()
    
        const origRender = ref.current.render
        const wrappedRender = ref.current.render = jest.fn(() => origRender.call(ref.current))
    
        const forceIconType = "cross"
        act(() => {
            render(
                <DropBar
                    ref={ref}
                    forceIconType={forceIconType}
                />,
                root
            )
        })
    
        expect(wrappedRender).toBeCalledTimes(1)
        const icon = grabIconTypeFrom(dropBar)
        expect(icon).toBe(forceIconType)
    })
});

describe("drop button tests", () => {
    it("drops when the drop button is clicked", () => {
        act(() => {
            render(<DropBar />, root);
        });
        const dropBar = grabDropBar();
        const dropContent = grabContentFrom(dropBar);
        const dropButton = grabDropButtonFrom(dropBar);

        // ensure the drop bar is not dropped
        expect(dropContent).toHaveClass("raised");
        expect(dropButton).toHaveClass("raised");

        // click the dropper button
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        // ensure the drop bar and button are dropped now
        expect(dropContent).toHaveClass("dropped");
        expect(dropButton).toHaveClass("dropped");
    });

    it("raises when the drop button is clicked twice", () => {
        act(() => {
            render(<DropBar />, root);
        });
        const dropBar = grabDropBar();
        const dropContent = grabContentFrom(dropBar);
        const dropButton = grabDropButtonFrom(dropBar);

        // ensure the drop bar is not dropped
        expect(dropContent).toHaveClass("raised");
        expect(dropButton).toHaveClass("raised");

        // click the dropper button twice
        act(() => {
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
            dropButton.dispatchEvent(
                new MouseEvent("click", { bubbles: true })
            );
        });

        // ensure the drop bar and button are dropped now
        expect(dropContent).toHaveClass("raised");
        expect(dropButton).toHaveClass("raised");
    });
});

describe("listener callback tests", () => {
    it("triggers onChangeTitle() when holdable bar is held", () => {
        // mock prompt()
        window.prompt = () => "newTitle"
        
        const onChangeTitle = jest.fn();
        act(() => {
            render(<DropBar onChangeTitle={onChangeTitle} />, root);
        });
        const dropBar = grabDropBar();
        const mainBar = grabMainBarFrom(dropBar);

        expect(onChangeTitle).not.toBeCalled();

        act(() => {
            mainBar.dispatchEvent(
                new MouseEvent("mousedown", { bubbles: true })
            );
        });

        expect(onChangeTitle).not.toBeCalled();

        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(onChangeTitle).toBeCalledTimes(1);
        expect(onChangeTitle).toBeCalledWith("newTitle")
    });

    // NOTE: DropBarGroups are not used anymore; _beforeDrop is obsolete
    // it("triggers the hidden _beforeDrop(ref, dropped) prop", () => {
    //     const _beforeDrop = jest.fn();
    //     act(() => {
    //         render(<DropBar _beforeDrop={_beforeDrop} />, root);
    //     });
    //     const dropBar = grabDropBar();
    //     const dropButton = grabDropButtonFrom(dropBar);

    //     expect(_beforeDrop).not.toBeCalled();

    //     act(() => {
    //         dropButton.dispatchEvent(
    //             new MouseEvent("click", { bubbles: true })
    //         );
    //     });

    //     const wasDropped = false; // it was not dropped before the click
    //     expect(_beforeDrop).toBeCalledWith(expect.any(Object), wasDropped);
    //     expect(_beforeDrop).toBeCalledTimes(1);
    // });
});

describe("group animation tests", () => {
    it("applies dropping classes to elements below the one dropping", () => {
        const base = "DropBarTransform"
        const dropping = "dropping"
        const raising = "raising"
        act(() => {
            render(renderSeveralDropBars(), root);
        });
        const dropBars = root.children
    
        for (const dropBar of dropBars) {
            // NOTE: not sure, but toHaveClass(base, dropping, raising) was
            //       avoided since .not is being used, and that behavior isn't
            //       understood (what if two of three classes were present?)
            expect(dropBar).not.toHaveClass(base);
            expect(dropBar).not.toHaveClass(dropping)
            expect(dropBar).not.toHaveClass(raising)
        }
    
        const dropIdx = 2;
        const dropBarToClick = dropBars[dropIdx];
        const dropButton = grabDropButtonFrom(dropBarToClick);
        act(() => {
            dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    
        for (let i = 0; i < dropBars.length; i++) {
            const dropBar = dropBars[i];
            if (i <= dropIdx) {
                expect(dropBar).not.toHaveClass(base);
                expect(dropBar).not.toHaveClass(dropping);
                expect(dropBar).not.toHaveClass(raising);
            } else if (i > dropIdx) {
                expect(dropBar).toHaveClass(base);
                expect(dropBar).toHaveClass(dropping);
                expect(dropBar).not.toHaveClass(raising);
            }
        }
    });
    
    it("applies raising classes to elements below the one raising", () => {
        const base = "DropBarTransform"
        const dropping = "dropping"
        const raising = "raising"
        act(() => {
            render(renderSeveralDropBars(), root);
        });
        const dropBars = root.children
    
        for (const dropBar of dropBars) {
            // NOTE: not sure, but toHaveClass(base, dropping, raising) was
            //       avoided since .not is being used, and that behavior isn't
            //       understood (what if two of three classes were present?)
            expect(dropBar).not.toHaveClass(base);
            expect(dropBar).not.toHaveClass(dropping)
            expect(dropBar).not.toHaveClass(raising)
        }
    
        const dropIdx = 1;
        const dropBarToClick = dropBars[dropIdx];
        const dropButton = grabDropButtonFrom(dropBarToClick);
        act(() => {
            dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
        // wait for drop (seperate "act()")
        act(() => {
            dropButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        });
    
        for (let i = 0; i < dropBars.length; i++) {
            const dropBar = dropBars[i];
            if (i <= dropIdx) {
                expect(dropBar).not.toHaveClass(base);
                expect(dropBar).not.toHaveClass(dropping);
                expect(dropBar).not.toHaveClass(raising);
            } else if (i > dropIdx) {
                expect(dropBar).toHaveClass(base);
                expect(dropBar).not.toHaveClass(dropping);
                expect(dropBar).toHaveClass(raising);
            }
        }
    });
})

// TODO: maybe provide some animation tests, since it
// primarilly applies animations to grouped children
