export function remToPx(value: string): number {
  const remValue = parseFloat(value);

  return Math.round(remValue * 16);
}

export function pxToRem(value: number): string {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(`Invalid pixel value: ${value}`);
  }

  return `${value / 16}rem`;
}
