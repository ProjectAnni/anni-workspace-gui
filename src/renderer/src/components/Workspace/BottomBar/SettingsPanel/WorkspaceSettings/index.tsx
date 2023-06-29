import { useSettings } from "@/state/settings";
import { Checkbox, FormGroup } from "@blueprintjs/core";

const WorkspaceSettings: React.FC = () => {
    const [skipContinuousImportConfirm, setSkipContinuousImportConfirm] = useSettings(
        "workspace.skipContinuousImportConfirm",
        "0"
    );

    return (
        <FormGroup>
            <Checkbox
                label="连续导入跳过确认对话框"
                checked={skipContinuousImportConfirm === "1"}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSkipContinuousImportConfirm(e.target.checked ? "1" : "0");
                }}
            />
        </FormGroup>
    );
};

export default WorkspaceSettings;
