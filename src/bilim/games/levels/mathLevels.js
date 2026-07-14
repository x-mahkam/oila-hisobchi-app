// ═══════════════════════════════════════════════════════════
//  MATH LEVELS — 15 Unified Math Levels Map
// ═══════════════════════════════════════════════════════════

export const MATH_LEVELS = [
  { id: 1,  game: "math/addition",    difficulty: "easy",   questionCount: 8,  passPct: 60 },
  { id: 2,  game: "math/addition",    difficulty: "easy",   questionCount: 10, passPct: 70 },
  { id: 3,  game: "math/subtraction", difficulty: "easy",   questionCount: 8,  passPct: 60 },
  { id: 4,  game: "math/subtraction", difficulty: "easy",   questionCount: 10, passPct: 70 },
  { id: 5,  game: "math/addition",    difficulty: "medium", questionCount: 10, passPct: 70 },
  { id: 6,  game: "math/subtraction", difficulty: "medium", questionCount: 10, passPct: 70 },
  { id: 7,  game: "math/addition",    difficulty: "medium", questionCount: 12, passPct: 75 },
  { id: 8,  game: "math/subtraction", difficulty: "medium", questionCount: 12, passPct: 75 },
  { id: 9,  game: "math/addition",    difficulty: "hard",   questionCount: 10, passPct: 75 },
  { id: 10, game: "math/subtraction", difficulty: "hard",   questionCount: 10, passPct: 75 },
  { id: 11, game: "math/multiply",    difficulty: "easy",   questionCount: 8,  passPct: 60 },
  { id: 12, game: "math/multiply",    difficulty: "easy",   questionCount: 10, passPct: 70 },
  { id: 13, game: "math/multiply",    difficulty: "medium", questionCount: 10, passPct: 70 },
  { id: 14, game: "math/multiply",    difficulty: "medium", questionCount: 12, passPct: 75 },
  { id: 15, game: "math/multiply",    difficulty: "hard",   questionCount: 12, passPct: 80 }
];

export function starsFor(pct, passPct) {
  if (pct < passPct) return 0;      // failed
  if (pct >= 100) return 3;
  if (pct >= (passPct + 100) / 2) return 2;
  return 1;
}
