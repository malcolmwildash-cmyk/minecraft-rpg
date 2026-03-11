// Isometric coordinate utilities
export const TILE_W = 64;
export const TILE_H = 32;
export const TILE_DEPTH = 8;

export function cartToIso(x: number, y: number): { sx: number; sy: number } {
  return {
    sx: (x - y) * (TILE_W / 2),
    sy: (x + y) * (TILE_H / 2),
  };
}

export function isoToCart(sx: number, sy: number): { x: number; y: number } {
  return {
    x: Math.floor((sx / (TILE_W / 2) + sy / (TILE_H / 2)) / 2),
    y: Math.floor((sy / (TILE_H / 2) - sx / (TILE_W / 2)) / 2),
  };
}

export function tileToScreen(tileX: number, tileY: number, offsetX: number, offsetY: number): { sx: number; sy: number } {
  const iso = cartToIso(tileX, tileY);
  return {
    sx: iso.sx + offsetX,
    sy: iso.sy + offsetY,
  };
}

export function screenToTile(screenX: number, screenY: number, offsetX: number, offsetY: number): { tileX: number; tileY: number } {
  const relX = screenX - offsetX;
  const relY = screenY - offsetY;
  const cart = isoToCart(relX, relY);
  return { tileX: cart.x, tileY: cart.y };
}

export function getTileDepthSort(tileX: number, tileY: number): number {
  return tileX + tileY;
}

export function getMapCenter(mapWidth: number, mapHeight: number, screenWidth: number, screenHeight: number): { offsetX: number; offsetY: number } {
  const centerTileX = mapWidth / 2;
  const centerTileY = mapHeight / 2;
  const centerIso = cartToIso(centerTileX, centerTileY);
  return {
    offsetX: screenWidth / 2 - centerIso.sx,
    offsetY: screenHeight / 3 - centerIso.sy,
  };
}

export function isInBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
