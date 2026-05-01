import React, { useRef, useEffect } from 'react';
import { Box, TextField, Typography } from '@mui/material';

/**
 * OTPInput Component
 * Displays 6 input fields for OTP entry with auto-advancing
 * 
 * Props:
 * - otp: string - Current OTP value (6 digits)
 * - onChange: function - Callback when OTP changes (receives full 6-digit string)
 * - disabled: boolean - Disable inputs
 * - error: boolean - Show error state
 */
const OTPInput = ({ otp = '', onChange, disabled = false, error = false }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0] && !disabled) {
            inputRefs.current[0].focus();
        }
    }, [disabled]);

    const handleChange = (index, value) => {
        // Only allow digits
        const digit = value.replace(/[^0-9]/g, '');
        if (digit.length > 1) return;

        // Create new OTP string
        const otpArray = otp.split('');
        otpArray[index] = digit;
        const newOtp = otpArray.join('').slice(0, 6);

        onChange(newOtp);

        // Auto-advance to next field
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                // Clear current field
                handleChange(index, '');
            } else if (index > 0) {
                // Move to previous field
                inputRefs.current[index - 1]?.focus();
            }
            e.preventDefault();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

        if (digits) {
            onChange(digits);
            // Focus the last input or next empty field
            const focusIndex = Math.min(digits.length, 5);
            inputRefs.current[focusIndex]?.focus();
        }
    };

    return (
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
            {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextField
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={otp[index] || ''}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    error={error}
                    sx={{
                        width: 50,
                        height: 50,
                        '& .MuiOutlinedInput-input': {
                            textAlign: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            letterSpacing: '8px',
                            padding: '8px 0',
                        },
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            '&:hover fieldset': {
                                borderColor: !error ? '#6366f1' : '#ef4444',
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: !error ? '#6366f1' : '#ef4444',
                                boxShadow: `0 0 0 3px ${!error ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                            },
                        },
                    }}
                />
            ))}
        </Box>
    );
};

export default OTPInput;
