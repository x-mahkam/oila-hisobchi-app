// ═══════════════════════════════════════════════════════════
//  LOGIC LEVELS — 20 Unified Logic Levels Map
// ═══════════════════════════════════════════════════════════

export const LOGIC_LEVELS = [
  { id: 1,  game: "logic/pattern",        difficulty: "easy",   questionCount: 6,  passPct: 60 },
  { id: 2,  game: "logic/decision",       difficulty: "easy",   questionCount: 4,  passPct: 60 },
  { id: 3,  game: "logic/pattern-shapes", difficulty: "easy",   questionCount: 6,  passPct: 60 },
  { id: 4,  game: "logic/odd-one-out",    difficulty: "easy",   questionCount: 4,  passPct: 60 },
  { id: 5,  game: "logic/pattern",        difficulty: "easy",   questionCount: 8,  passPct: 70 },
  { id: 6,  game: "logic/decision",       difficulty: "easy",   questionCount: 5,  passPct: 70 },
  { id: 7,  game: "logic/pattern-shapes", difficulty: "easy",   questionCount: 8,  passPct: 70 },
  { id: 8,  game: "logic/odd-one-out",    difficulty: "easy",   questionCount: 5,  passPct: 70 },
  { id: 9,  game: "logic/pattern",        difficulty: "medium", questionCount: 8,  passPct: 70 },
  { id: 10, game: "logic/decision",       difficulty: "medium", questionCount: 5,  passPct: 70 },
  { id: 11, game: "logic/pattern-shapes", difficulty: "medium", questionCount: 8,  passPct: 70 },
  { id: 12, game: "logic/odd-one-out",    difficulty: "medium", questionCount: 5,  passPct: 70 },
  { id: 13, game: "logic/pattern",        difficulty: "medium", questionCount: 10, passPct: 75 },
  { id: 14, game: "logic/decision",       difficulty: "medium", questionCount: 6,  passPct: 75 },
  { id: 15, game: "logic/pattern-shapes", difficulty: "medium", questionCount: 10, passPct: 75 },
  { id: 16, game: "logic/odd-one-out",    difficulty: "medium", questionCount: 6,  passPct: 75 },
  { id: 17, game: "logic/pattern",        difficulty: "hard",   questionCount: 10, passPct: 80 },
  { id: 18, game: "logic/decision",       difficulty: "hard",   questionCount: 6,  passPct: 80 },
  { id: 19, game: "logic/pattern-shapes", difficulty: "hard",   questionCount: 10, passPct: 80 },
  { id: 20, game: "logic/odd-one-out",    difficulty: "hard",   questionCount: 6,  passPct: 80 }
];

export function starsFor(pct, passPct) {
  if (pct < passPct) return 0;      // failed
  if (pct >= 100) return 3;
  if (pct >= (passPct + 100) / 2) return 2;
  return 1;
}
