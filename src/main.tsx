import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";

// polyfill for requestIdleCallback
window.requestIdleCallback = window.requestIdleCallback || window.setTimeout;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
