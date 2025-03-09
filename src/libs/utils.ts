export interface IUtils {
  normalizeNumber: (port: any) => number | undefined;
}

export const utilsFactory = (): IUtils => ({
  normalizeNumber: (port) => {
    const normalizedPortNumber = parseInt(port, 10);
    
    if(Number.isNaN(normalizedPortNumber) || !normalizedPortNumber){
      return undefined;
    }

    return normalizedPortNumber;
  },
});