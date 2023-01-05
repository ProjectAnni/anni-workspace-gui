import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/tauri";
import SetupGuide from "./components/SetupGuide";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

function App() {
    return (
        <div className="container">
            <SetupGuide />
        </div>
    );
}

export default App;
