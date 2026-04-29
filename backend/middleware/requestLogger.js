import { logger } from "../utils/logger.js";

/**
 * HTTP request logger middleware.
 * Logs method, URL, status code, response time, and IP for every request.
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const { method, originalUrl, ip } = req;

    res.on("finish", () => {
        const duration = Date.now() - start;
        const status   = res.statusCode;

        const meta = {
            status,
            duration: `${duration}ms`,
            ip: ip || req.socket?.remoteAddress || "-",
        };

        if (status >= 500) {
            logger.error(`${method} ${originalUrl}`, meta);
        } else if (status >= 400) {
            logger.warn(`${method} ${originalUrl}`, meta);
        } else {
            logger.request(`${method} ${originalUrl}`, meta);
        }
    });

    next();
};
