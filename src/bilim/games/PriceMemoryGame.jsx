// ═══════════════════════════════════════════════════════════
//  PRICE MEMORY GAME (Xotira - Moliyaviy Savodxonlik)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { PageHeader, PrimaryButton, StatCard, AppCard, Badge } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { priceMemoryPairs } from "./data/priceMemoryPairs.js";
import { addCoins, logGameSession, bestForGame, readCoins } from "../engine/persist.js";
import { addXp, readXp, levelFor, didLevelUp } from "../engine/xp.js";
import { DIFF, rewardOf, tierFor, medalSvg } from "../registry.jsx";
import { playSound } from "../engine/sound.js";
import { f } from "../../utils/formatters.js";

// Helper coin icon
const coinIco = (c, s = 20) => (
  <svg width={s} height={s} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke={c} strokeWidth="1.5" fill={c} fillOpacity=".2" />
    <path d="M10 7v6M8 10h4" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export default function PriceMemoryGame({ user, lg = "uz", dark, gameId = "memory/pairs", name, onBack }) {
  const th = dark ? PALETTE.dark : PALETTE.light;
  const uz = lg === "uz";
  const ru = lg === "ru";
  const en = lg === "en";

  const L = (uzVal, ruVal, enVal) => {
    if (ru) return ruVal || uzVal;
    if (en) return enVal || uzVal;
    return uzVal;
  };

  // Game states
  const [phase, setPhase] = useState("intro"); // intro | play | result
  const [selectedForSession, setSelectedForSession] = useState([]);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedProductIds, setMatchedProductIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Rewards/Persistence states
  const [totalCoins, setTotalCoins] = useState(0);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [record, setRecord] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [saved, setSaved] = useState(false);
  const savingRef = useRef(false);

  // Load current coins
  useEffect(() => {
    if (user?.id) {
      readCoins(user.id).then(setTotalCoins);
    }
  }, [user?.id]);

  // Set up 8 random products when the game enters the intro screen
  useEffect(() => {
    if (phase === "intro") {
      const selected = [...priceMemoryPairs]
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);
      setSelectedForSession(selected);
    }
  }, [phase]);

  // Start new game
  const startNewGame = () => {
    const productsToUse = selectedForSession.length > 0 
      ? selectedForSession 
      : [...priceMemoryPairs].sort(() => 0.5 - Math.random()).slice(0, 8);

    // Create name and price cards
    const cardList = [];
    productsToUse.forEach(prod => {
      cardList.push({
        id: `name-${prod.id}`,
        productId: prod.id,
        type: "name",
        content: prod.product[lg] || prod.product.uz,
      });
      cardList.push({
        id: `price-${prod.id}`,
        productId: prod.id,
        type: "price",
        content: f(prod.price, true),
      });
    });

    // Shuffle the 16 cards
    const shuffledCards = cardList.sort(() => 0.5 - Math.random());

    setCards(shuffledCards);
    setFlippedIndices([]);
    setMatchedProductIds([]);
    setMoves(0);
    setStartTime(Date.now());
    setSaved(false);
    savingRef.current = false;
    setPhase("play");
  };

  // Card click handler
  const handleCardClick = (index) => {
    // If already 2 cards are flipped, or this card is already flipped/matched, ignore
    if (flippedIndices.length >= 2) return;
    if (flippedIndices.includes(index)) return;
    if (matchedProductIds.includes(cards[index].productId)) return;

    playSound.tick();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // When 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const firstCard = cards[newFlipped[0]];
      const secondCard = cards[newFlipped[1]];

      if (firstCard.productId === secondCard.productId) {
        // It's a match!
        playSound.correct();
        setMatchedProductIds(prev => [...prev, firstCard.productId]);
        setFlippedIndices([]);

        // Check if all 8 pairs matched
        if (matchedProductIds.length + 1 === 8) {
          const totalTime = Math.round((Date.now() - startTime) / 1000);
          setElapsed(totalTime);
          setTimeout(() => {
            setPhase("result");
          }, 600);
        }
      } else {
        // No match: turn them back after brief delay
        setTimeout(() => {
          playSound.wrong();
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  // Save results
  useEffect(() => {
    if (phase !== "result" || savingRef.current || !user?.id) return;
    savingRef.current = true;

    (async () => {
      const prevBest = await bestForGame(user.id, gameId);
      const beforeXp = await readXp(user.id);

      // Base coins for memory subject: coin=1.2, xp=2 per match (total 8 matches = 10 coins, 16 xp)
      // Efficiency bonus:
      // moves <= 12: +2 coins, +4 xp
      // moves <= 16: +1 coin, +2 xp
      let bonusCoins = 0;
      let bonusXp = 0;
      if (moves <= 12) {
        bonusCoins = 2;
        bonusXp = 4;
      } else if (moves <= 16) {
        bonusCoins = 1;
        bonusXp = 2;
      }

      const baseCoinReward = Math.round(8 * 1.2) + bonusCoins;
      const baseXpReward = (8 * 2) + bonusXp;

      // Save to DB
      const updatedCoins = await addCoins(user.id, baseCoinReward);
      setTotalCoins(updatedCoins);
      const afterXp = await addXp(user.id, baseXpReward);
      const isRec = baseCoinReward > prevBest;
      const lvlUp = didLevelUp(beforeXp, afterXp);

      playSound.victory();

      await logGameSession(user.id, {
        gameId,
        subject: "memory",
        correct: 8,
        total: 8,
        pct: 100,
        seconds: elapsed,
        maxCombo: moves, // Store moves count in maxCombo field
        coins: baseCoinReward,
        xp: baseXpReward,
        difficulty: "easy",
        newRecord: isRec,
      });

      setEarnedCoins(baseCoinReward);
      setEarnedXp(baseXpReward);
      setRecord(isRec);
      setLeveledUp(lvlUp);
      setNewLevel(levelFor(afterXp).level);
      setSaved(true);
    })();
  }, [phase, user?.id, moves, elapsed, gameId]);

  return (
    <div style={{ padding: SPACE.s3, minHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
      
      {/* ── INTRO PHASE ── */}
      {phase === "intro" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <PageHeader th={th} title={L("Narx xotirasi", "Память цен", "Price memory")} onBack={onBack} />

            <div style={{ textAlign: "center", margin: "24px 0" }}>
              <div style={{ width: 80, height: 80, borderRadius: RADIUS.l, background: th.ac2 + ALPHA.soft, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: SPACE.s3 }}>
                <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
                  <path d="M8 6h16a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" stroke={th.ac2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={th.ac2} fillOpacity="0.14" />
                  <path d="M11 12h4M11 16h10M11 20h7" stroke={th.ac2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ ...TYPE.heading, color: th.t1, fontSize: 24, fontWeight: 900, marginBottom: SPACE.s2 }}>
                {L("Mahsulot va narxini eslab qoling", "Запоминайте товары и их цены", "Remember products and their prices")}
              </h2>
              <p style={{ ...TYPE.caption, color: th.t2, fontSize: 15, lineHeight: 1.5, maxWidth: 320, margin: "0 auto" }}>
                {L(
                  "Klassik xotira o'yini: mahsulotlar nomi va ularning narxi juftliklarini toping va eslab qolish mahoratingizni sinab ko'ring!",
                  "Классическая тренировка памяти: сопоставляйте товары с их ценами и развивайте финансовую внимательность!",
                  "Classic memory game: match products with their correct prices and test your retention skills!"
                )}
              </p>
            </div>

            <AppCard th={th} style={{ background: th.gr + ALPHA.faint, border: "1px solid " + th.gr + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", gap: SPACE.s3, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: RADIUS.m, background: th.gr + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", color: th.gr, fontWeight: "bold" }}>1</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...TYPE.subtitle, color: th.gr, fontWeight: 800, margin: 0, fontSize: 14 }}>
                    {L("Kartalarni oching", "Открывайте карты", "Flip cards")}
                  </h4>
                  <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0 0", fontSize: 13, lineHeight: 1.4 }}>
                    {L("Ikkita kartani tanlang — biri mahsulot nomi, ikkinchisi uning narxi.", "Переверните две карточки — одну с названием, другую с ценой.", "Flip any two cards: one is the product, and the other is its price.")}
                  </p>
                </div>
              </div>
            </AppCard>

            <AppCard th={th} style={{ background: th.ac + ALPHA.faint, border: "1px solid " + th.ac + ALPHA.med, marginBottom: SPACE.s3 }}>
              <div style={{ display: "flex", gap: SPACE.s3, alignItems: "center" }}>
                <div style={{ width: 36, height: 36, borderRadius: RADIUS.m, background: th.ac + ALPHA.soft, display: "flex", alignItems: "center", justifyContent: "center", color: th.ac, fontWeight: "bold" }}>2</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ ...TYPE.subtitle, color: th.ac, fontWeight: 800, margin: 0, fontSize: 14 }}>
                    {L("Juftliklarni toping", "Сопоставляйте пары", "Match correctly")}
                  </h4>
                  <p style={{ ...TYPE.caption, color: th.t2, margin: "2px 0 0 0", fontSize: 13, lineHeight: 1.4 }}>
                    {L("Agar narxi to'g'ri bo'lsa, juftlik ochiq qoladi. Kamroq urinishda ko'proq coin oling!", "Если сопоставление верное, пара останется открытой. Меньше ходов — больше монет!", "If they match, they stay open. Spend fewer moves to earn bonus coins!")}
                  </p>
                </div>
              </div>
            </AppCard>

            {/* Today's Price Catalog for study */}
            {selectedForSession.length > 0 && (
              <div style={{ marginTop: SPACE.s3, marginBottom: SPACE.s3 }}>
                <h3 style={{ ...TYPE.subtitle, color: th.t1, fontWeight: 800, marginBottom: "8px", fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🛒</span> {L("Bugungi Narxlar Katalogi", "Katalog narxlar bugun", "Today's Price Catalog")}
                </h3>
                <p style={{ ...TYPE.caption, color: th.t2, fontSize: 13, marginBottom: "12px", lineHeight: 1.4 }}>
                  {L("O'yinni boshlashdan oldin narxlarni yaxshilab eslab qoling!", "Перед началом игры хорошенько запомните цены!", "Before starting the game, memorize these prices carefully!")}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", background: th.sur, border: "1.5px solid " + th.bor, borderRadius: RADIUS.m, padding: "12px", boxSizing: "border-box" }}>
                  {selectedForSession.map(prod => (
                    <div key={prod.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: th.surH || "rgba(0,0,0,0.15)", borderRadius: RADIUS.s, border: "1px solid " + th.bor }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: th.t1 }}>{prod.product[lg] || prod.product.uz}</span>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: th.gr }}>{f(prod.price, true)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <PrimaryButton th={th} onClick={startNewGame} style={{ marginTop: SPACE.s3 }}>
            {L("O'yinni boshlash", "Начать игру", "Start Game")}
          </PrimaryButton>
        </div>
      )}

      {/* ── PLAY PHASE ── */}
      {phase === "play" && cards.length > 0 && (() => {
        return (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <PageHeader th={th} title={`${L("Urinishlar", "Ходы", "Moves")}: ${moves}`} onBack={() => setPhase("intro")} />

              {/* Progress: Matched Pairs */}
              <div style={{ display: "flex", justifyContent: "space-between", ...TYPE.tiny, color: th.t2, marginBottom: 8 }}>
                <span>{L("Topilgan juftliklar", "Найдено пар", "Matched pairs")}</span>
                <span style={{ fontWeight: 700, color: th.gr }}>{matchedProductIds.length} / 8</span>
              </div>
              <div style={{ height: 6, width: "100%", background: th.bor, borderRadius: RADIUS.pill, marginBottom: 24, overflow: "hidden" }}>
                <div style={{ width: `${(matchedProductIds.length / 8) * 100}%`, height: "100%", background: th.gr, borderRadius: RADIUS.pill, transition: "width 0.3s" }} />
              </div>

              {/* Grid of 16 cards (4x4) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: SPACE.s2, boxSizing: "border-box" }}>
                {cards.map((card, idx) => {
                  const isFlipped = flippedIndices.includes(idx);
                  const isMatched = matchedProductIds.includes(card.productId);
                  const showFront = isFlipped || isMatched;

                  let cardBg = th.sur;
                  let cardBdr = th.bor;
                  let textColor = th.t1;

                  if (isMatched) {
                    cardBg = th.gr + ALPHA.faint;
                    cardBdr = th.gr + "66";
                    textColor = th.gr;
                  } else if (isFlipped) {
                    cardBg = th.ac + ALPHA.faint;
                    cardBdr = th.ac;
                  }

                  return (
                    <button
                      key={card.id}
                      className="ui-press"
                      onClick={() => handleCardClick(idx)}
                      disabled={isMatched}
                      style={{
                        aspectRatio: "1/1",
                        background: cardBg,
                        border: "1.5px solid " + cardBdr,
                        borderRadius: RADIUS.m,
                        cursor: isMatched ? "default" : "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "6px",
                        boxSizing: "border-box",
                        transition: "all 0.2s ease",
                      }}
                    >
                      {showFront ? (
                        <div style={{
                          textAlign: "center",
                          wordBreak: "break-word",
                          lineHeight: "1.2",
                          fontSize: card.type === "price" ? "12px" : "13px",
                          fontWeight: card.type === "price" ? "800" : "600",
                          color: textColor
                        }}>
                          {card.content}
                        </div>
                      ) : (
                        // Geometric outline back (no emojis)
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.38 }}>
                          <rect x="5" y="5" width="14" height="14" rx="3" stroke={th.t3} strokeWidth="2" strokeDasharray="3 3" />
                          <circle cx="12" cy="12" r="3" stroke={th.t3} strokeWidth="2" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <p style={{ ...TYPE.tiny, color: th.t3, textTransform: "none", letterSpacing: 0 }}>
                {L(
                  "Eslatma: Mahsulot nomi va uning narxi juftligini toping.",
                  "Подсказка: Сопоставляйте название товара с его ценой.",
                  "Tip: Pair the name of the product with its correct price tag."
                )}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── RESULT PHASE ── */}
      {phase === "result" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
          <div style={{ textAlign: "center", marginBottom: SPACE.s4 }}>
            <div style={{ display: "inline-flex", justifyContent: "center", transform: "scale(1.2)", marginBottom: SPACE.s2 }}>
              {moves <= 14 ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={PREMIUM.gold} strokeWidth="1.5">
                  <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4a1 1 0 01-1-1v-2.34c0-.37.2-.7.53-.86L10 11.23M20 11.23l6.47 2.57c.33.16.53.49.53.86V17a1 1 0 01-1 1h-5c-.55 0-1-.45-1-1v-2.34" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="6" y="2" width="12" height="12" rx="3"/>
                </svg>
              ) : (
                medalSvg(th.ac2, 48)
              )}
            </div>
            <h2 style={{ ...TYPE.display, fontSize: 24, color: th.t1, margin: 0 }}>
              {moves <= 14 
                ? L("Ajoyib xotira mahorati! 🏆", "Потрясающая память! 🏆", "Excellent Memory! 🏆") 
                : L("Yaxshi o'yin! 👏", "Хорошая игра! 👏", "Well Played! 👏")}
            </h2>
            <p style={{ ...TYPE.subtitle, color: th.t2, margin: "6px 0 0 0" }}>
              {L("Hammasini topdingiz!", "Вы нашли все пары!", "Matched all pairs!")}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2, marginBottom: SPACE.s3 }}>
            <StatCard th={th} value={moves} label={L("Urinishlar", "Ходы", "Moves")} tone={th.ac} />
            <StatCard th={th} value={`${elapsed}s`} label={L("Sarflandi", "Время", "Time")} tone={th.gr} />
            <StatCard th={th} value="100%" label={L("To'g'rilik", "Точность", "Accuracy")} tone={th.ac2} />
            <StatCard th={th} value={moves <= 12 ? "Excellent" : moves <= 16 ? "Great" : "Good"} label="Rating" tone={th.am} />
          </div>

          {/* Earned Coins */}
          <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: PREMIUM.gold + ALPHA.faint, border: "1px solid " + PREMIUM.gold + ALPHA.med, marginBottom: SPACE.s2 }}>
            {coinIco(PREMIUM.gold, 28)}
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>{L("Topilgan coin", "Полученные монеты", "Earned Coins")}</div>
              <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{earnedCoins}</div>
            </div>
            {record && <Badge th={th} tone={PREMIUM.gold}>REKORD</Badge>}
          </AppCard>

          {/* Earned XP */}
          <AppCard th={th} style={{ display: "flex", alignItems: "center", gap: SPACE.s3, background: th.ac2 + ALPHA.faint, border: "1px solid " + th.ac2 + ALPHA.med, marginBottom: SPACE.s3 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.8 6 6.2.7-4.6 4.3 1.2 6.3L12 17.8 6.4 20.3l1.2-6.3L3 9.7 9.2 9 12 3z" stroke={th.ac2} strokeWidth="1.5" strokeLinejoin="round" fill={th.ac2} fillOpacity="0.2"/></svg>
            <div style={{ flex: 1 }}>
              <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>Tajriba (XP)</div>
              <div style={{ ...TYPE.title, color: th.t1, fontVariantNumeric: "tabular-nums" }}>+{earnedXp}</div>
            </div>
            {leveledUp && <Badge th={th} tone={th.ac2}>YANGI LEVEL!</Badge>}
          </AppCard>

          {/* Dynamic Tier Progress Card */}
          {(() => {
            const { cur, next } = tierFor(totalCoins);
            let tierPct = 100;
            let progressText = "";
            if (next) {
              const base = cur ? cur.need : 0;
              const diff = next.need - base;
              tierPct = Math.min(100, Math.max(0, ((totalCoins - base) / diff) * 100));
              progressText = L(
                `${next.need - totalCoins} coin keyingi darajaga (${next[lg] || next.uz})`,
                `До следующего уровня (${next[lg] || next.uz}) осталось ${next.need - totalCoins} монет`,
                `${next.need - totalCoins} coins to next level (${next[lg] || next.uz})`
              );
            } else {
              progressText = L("Siz afsonaviy darajadasiz!", "Вы на легендарном уровне!", "You are at the Legend level!");
            }
            const tierName = cur ? cur[lg] || cur.uz : L("Boshlang'ich", "Новичок", "Novice");
            const tierColor = cur ? cur.color : th.ac2;
            return (
              <AppCard th={th} style={{ display: "flex", flexDirection: "column", gap: SPACE.s2, background: th.sur, border: "1px solid " + th.bor, marginBottom: SPACE.s3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: SPACE.s3 }}>
                  {medalSvg(tierColor, 28)}
                  <div style={{ flex: 1 }}>
                    <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2 }}>
                      {L("Sizning darajangiz", "Ваш уровень", "Your Tier")}
                    </div>
                    <div style={{ ...TYPE.title, color: tierColor, fontSize: 18, fontWeight: 800 }}>
                      {tierName} ({totalCoins} {L("coin", "монет", "coins")})
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ ...TYPE.tiny, textTransform: "none", letterSpacing: 0, color: th.t2, marginBottom: 4 }}>
                    {progressText}
                  </div>
                  <div style={{ height: 6, borderRadius: RADIUS.pill, background: th.bor, overflow: "hidden" }}>
                    <div style={{ width: tierPct + "%", height: "100%", background: tierColor, borderRadius: RADIUS.pill }} />
                  </div>
                </div>
              </AppCard>
            );
          })()}

          {/* Action buttons */}
          <PrimaryButton th={th} onClick={startNewGame}>
            {L("Qayta o'ynash", "Играть еще раз", "Play Again")}
          </PrimaryButton>
          
          <button className="ui-press" onClick={() => setPhase("intro")}
            style={{
              width: "100%",
              marginTop: SPACE.s2,
              background: "transparent",
              border: "none",
              color: th.t2,
              padding: SPACE.s3,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: 15
            }}>
            {L("Ortga qaytish", "Назад в меню", "Back")}
          </button>
        </div>
      )}

    </div>
  );
}
