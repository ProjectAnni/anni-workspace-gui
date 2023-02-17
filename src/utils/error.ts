export class TauriInvokeError extends Error {}

export function processTauriError(e: unknown): Error {
    if (typeof e === "string") {
        return new TauriInvokeError(e);
    }
    return new TauriInvokeError("Tauri IPC Invoke Error");
}
