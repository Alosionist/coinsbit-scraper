export const average = (arr: number[]) => arr.length == 0? 0 : arr.reduce((p: number, c: number) => p + c, 0 ) / arr.length;
