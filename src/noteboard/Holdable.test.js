import React from "react";
import ReactDOM, { unmountComponentAtNode } from "react-dom";
import { render, fireEvent, screen, act } from "@testing-library/react";

import Holdable from "./Holdable.js";

jest.useFakeTimers("modern");

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<Holdable />, div);
});

it("calls onHold() when clicked and held", () => {
    const onHold = jest.fn();
    render(<Holdable onHold={onHold} />);

    const holdable = screen.getByLabelText("holdable");
    
    // click on the holdable
    fireEvent.mouseDown(holdable)

    // onHold() should not have activated yet
    expect(onHold).not.toHaveBeenCalled();

    // wait some time...
    jest.advanceTimersByTime(100)

    // still should not have activated...
    expect(onHold).not.toHaveBeenCalled()

    // wait the rest of the time
    jest.advanceTimersByTime(1000)
    expect(onHold).toHaveBeenCalledTimes(1)
});
