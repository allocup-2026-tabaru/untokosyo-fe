const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const toHex = (value: number) => {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, "0");
};

const GOLDEN_ANGLE = 137.50776405003785;

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation, 0, 100) / 100;
  const l = clamp(lightness, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  return `#${toHex((r + m) * 255)}${toHex((g + m) * 255)}${toHex((b + m) * 255)}`;
};

const randomRange = (rng: () => number, min: number, max: number) => {
  return min + rng() * (max - min);
};

const wrapHue = (hue: number) => {
  return ((hue % 360) + 360) % 360;
};

const warmifyHue = (hue: number) => {
  const wrapped = wrapHue(hue);

  if (wrapped < 120) {
    return wrapped * 0.45;
  }

  if (wrapped < 240) {
    return 20 + (wrapped - 120) * 0.5;
  }

  return 300 + (wrapped - 240) * 0.46;
};

export const createRandomSource = () => {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const buffer = new Uint32Array(1);

    return function random() {
      crypto.getRandomValues(buffer);
      return buffer[0] / 4294967296;
    };
  }

  return function random() {
    return Math.random();
  };
};

const createVividColor = (
  hue: number,
  saturationRange: [number, number],
  lightnessRange: [number, number]
) => {
  const rng = createRandomSource();

  return hslToHex(
    warmifyHue(hue + randomRange(rng, -10, 10)),
    randomRange(rng, saturationRange[0], saturationRange[1]),
    randomRange(rng, lightnessRange[0], lightnessRange[1])
  );
};

const getSpacedHue = (baseHue: number, playerIndex: number, offset: number) => {
  return wrapHue(baseHue + playerIndex * GOLDEN_ANGLE + offset);
};

export const createDogMaterialColors = (baseHue: number, playerIndex: number) => {
  const base = getSpacedHue(baseHue, playerIndex, 12);
  const accent = getSpacedHue(baseHue, playerIndex, 132);
  const tail = getSpacedHue(baseHue, playerIndex, 252);

  return {
    base_color: createVividColor(base, [48, 78], [34, 54]),
    accent_color: createVividColor(accent, [62, 92], [36, 56]),
    nose_color: "#171717",
    tail_color: createVividColor(tail, [52, 84], [30, 50]),
  };
};

export const createJiji2MaterialColors = (baseHue: number, playerIndex: number) => {
  const clothBase = getSpacedHue(baseHue, playerIndex, 24);
  const clothAccent = getSpacedHue(baseHue, playerIndex, 168);
  const bottoms = getSpacedHue(baseHue, playerIndex, 288);

  return {
    clothBase: createVividColor(clothBase, [46, 82], [44, 62]),
    cloth_2: createVividColor(clothAccent, [58, 90], [36, 54]),
    bottoms: createVividColor(bottoms, [44, 80], [20, 36]),
  };
};
