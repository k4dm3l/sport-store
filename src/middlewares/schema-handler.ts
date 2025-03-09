import boom from '@hapi/boom';
import joi, { Schema, ValidationError } from 'joi';
import { Request, Response, NextFunction } from 'express';

const validate = (data: any, schema: Schema): ValidationError | undefined => {
  if (!joi.isSchema(schema)) {
    schema = joi.object(schema);
  }

  const { error } = schema.validate(data);
  return error;
};

export const schemaValidation = (schema: Schema, check: string = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const error = validate(req[check as keyof Request], schema);
    
    if (error) {
      return next(boom.badData(error.message));
    }
    
    next();
  };
};