import React from "react";
import ReactDOM from "react-dom";
import TopBarButton from "./TopBarButton";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<TopBarButton hidden />, div);
});
