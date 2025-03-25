// Password validation
export const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    const errors = [];
    if (password.length < minLength) errors.push('Password must be at least 8 characters long');
    if (!hasUpperCase) errors.push('Password must contain at least one uppercase letter');
    if (!hasLowerCase) errors.push('Password must contain at least one lowercase letter');
    if (!hasNumbers) errors.push('Password must contain at least one number');
    if (!hasSpecialChar) errors.push('Password must contain at least one special character (!@#$%^&*)');
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Email validation
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return {
        isValid: emailRegex.test(email),
        errors: emailRegex.test(email) ? [] : ['Please enter a valid email address']
    };
};

// Username validation
export const validateUsername = (username) => {
    const minLength = 3;
    const maxLength = 20;
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    
    const errors = [];
    if (username.length < minLength) errors.push('Username must be at least 3 characters long');
    if (username.length > maxLength) errors.push('Username must be less than 20 characters');
    if (!usernameRegex.test(username)) errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

// Session validation
export const validateSession = (session) => {
    if (!session) return false;
    
    // Check if session is expired
    const expiresAt = new Date(session.expires_at).getTime();
    const now = new Date().getTime();
    
    return expiresAt > now;
}; 