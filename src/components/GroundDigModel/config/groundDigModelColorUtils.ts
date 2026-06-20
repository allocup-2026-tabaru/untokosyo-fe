const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

const toHex = (value: number) => {
  return Math.round(clamp(value, 0, 255))
    .toString(16)
    .padStart(2, "0");
};

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

const pick = <T,>(rng: () => number, items: readonly T[]) => {
  return items[Math.floor(rng() * items.length)];
};

const mixToward = (base: number, target: number, amount: number) => {
  return base + (target - base) * amount;
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

const createDogPalette = () => {
  const rng = createRandomSource();
  const baseHue = randomRange(rng, 18, 38);
  const baseSaturation = randomRange(rng, 24, 42);
  const baseLightness = randomRange(rng, 40, 61);

  const accentHue = baseHue + randomRange(rng, -6, 6);
  const accentSaturation = clamp(baseSaturation + randomRange(rng, -4, 6), 18, 44);
  const accentLightness = clamp(baseLightness + randomRange(rng, -10, 10), 30, 66);

  const tailHue = mixToward(accentHue, baseHue, randomRange(rng, 0.15, 0.45));
  const tailSaturation = clamp(
    mixToward(accentSaturation, baseSaturation, randomRange(rng, 0.1, 0.45)),
    16,
    44
  );
  const tailLightness = clamp(
    mixToward(accentLightness, baseLightness, randomRange(rng, 0.1, 0.4)),
    28,
    66
  );

  return {
    base_color: hslToHex(baseHue, baseSaturation, baseLightness),
    accent_color: hslToHex(accentHue, accentSaturation, accentLightness),
    nose_color: "#222222",
    tail_color: hslToHex(tailHue, tailSaturation, tailLightness),
  };
};

const createJiji2Palette = () => {
  const rng = createRandomSource();
  const clothAccentSwatches = [
    "#7b8f8a",
    "#8a7f73",
    "#8f7b6a",
    "#7c8797",
    "#8b8a66",
    "#8f6f73",
  ] as const;
  const bottomSwatches = [
    "#6a5b50",
    "#5d655f",
    "#6a6d74",
    "#5c564f",
    "#72604f",
    "#5e5b64",
  ] as const;

  const clothBase = hslToHex(
    randomRange(rng, 28, 44),
    randomRange(rng, 8, 18),
    randomRange(rng, 84, 94)
  );

  const clothAccent = pick(rng, clothAccentSwatches);
  const bottoms = pick(rng, bottomSwatches);

  return {
    clothBase,
    cloth_2: clothAccent,
    bottoms,
  };
};

export const createDogMaterialColors = () => {
  return createDogPalette();
};

export const createJiji2MaterialColors = () => {
  return createJiji2Palette();
};
