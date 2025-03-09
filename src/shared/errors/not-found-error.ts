import BaseError from '@root/shared/errors/base-error';
import { Errors } from '@root/shared/enums/errors';

export default class NotFoundError extends BaseError{
  public details?:Record<string,unknown> | undefined;
  public constructor(message: string, details?: Record<string, unknown>){
    super(message);
    
    this.name = Errors.NOT_FOUND_ERROR;
    this.details = details || {};
    
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}