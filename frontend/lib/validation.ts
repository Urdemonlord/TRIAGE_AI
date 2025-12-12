/**
 * Form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return 'Email is required';
  }
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 128) {
    return 'Password is too long (max 128 characters)';
  }
  return null;
}

/**
 * Validate passwords match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): string | null {
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
}

/**
 * Validate name
 */
export function validateName(name: string): string | null {
  if (!name) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  if (name.length > 100) {
    return 'Name is too long';
  }
  return null;
}

/**
 * Validate phone number (basic)
 */
export function validatePhone(phone: string): string | null {
  if (!phone) {
    return null; // Phone is optional
  }
  if (!/^\d{7,15}$/.test(phone.replace(/\D/g, ''))) {
    return 'Please enter a valid phone number';
  }
  return null;
}

/**
 * Validate complaint text
 */
export function validateComplaint(complaint: string): string | null {
  if (!complaint) {
    return 'Please describe your symptoms';
  }
  if (complaint.trim().length < 10) {
    return 'Please provide more details (at least 10 characters)';
  }
  if (complaint.length > 5000) {
    return 'Complaint is too long (max 5000 characters)';
  }
  return null;
}

/**
 * Validate form data
 */
export function validateForm(
  data: Record<string, any>,
  validators: Record<string, (value: any) => string | null>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [field, validator] of Object.entries(validators)) {
    const value = data[field];
    const error = validator(value);

    if (error) {
      errors.push({ field, message: error });
    }
  }

  return errors;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}
