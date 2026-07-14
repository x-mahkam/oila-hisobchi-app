const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Available shape symbols
// Each symbol has an ID, and we can draw beautiful SVG outline icons in the game
export const PATTERN_SHAPES_META = {
  coin: { uz: "Tanga", ru: "Монета", en: "Coin" },
  note: { uz: "Banknota", ru: "Банкнота", en: "Banknote" },
  card: { uz: "Karta", ru: "Карта", en: "Card" },
  piggy: { uz: "Hamyon", ru: "Копилка", en: "Piggy Bank" },
  star: { uz: "Yulduz", ru: "Звезда", en: "Star" },
  heart: { uz: "Yurak", ru: "Сердце", en: "Heart" },
  shield: { uz: "Qalqon", ru: "Щит", en: "Shield" },
  gem: { uz: "Olmos", ru: "Кристалл", en: "Gem" },
};

export const patternShapesGenerator = (difficulty = "easy") => {
  const keys = Object.keys(PATTERN_SHAPES_META);
  
  // Select 2 or 3 distinct shapes for the pattern
  const count = difficulty === "easy" ? 2 : difficulty === "medium" ? 3 : 4;
  const chosenKeys = shuffle(keys).slice(0, count);

  const [A, B, C, D] = chosenKeys;

  // Patterns templates
  let template = [];
  let length = 6;

  if (difficulty === "easy") {
    // simple ABAB or AABAAB or ABBABB
    const types = ["ABAB", "AABAAB", "ABBABB"];
    const type = types[rnd(0, types.length - 1)];
    if (type === "ABAB") {
      template = [A, B, A, B, A, B];
    } else if (type === "AABAAB") {
      template = [A, A, B, A, A, B];
    } else {
      template = [A, B, B, A, B, B];
    }
    length = 6;
  } else if (difficulty === "medium") {
    // ABCABC or ABBAABBA or AABBCC
    const types = ["ABCABC", "ABBA", "AABB"];
    const type = types[rnd(0, types.length - 1)];
    if (type === "ABCABC") {
      template = [A, B, C, A, B, C, A, B, C];
      length = 9;
    } else if (type === "ABBA") {
      template = [A, B, B, A, A, B, B, A];
      length = 8;
    } else {
      template = [A, A, B, B, C, C, A, A, B, B, C, C];
      length = 8;
    }
  } else {
    // Hard: ABCDA or growing patterns (A, AB, ABC, ABCD or A, BB, CCC)
    const types = ["ABCD", "GROW_AB", "GROW_A"];
    const type = types[rnd(0, types.length - 1)];
    if (type === "ABCD") {
      template = [A, B, C, D, A, B, C, D];
      length = 8;
    } else if (type === "GROW_AB") {
      // A, B, A, B, B, A, B, B, B
      template = [A, B, A, B, B, A, B, B, B, A];
      length = 9;
    } else {
      // A, B, B, C, C, C, A, B, B, C, C, C
      template = [A, B, B, C, C, C, A, B, B, C, C, C];
      length = 12;
    }
  }

  // Ensure values array is formed
  const values = template.slice(0, length);

  // We make the last element missing (classic pattern continuation)
  // Or occasionally a middle one for Hard difficulty
  const missingIdx = difficulty === "hard" ? rnd(values.length - 3, values.length - 1) : values.length - 1;
  const answer = values[missingIdx];

  // Options must consist of distinct shape keys, including the correct one
  const optsSet = new Set([answer]);
  // Add other available keys
  chosenKeys.forEach(k => optsSet.add(k));
  // Add some random keys if we have less than 4 options
  let guard = 0;
  while (optsSet.size < 4 && guard < 50) {
    guard++;
    optsSet.add(keys[rnd(0, keys.length - 1)]);
  }

  const options = shuffle([...optsSet]).slice(0, 4);

  // Question representation: we pass down the list of shape IDs, plus metadata
  return {
    prompt: `Naqshni davom ettiring: ${values.map((v, idx) => idx === missingIdx ? "?" : v).join(" -> ")}`,
    answer,
    options,
    meta: {
      values,
      missingIdx,
      difficulty
    }
  };
};
