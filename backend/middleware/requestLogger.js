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
            // For POST/PUT/PATCH, log the request body too if it exists
            if (['POST', 'PUT', 'PATCH'].includes(method) && req.body && Object.keys(req.body).length > 0) {
                const bodyClone = { ...req.body };
                if (bodyClone.password) bodyClone.password = '******'; // Sanitize password
                meta.body = JSON.stringify(bodyClone);
            }
            logger.request(`${method} ${originalUrl}`, meta);
        }
    });

    next();
};
