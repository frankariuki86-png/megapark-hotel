// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};

// Phone validation (Kenya format)
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+254|0)[0-9]{9}$/;
  const cleaned = phone.replace(/\s|-/g, '');
  
  if (!cleaned || !phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Please enter a valid phone number (+254 or 0 followed by 9 digits)' };
  }
  return { valid: true, formatted: cleaned };
};

// Password validation
export const validatePassword = (password, minLength = 6) => {
  if (!password || password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  return { valid: true };
};

// Date validation
export const validateDateRange = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) {
    return { valid: false, error: 'Please select both check-in and check-out dates' };
  }

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (checkIn < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }

  if (checkOut <= checkIn) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  if (nights > 365) {
    return { valid: false, error: 'Booking cannot exceed 365 days' };
  }

  return { valid: true, nights };
};

// Number validation
export const validateNumber = (value, min = 0, max = Infinity, label = 'Number') => {
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    return { valid: false, error: `${label} must be a valid number` };
  }
  
  if (num < min) {
    return { valid: false, error: `${label} must be at least ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `${label} cannot exceed ${max}` };
  }
  
  return { valid: true, value: num };
};

// Text field validation
export const validateText = (text, minLength = 1, maxLength = 500, label = 'Text') => {
  const trimmed = text.trim();
  
  if (!trimmed || trimmed.length < minLength) {
    return { valid: false, error: `${label} must be at least ${minLength} characters` };
  }
  
  if (trimmed.length > maxLength) {
    return { valid: false, error: `${label} cannot exceed ${maxLength} characters` };
  }
  
  return { valid: true, value: trimmed };
};

// Event type validation
export const validateEventType = (type) => {
  const validTypes = ['Wedding', 'Pre-wedding', 'Conference', 'Birthday Party', 'Corporate Event', 'Other'];
  
  if (!type || !validTypes.includes(type)) {
    return { valid: false, error: 'Please select a valid event type' };
  }
  
  return { valid: true };
};

// Event package validation
export const validateEventPackage = (packageName) => {
  const validPackages = ['Standard', 'Premium', 'Luxury'];
  
  if (!packageName || !validPackages.includes(packageName)) {
    return { valid: false, error: 'Please select a valid package' };
  }
  
  return { valid: true };
};

// Guest count validation
export const validateGuestCount = (count, min = 1, max = 500) => {
  const result = validateNumber(count, min, max, 'Guest count');
  return result;
};

// Amenities validation
export const validateAmenities = (amenities) => {
  if (!Array.isArray(amenities) || amenities.length === 0) {
    return { valid: false, error: 'Please select at least one amenity' };
  }
  
  return { valid: true };
};

// Price validation
export const validatePrice = (price, min = 100, max = 1000000) => {
  const num = parseFloat(price);
  
  if (isNaN(num)) {
    return { valid: false, error: 'Price must be a valid number' };
  }
  
  if (num < min) {
    return { valid: false, error: `Price must be at least KES ${min}` };
  }
  
  if (num > max) {
    return { valid: false, error: `Price cannot exceed KES ${max}` };
  }
  
  return { valid: true, value: num };
};

// Batch validation helper
export const validateForm = (data, schema) => {
  const errors = {};
  
  for (const [field, validator] of Object.entries(schema)) {
    const result = validator(data[field]);
    if (!result.valid) {
      errors[field] = result.error;
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

// Check if dates conflict with blocked dates
export const checkDateConflict = (checkInDate, checkOutDate, blockedDates = []) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  
  for (let date of blockedDates) {
    const blockedDate = new Date(date);
    if (blockedDate >= checkIn && blockedDate < checkOut) {
      return { valid: false, error: `Room is not available on ${date}` };
    }
  }
  
  return { valid: true };
};
