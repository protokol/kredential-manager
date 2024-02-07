/**
 *  Generate a random hex color based on a string with a consistent result
 *  and colors that have good contrast on white
 * @param text
 */
export const generateHexColorFromString = (text: string) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = ((hash & 0x00ffffff) % 360) / 360;

  const rgb = hsvToRgb(hue, 0.6, 0.9);

  return rgbToHex(rgb[0], rgb[1], rgb[2]);
};

const hsvToRgb = (h: number, s: number, v: number) => {
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    default:
      r = v;
      g = p;
      b = q;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
