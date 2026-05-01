/**
 * Email Rate Limiting Middleware
 * Prevents OTP spam by limiting requests per email address
 * 
 * Limits:
 * - 3 OTP requests per hour per email
 * - 10 OTP requests per day per email
 */

// In-memory store for rate limiting (consider Redis for production)
// Format: { 'email': { count: number, resetAt: timestamp } }
const rateLimitStore = {};

const LIMIT_PER_HOUR = 3;
const LIMIT_PER_DAY = 10;
const HOUR_IN_MS = 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Rate limit middleware for email-based operations (OTP, verification)
 * @param {number} maxPerHour - Max requests per hour (default 3)
 * @param {number} maxPerDay - Max requests per day (default 10)
 */
export const emailRateLimiter = (maxPerHour = LIMIT_PER_HOUR, maxPerDay = LIMIT_PER_DAY) => {
    return (req, res, next) => {
        const email = req.body.email?.toLowerCase();

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const now = Date.now();
        const key = `limit_${email}`;

        // Initialize if not exists
        if (!rateLimitStore[key]) {
            rateLimitStore[key] = {
                hourCount: 0,
                dayCount: 0,
                hourResetAt: now + HOUR_IN_MS,
                dayResetAt: now + DAY_IN_MS,
            };
        }

        const record = rateLimitStore[key];

        // Reset hour counter if expired
        if (now >= record.hourResetAt) {
            record.hourCount = 0;
            record.hourResetAt = now + HOUR_IN_MS;
        }

        // Reset day counter if expired
        if (now >= record.dayResetAt) {
            record.dayCount = 0;
            record.dayResetAt = now + DAY_IN_MS;
        }

        // Check limits
        if (record.hourCount >= maxPerHour) {
            const remainingTime = Math.ceil((record.hourResetAt - now) / 60000);
            return res.status(429).json({
                error: `Too many requests. Please try again in ${remainingTime} minutes.`,
                retryAfter: remainingTime * 60,
            });
        }

        if (record.dayCount >= maxPerDay) {
            const remainingTime = Math.ceil((record.dayResetAt - now) / 3600000);
            return res.status(429).json({
                error: `Daily limit exceeded. Please try again in ${remainingTime} hours.`,
                retryAfter: remainingTime * 3600,
            });
        }

        // Increment counters
        record.hourCount++;
        record.dayCount++;

        // Pass remaining attempts info to response
        res.locals.rateLimitInfo = {
            remainingHour: maxPerHour - record.hourCount,
            remainingDay: maxPerDay - record.dayCount,
        };

        next();
    };
};

/**
 * Clear rate limit for an email (call after successful verification)
 */
export const clearEmailRateLimit = (email) => {
    const key = `limit_${email.toLowerCase()}`;
    delete rateLimitStore[key];
};

/**
 * Manual cleanup of expired rate limit records (can be called periodically)
 */
export const cleanupExpiredLimits = () => {
    const now = Date.now();
    let cleaned = 0;

    for (const key in rateLimitStore) {
        const record = rateLimitStore[key];
        if (now >= record.dayResetAt) {
            delete rateLimitStore[key];
            cleaned++;
        }
    }

    console.log(`Cleaned up ${cleaned} expired rate limit records`);
    return cleaned;
};

// Optionally run cleanup every hour
setInterval(cleanupExpiredLimits, HOUR_IN_MS);
