/**
 * OTP (One-Time Password) Generator Utility
 * Generates 6-digit numeric OTPs for email verification
 */

/**
 * Generate a 6-digit OTP
 * @returns {string} 6-digit numeric OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} True if valid 6-digit OTP
 */
export const validateOTPFormat = (otp) => {
    return /^\d{6}$/.test(otp);
};

/**
 * Get OTP expiration timestamp
 * @param {number} minutes - Expiration time in minutes (default 5)
 * @returns {Date} Expiration datetime
 */
export const getOTPExpiry = (minutes = 5) => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
