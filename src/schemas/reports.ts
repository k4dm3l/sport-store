import joi from 'joi';

export const generalReportSchema = joi.object().keys({
  topCategories: joi.number().integer().positive().required(),
});