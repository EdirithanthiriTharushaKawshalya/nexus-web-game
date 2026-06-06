// src/game/utils/math.ts

export interface Vector2 {
  x: number;
  y: number;
}

/**
 * Calculates the Euclidean distance between two points.
 */
export function getDistance(p1: Vector2, p2: Vector2): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the angle in radians between two points.
 */
export function getAngle(p1: Vector2, p2: Vector2): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Snaps a value to a grid.
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.floor(value / gridSize) * gridSize;
}

/**
 * Linearly interpolates between two numbers.
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Generates a random string ID.
 */
export function generateId(length: number = 7): string {
  return Math.random().toString(36).substring(2, 2 + length);
}
