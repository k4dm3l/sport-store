import { CachePrefix } from "@root/shared/enums/cache-prefix";

export interface IUtils {
  normalizeNumber: (port: any) => number | undefined;
  buildCacheKey: (prefix: CachePrefix, id: string) => string;
}

export const utilsFactory = (): IUtils => ({
  normalizeNumber: (port) => {
    const normalizedPortNumber = parseInt(port, 10);
    
    if(Number.isNaN(normalizedPortNumber) || !normalizedPortNumber){
      return undefined;
    }

    return normalizedPortNumber;
  },
  buildCacheKey: (prefix, id) => {
    return `${prefix}:${id}`;
  }
});