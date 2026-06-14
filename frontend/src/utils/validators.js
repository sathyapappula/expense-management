export const required = (message = 'This field is required') => ({
  required: true,
  message,
})

export const positiveNumber = (message = 'Must be a positive number') => ({
  validator(_, value) {
    if (!value || Number(value) > 0) return Promise.resolve()
    return Promise.reject(new Error(message))
  },
})

export const nonNegativeNumber = (message = 'Must be non-negative') => ({
  validator(_, value) {
    if (value === undefined || value === null || Number(value) >= 0) return Promise.resolve()
    return Promise.reject(new Error(message))
  },
})

export const emailRule = {
  type: 'email',
  message: 'Please enter a valid email address',
}

export const minLength = (min, message) => ({
  min,
  message: message || `Minimum ${min} characters`,
})

export const percentageRule = {
  validator(_, value) {
    if (!value || (Number(value) >= 0 && Number(value) <= 100)) return Promise.resolve()
    return Promise.reject(new Error('Must be between 0 and 100'))
  },
}
