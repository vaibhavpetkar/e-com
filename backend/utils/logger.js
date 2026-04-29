import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const logFile = path.join(logDir, "app.log");

const LEVEL_COLORS = {
    INFO:    "\x1b[36m",  // Cyan
    SUCCESS: "\x1b[32m",  // Green
    WARN:    "\x1b[33m",  // Yellow
    ERROR:   "\x1b[31m",  // Red
    REQUEST: "\x1b[35m",  // Magenta
    RESET:   "\x1b[0m",
};

function formatEntry(level, message, meta = {}) {
    const ts = new Date().toISOString();
    const metaStr = Object.keys(meta).length
        ? " | " + Object.entries(meta).map(([k, v]) => `${k}=${v}`).join(" ")
        : "";
    return `[${ts}] [${level.padEnd(7)}] ${message}${metaStr}`;
}

function writeToFile(line) {
    try {
        fs.appendFileSync(logFile, line + "\n");
    } catch {
        // silent fail — don't crash the app if logging fails
    }
}

function log(level, message, meta = {}) {
    const line = formatEntry(level, message, meta);

    // Console with color
    const color = LEVEL_COLORS[level] || "";
    console.log(`${color}${line}${LEVEL_COLORS.RESET}`);

    // File (no colors)
    writeToFile(line);
}

export const logger = {
    info:    (msg, meta) => log("INFO",    msg, meta),
    success: (msg, meta) => log("SUCCESS", msg, meta),
    warn:    (msg, meta) => log("WARN",    msg, meta),
    error:   (msg, meta) => log("ERROR",   msg, meta),
    request: (msg, meta) => log("REQUEST", msg, meta),
};
