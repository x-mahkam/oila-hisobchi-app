// ═══════════════════════════════════════════════════════════
//  MEMORY LEVELS — 12 Unified Memory Levels Map
// ═══════════════════════════════════════════════════════════

export const MEMORY_LEVELS = [
  { id: 1,  game: "memory/pairs", pairCount: 4,  maxMovesFor3Star: 8,  maxMovesFor2Star: 12 },
  { id: 2,  game: "memory/simon", startLength: 3, targetLength: 5 },
  { id: 3,  game: "memory/pairs", pairCount: 5,  maxMovesFor3Star: 11, maxMovesFor2Star: 16 },
  { id: 4,  game: "memory/simon", startLength: 3, targetLength: 6 },
  { id: 5,  game: "memory/pairs", pairCount: 6,  maxMovesFor3Star: 14, maxMovesFor2Star: 21 },
  { id: 6,  game: "memory/simon", startLength: 4, targetLength: 7 },
  { id: 7,  game: "memory/pairs", pairCount: 8,  maxMovesFor3Star: 22, maxMovesFor2Star: 32 },
  { id: 8,  game: "memory/simon", startLength: 4, targetLength: 8 },
  { id: 9,  game: "memory/pairs", pairCount: 10, maxMovesFor3Star: 30, maxMovesFor2Star: 45 },
  { id: 10, game: "memory/simon", startLength: 5, targetLength: 9 },
  { id: 11, game: "memory/pairs", pairCount: 12, maxMovesFor3Star: 38, maxMovesFor2Star: 58 },
  { id: 12, game: "memory/simon", startLength: 5, targetLength: 10 }
];

export function starsForMemory(moves, level) {
  if (moves <= level.maxMovesFor3Star) return 3;
  if (moves <= level.maxMovesFor2Star) return 2;
  return 1;
}
