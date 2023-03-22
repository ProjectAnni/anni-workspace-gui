import log from "electron-log/renderer";

class Logger {
    error = (message: string) => {
        log.error(message);
    };

    warning = (message: string) => {
        log.warn(message);
    };

    info = (message: string) => {
        log.info(message);
    };

    debug = (message: string) => {
        log.debug(message);
    };
}

export default new Logger();
