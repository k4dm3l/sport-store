import joi from 'joi';

export const productSchema = joi.object().keys({
  name: joi.string().trim().required(),
  category: joi.string().uppercase().trim().required(),
  price: joi.number().positive().required(),
  stock: joi.number().integer().positive().required(),
  brand: joi.string().uppercase().trim().required(),
});

export const productByIdSchema = joi.object().keys({
  id: joi.string().regex(/^[0-9a-fA-F]{24}$/)
    .trim()
    .required()
    .messages({
      'string.patter.base': 'search parameter used does not match expected value'
    })
    .required(),
});

export const getProductByCategorySchema = joi.object().keys({
  name: joi.string().uppercase().trim().required(),
  direction: joi.string().trim().valid('next', 'previous')
    .when('reference', { is: joi.exist(), then: joi.required() }),
  limit: joi.number().integer().positive().required(),
  reference: joi.string().regex(/^[0-9a-fA-F]{24}$/)
    .trim()
    .messages({
      'string.pattern.base': 'search parameter used does not match expected value'
    }),
});

export const getProductsSchema = joi.object().keys({
  page: joi.number().integer().positive().required(),
  limit: joi.number().integer().positive().required(),
  search: joi.string().trim(),
});