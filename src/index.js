import React from "react";
import ReactDOM from "react-dom";

import MainApp from "./MainApp/MainApp.js";
import "./colorPalette.css";

ReactDOM.render(
    <React.StrictMode>
        <MainApp />
    </React.StrictMode>,
    document.getElementById("root")
);
