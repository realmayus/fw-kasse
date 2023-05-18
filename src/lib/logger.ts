import log4js from "log4js";

log4js.configure({
    appenders: {
        out: { type: "stdout" },
        app: { type: "file", filename: "output.log" },
    },
    categories: {
        default: { appenders: ["out", "app"], level: "debug" },
    },
});

export const getLogger = log4js.getLogger;
