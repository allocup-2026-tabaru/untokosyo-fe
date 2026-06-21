export type PlacementConfig = {
  maxSpacing: number;
  totalSpacingWidth: number;
  zDepthFactor: number;
  rotationFactor: number;
  startDelayRange: { min: number; max: number };
};

export const ROOM_PLACEMENT_CONFIG: PlacementConfig = {
  maxSpacing: 1.0,
  totalSpacingWidth: 2.6,
  zDepthFactor: 0.12,
  rotationFactor: 0.06,
  startDelayRange: { min: 0, max: 650 },
} as const;
