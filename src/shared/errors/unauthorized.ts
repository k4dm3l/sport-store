import BaseError from '@root/shared/errors/base-error';
import { Errors } from '@root/shared/enums/errors';

export default class UnauthorizedError extends BaseError {
  public details?:Record<string,unknown> | undefined;
  public constructor(message: string, details?: Record<string, unknown>){
    super(message);
    
    this.name = Errors.UNAUTHORIZED_ERROR;
    this.details = details || {};
    
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}