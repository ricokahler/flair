import readableColor from './readableColor';
import getContrast from './getContrast';

import { ReadableColorPalette } from './types';

const hasBadDecorativeContrast = (a: string, b: string) =>
  getContrast(a, b) < 1.5;
const hasBadReadableContrast = (a: string, b: string) => getContrast(a, b) < 3;
const hasBadAaContrast = (a: string, b: string) => getContrast(a, b) < 4.5;
const hasBadAaaContrast = (a: string, b: string) => getContrast(a, b) < 7;

function createReadablePalette(
  color: string,
  surface = '#fff',
): ReadableColorPalette {
  const readableContrast = readableColor(color);

  return {
    original: color,
    decorative: hasBadDecorativeContrast(color, surface)
      ? readableContrast
      : color,
    readable: hasBadReadableContrast(color, surface) ? readableContrast : color,
    aa: hasBadAaContrast(color, surface) ? readableContrast : color,
    aaa: hasBadAaaContrast(color, surface) ? readableContrast : color,
  };
}

export default createReadablePalette;
