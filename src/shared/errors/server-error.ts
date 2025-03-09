import BaseError from '@root/shared/errors/base-error';
import { Errors } from '@root/shared/enums/errors';

export default class ServerError extends BaseError{
  public details?: Record<string, unknown> | undefined;
    
  public constructor(message: string, details?: Record<string, unknown>){
    super(message);
    
    this.name = Errors.SERVER_ERROR;
    this.details = details || {};
    
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}