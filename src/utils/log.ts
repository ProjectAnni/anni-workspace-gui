import dayjs from "dayjs";
import { throttle } from "lodash";
import { invoke, path, fs } from "@tauri-apps/api";

interface LogItem {
    level: string;
    message: string;
    time: string;
}

class Logger {
    private logPath: string = "";

    private buffer: LogItem[] = [];

    constructor() {
        path.appLogDir().then(async (result) => {
            const logFilePath = await path.resolve(result, "log.txt");
            if (!(await fs.exists(result))) {
                await fs.createDir(result, { recursive: true });
            }
            this.logPath = logFilePath;
        });
    }

    log(level: string, message: string) {
        const time = dayjs().format();
        console.log(`[${time}][${level}] ${message}`);
        this.buffer.push({
            level,
            message,
            time,
        });
        this.flush();
    }

    error = (message: string) => {
        this.log("error", message);
    };

    warning = (message: string) => {
        this.log("warning", message);
    };

    info = (message: string) => {
        this.log("info", message);
    };

    debug = (message: string) => {
        this.log("debug", message);
    };

    private flush = throttle(async () => {
        if (!this.logPath) {
            return;
        }
        if (this.buffer.length > 0) {
            const items = [...this.buffer];
            this.buffer = [];
            //console.log(this.logPath, import.meta.env.DEV);
            await invoke("write_text_file_append", {
                path: this.logPath,
                content: items.map((item) => `[${item.time}][${item.level}] ${item.message}`).join("\n") + "\n",
            });
        }
    }, 3000);
}

export default new Logger();
