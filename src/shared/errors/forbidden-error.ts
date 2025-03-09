import BaseError from '@root/shared/errors/base-error';
import { Errors } from '@root/shared/enums/errors';

export default class ForbiddenError extends BaseError{
  public details?: Record<string, unknown> | undefined;
  
  public constructor(message: string,details?: Record<string, unknown>){
    super(message);
    
    this.name = Errors.FORBIDDEN_ERROR;
    this.details = details || {};
    
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}