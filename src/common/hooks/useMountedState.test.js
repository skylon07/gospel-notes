import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";

import useMountedState from "./useMountedState.js";

function TestComponent(props) {
    const value = useMountedState();
    if (typeof props.onUseMountedState === "function") {
        props.onUseMountedState(value);
    }
    return null;
}

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

it("doesn't crash when no values are provided (tests component render)", () => {
    render(<TestComponent />, root);
});

it("returns false before being mounted (ie on first render)", () => {
    let mounted = null;
    act(() => {
        render(
            <TestComponent
                onUseMountedState={(isMounted) => {
                    mounted = isMounted;
                }}
            />,
            root
        );
    });

    expect(mounted).toBe(false);
});

it("returns true after being mounted (ie second, third, fourth,... renders)", () => {
    act(() => {
        render(<TestComponent />, root);
    });

    let mounted = null;
    act(() => {
        render(
            <TestComponent
                onUseMountedState={(isMounted) => {
                    mounted = isMounted;
                }}
            />,
            root
        );
    });

    expect(mounted).toBe(true);

    act(() => {
        render(
            <TestComponent
                onUseMountedState={(isMounted) => {
                    mounted = isMounted;
                }}
            />,
            root
        );
    });

    expect(mounted).toBe(true);
});

it("returns false after being unmounted (and subsequently rendered again)", () => {
    act(() => {
        render(<TestComponent />, root);
    });

    act(() => {
        unmountComponentAtNode(root);
    });

    let mounted = null;
    act(() => {
        render(
            <TestComponent
                onUseMountedState={(isMounted) => {
                    mounted = isMounted;
                }}
            />,
            root
        );
    });

    expect(mounted).toBe(false);

    act(() => {
        render(
            <TestComponent
                onUseMountedState={(isMounted) => {
                    mounted = isMounted;
                }}
            />,
            root
        );
    });

    expect(mounted).toBe(true);
});
