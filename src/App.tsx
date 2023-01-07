import { useAtom } from "jotai";
import SetupGuide from "./components/SetupGuide";
import { WorkspaceBasePathAtom } from "./state/workspace";
import Workspace from "./components/Workspace";
import "@blueprintjs/core/lib/css/blueprint.css";
import "./App.css";

function App() {
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    return (
        <div className="container">
            {workspaceBasePath ? <Workspace /> : <SetupGuide />}
        </div>
    );
}

export default App;
