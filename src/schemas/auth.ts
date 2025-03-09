import joi from 'joi';

export const signInSchema = joi.object().keys({
  email: joi
    .string()
    .email()
    .trim()
    .required(),
  password: joi
    .string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[1-9])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (!@#$%^&*)'
    }).required()
});