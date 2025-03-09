export default class BaseError extends Error {
  public details?: Record<string, unknown>;
  public toErrorRecord():{error: string, details?: unknown}{
    const obj:{error: string, details?: unknown} = { error: this.message };
    
    if(this.details){
      obj.details = this.details;
    }
    
    return obj;
  }
}