import { ODD_ONE_OUT_SETS } from "../data/oddOneOutSets.js";

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const oddOneOutGenerator = (difficulty = "easy") => {
  // Filter sets by difficulty
  let eligible = ODD_ONE_OUT_SETS.filter(s => s.difficulty === difficulty);
  if (eligible.length === 0) {
    eligible = ODD_ONE_OUT_SETS; // fallback
  }

  // Pick a random set
  const set = eligible[rnd(0, eligible.length - 1)];

  // The options are the item IDs
  const options = set.items.map(item => item.id);
  // The answer is the ID of the odd item
  const answer = set.items[set.oddIndex].id;

  return {
    prompt: "Guruhdagi toq/boshqacha narsani toping:",
    answer,
    options, // [item_id1, item_id2, item_id3, item_id4]
    meta: {
      set,
      oddIndex: set.oddIndex,
      items: set.items,
      explanation: set.explanation,
      difficulty
    }
  };
};
