import toHsla from './toHsla';

const guard = (low: number, high: number, given: number) =>
  Math.min(Math.max(given, low), high);

function lightnessDarken(color: string, amount: number) {
  const [hue, saturation, lightness, alpha] = toHsla(color);
  return `hsla(${hue}, ${saturation * 100}%, ${
    guard(0, 1, lightness - amount) * 100
  }%, ${alpha})`;
}

export default lightnessDarken;
