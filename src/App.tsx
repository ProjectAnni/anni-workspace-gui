import { Suspense } from "react";
import { useAtom } from "jotai";
import SetupGuide from "./components/SetupGuide";
import { WorkspaceBasePathAtom } from "./components/Workspace/state";
import Workspace from "./components/Workspace";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

function App() {
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    return (
        <div className="container">
            {workspaceBasePath ? (
                <Suspense>
                    <Workspace />
                </Suspense>
            ) : (
                <SetupGuide />
            )}
        </div>
    );
}

export default App;
