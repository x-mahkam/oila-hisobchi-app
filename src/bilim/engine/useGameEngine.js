// ═══════════════════════════════════════════════════════════
//  useGameEngine — HAR QANDAY quiz-o'yin uchun reusable dvigatel.
//  Fazalar: "intro" → "countdown" → "play" → "result".
//  Modullarni birlashtiradi: generator + adaptive + scoring.
//  O'yin komponenti faqat UI chizadi; mantiq shu yerda.
//
//  config:
//   { questionCount=10, generator(difficulty), startDifficulty="easy",
//     scoring, adaptiveOpts, subject, name, lg }
// ═══════════════════════════════════════════════════════════
import { useState, useCallback, useRef, useMemo } from "react";
import { initAdaptive, stepAdaptive } from "./adaptive.js";
import { initScore, applyAnswer, finalizeScore, DEFAULT_SCORING } from "./scoring.js";
import { buildAISummary, mathSubject } from "./aiSummary.js";

export function useGameEngine(config) {
  const {
    questionCount = 10,
    generator,
    startDifficulty = "easy",
    scoring = DEFAULT_SCORING,
    adaptiveOpts,
    subject = mathSubject,
    name = "",
    lg = "uz",
  } = config;

  const [phase, setPhase] = useState("intro");     // intro | countdown | play | result
  const [qIndex, setQIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [adaptive, setAdaptive] = useState(() => initAdaptive(startDifficulty));
  const [score, setScore] = useState(() => initScore());
  const [lastGain, setLastGain] = useState(0);     // oxirgi javobda topilgan coin (animatsiya)
  const [result, setResult] = useState(null);
  const startTsRef = useRef(0);
  const lockRef = useRef(false);                   // ikkilamchi bosishni bloklash

  const difficultyRef = useRef(startDifficulty);
  difficultyRef.current = adaptive.level;

  const nextQuestion = useCallback((lvl) => {
    setQuestion(generator(lvl || difficultyRef.current));
    lockRef.current = false;
  }, [generator]);

  // O'yinni boshlash (countdown → play)
  const start = useCallback(() => {
    setScore(initScore());
    setAdaptive(initAdaptive(startDifficulty));
    setQIndex(0);
    setResult(null);
    setLastGain(0);
    setPhase("countdown");
  }, [startDifficulty]);

  // Countdown tugadi → birinchi savol
  const beginPlay = useCallback(() => {
    startTsRef.current = Date.now();
    nextQuestion(startDifficulty);
    setPhase("play");
  }, [nextQuestion, startDifficulty]);

  // Javob berish. choice — tanlangan qiymat.
  // callback(correct, gained) — UI animatsiya uchun.
  const answer = useCallback((choice, onFeedback) => {
    if (lockRef.current || !question || phase !== "play") return;
    lockRef.current = true;
    const correct = choice === question.answer;

    const { state: sc, gained } = applyAnswer(score, correct, scoring);
    setScore(sc);
    setLastGain(gained);
    const nextAdaptive = stepAdaptive(adaptive, correct, adaptiveOpts);
    setAdaptive(nextAdaptive);
    if (onFeedback) onFeedback(correct, gained);

    const nextIdx = qIndex + 1;
    // Feedback ko'rsatish uchun kichik kechikish UI tomonda; bu yerda holat yangilanadi
    window.setTimeout(() => {
      if (nextIdx >= questionCount) {
        const fin = finalizeScore(sc, questionCount, scoring);
        const seconds = Math.round((Date.now() - startTsRef.current) / 1000);
        const ai = buildAISummary({ ...fin, difficulty: nextAdaptive.level }, name, lg, subject);
        setResult({ ...fin, seconds, difficulty: nextAdaptive.level, ai });
        setPhase("result");
      } else {
        setQIndex(nextIdx);
        nextQuestion(nextAdaptive.level);
      }
    }, 650);
  }, [question, phase, score, scoring, adaptive, adaptiveOpts, qIndex, questionCount, nextQuestion, name, lg, subject]);

  const progress = useMemo(() => Math.round(qIndex / questionCount * 100), [qIndex, questionCount]);

  return {
    phase, setPhase,
    qIndex, questionCount, question,
    difficulty: adaptive.level,
    score, lastGain, progress, result,
    start, beginPlay, answer,
  };
}
