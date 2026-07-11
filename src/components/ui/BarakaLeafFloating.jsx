import { useState, useEffect, useRef, memo } from "react";
import { useApp } from "../../context/AppContext.jsx";

// ── Pitch-scalable Retro 8-bit Coin Sound Effect ──
const playCoinSound = (pitchMultiplier = 1.0) => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // First high note (short)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    // Standard B5 note is 987.77 Hz
    osc1.frequency.setValueAtTime(987.77 * pitchMultiplier, now); 
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.08);
    
    // Second higher note (longer, arpeggio)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    // Standard E6 note is 1318.51 Hz
    osc2.frequency.setValueAtTime(1318.51 * pitchMultiplier, now + 0.08); 
    gain2.gain.setValueAtTime(0.0001, now);
    gain2.gain.setValueAtTime(0.06, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.warn("AudioContext error:", e);
  }
};

const LeafIcon = ({ size = 24, color = "#10b981" }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ filter: "drop-shadow(0 2px 4px rgba(16, 185, 129, 0.15))" }}>
    <path d="M15 3C8 3 3.5 6.5 3.5 12c0 1 .2 2 .5 3 5.5 0 11-3 11-12z" fill={color} fillOpacity="0.22" stroke={color} strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M4 15C6.5 11 9.5 8.5 13 6.5" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

export const BarakaLeafFloating = memo(function BarakaLeafFloating({ pTab, setPTab }) {
  const { user, scr, setScr, coinEarnedTrigger, buzz, th, lg } = useApp();
  
  const [isVisible, setIsVisible] = useState(true);
  const [isBouncing, setIsBouncing] = useState(false);
  const [coins, setCoins] = useState([]);
  const [ripples, setRipples] = useState([]);
  
  const hideTimerRef = useRef(null);
  const timeoutsRef = useRef([]);

  // 1. Initial 5 seconds full visibility on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Listen to coin earned trigger (carrying count and ts)
  useEffect(() => {
    if (!coinEarnedTrigger || !coinEarnedTrigger.ts) return;
    
    // Make the leaf fully visible immediately so it can catch the stream
    setIsVisible(true);

    // Determine number of coins to spawn in the stream based on count
    const starCount = coinEarnedTrigger.count || 1;
    let streamSize = 3; // default small stream
    if (starCount >= 15) {
      streamSize = 10; // massive stream for task completion!
    } else if (starCount >= 10) {
      streamSize = 8;
    } else if (starCount >= 3) {
      streamSize = 6;
    }

    // Clear any previous queued coin spawns
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    // Spawn a stream of coins with staggered intervals
    for (let i = 0; i < streamSize; i++) {
      const delay = i * 110; // stagger interval (110ms)
      
      const t = setTimeout(() => {
        // Staggered coin details with minor randomized visual offsets for a natural physics stream
        const coinId = Date.now() + Math.random();
        const offsetX = (Math.random() - 0.5) * 50; // scatter around center
        const offsetY = (Math.random() - 0.5) * 30;
        const rotStart = Math.random() * 90 - 45;
        const rotMid = Math.random() * 180 + 90;
        const speedFactor = 0.65 + Math.random() * 0.15; // randomized speed per coin

        const newCoin = {
          id: coinId,
          index: i,
          offsetX,
          offsetY,
          rotStart,
          rotMid,
          speedFactor,
        };

        setCoins(prev => [...prev, newCoin]);

        // Trigger sound, vibration, leaf bounce and ripple exact when this specific coin lands
        const landingDurationMs = Math.round(speedFactor * 1000);
        setTimeout(() => {
          // Play coin landing sound with slightly climbing pitch (creates arpeggio/cascade feeling)
          const pitch = 1.0 + (i * 0.05); // scale pitch higher for each landing coin!
          playCoinSound(pitch);
          
          buzz(12);
          setIsBouncing(true);
          
          // Spawn landing ripple
          const newRippleId = Date.now() + Math.random();
          setRipples(prev => [...prev, newRippleId]);
          setTimeout(() => {
            setRipples(prev => prev.filter(r => r !== newRippleId));
          }, 1000);

          setTimeout(() => setIsBouncing(false), 200);
        }, landingDurationMs - 50); // slight buffer before absolute animation end

      }, delay);

      timeoutsRef.current.push(t);
    }

    // Reset auto-hide timer to slide leaf back after the entire stream completes
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const totalDuration = (streamSize * 110) + 5000;
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, totalDuration);

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [coinEarnedTrigger]);

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleLeafClick = () => {
    buzz(25);
    setScr("profil");
    if (setPTab) setPTab("garden");
  };

  // Handle animation end to clean up the coin elements
  const removeCoin = (coinId) => {
    setCoins(prev => prev.filter(c => c.id !== coinId));
  };

  // Do not render if user not logged in or already in Baraka Garden screen
  if (!user || (scr === "profil" && pTab === "garden")) {
    return null;
  }

  const isDarkMode = !!th.dark;

  const styleContent = `
    @keyframes fly-coin {
      0% {
        transform: translate(-50%, -50%) scale(0.3) rotate(var(--rot-start));
        left: calc(50% + var(--offset-x));
        bottom: calc(340px + var(--offset-y));
        opacity: 0;
      }
      15% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.3) rotate(var(--rot-mid));
        left: calc(50% + var(--offset-x));
        bottom: calc(340px + var(--offset-y));
      }
      90% {
        opacity: 1;
        transform: translate(0, 0) scale(1.1) rotate(360deg);
        left: calc(100% - 40px);
        bottom: 36px;
      }
      100% {
        opacity: 0;
        transform: translate(0, 0) scale(0) rotate(360deg);
        left: calc(100% - 40px);
        bottom: 36px;
      }
    }

    @keyframes leaf-pulse-glow {
      0% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.25); opacity: 0; }
      100% { transform: scale(1); opacity: 0.6; }
    }

    @keyframes leaf-ripple-effect {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  `;

  return (
    <div style={{
      position: "fixed",
      bottom: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 430,
      height: 0,
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      {/* Injecting CSS Keyframes directly */}
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />

      {/* ── Coins Layer ── */}
      {coins.map(coin => (
        <div
          key={coin.id}
          onAnimationEnd={() => removeCoin(coin.id)}
          style={{
            position: "absolute",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "radial-gradient(circle, #ffe066 10%, #f59e0b 90%)",
            border: "2px solid #ffffff",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.5), inset 0 0 5px #b45309",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1010,
            fontSize: 14,
            fontWeight: "bold",
            color: "#78350f",
            textShadow: "0 1px 1px rgba(255,255,255,0.4)",
            // Injecting custom physics offsets using style custom properties
            "--offset-x": `${coin.offsetX}px`,
            "--offset-y": `${coin.offsetY}px`,
            "--rot-start": `${coin.rotStart}deg`,
            "--rot-mid": `${coin.rotMid}deg`,
            animation: `fly-coin ${coin.speedFactor}s cubic-bezier(0.25, 1, 0.5, 1) forwards`,
          }}
        >
          ★
        </div>
      ))}

      {/* ── Floating Leaf Button ── */}
      <div
        onClick={handleLeafClick}
        style={{
          position: "absolute",
          bottom: 12,
          right: 16,
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: isDarkMode 
            ? "linear-gradient(135deg, #111827 0%, #064e3b 100%)" 
            : "linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%)",
          border: `2px solid ${th.gr}`,
          boxShadow: isDarkMode
            ? "0 8px 24px rgba(16, 185, 129, 0.35), inset 0 1px 1px rgba(255,255,255,0.1)"
            : "0 8px 24px rgba(5, 150, 105, 0.2), inset 0 1px 1px rgba(255,255,255,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          pointerEvents: "auto",
          touchAction: "manipulation",
          transform: `translateX(${isVisible ? "0px" : "32px"}) scale(${isBouncing ? 1.25 : 1})`,
          transition: "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s, border-color 0.3s",
        }}
        title={lg === "uz" ? "Baraka Bog'i" : "Baraka Garden"}
      >
        <LeafIcon size={24} color={th.gr} />
        
        {/* Dynamic Expand Ripples upon earning a coin */}
        {ripples.map(id => (
          <span
            key={id}
            style={{
              position: "absolute",
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: "50%",
              border: `2px solid ${th.gr}`,
              animation: "leaf-ripple-effect 1s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Pulsing beacon to highlight the leaf button when peeking */}
        {!isVisible && (
          <span style={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: "50%",
            border: `2.5px solid ${th.gr}`,
            animation: "leaf-pulse-glow 2s infinite ease-in-out",
            pointerEvents: "none",
          }} />
        )}
      </div>
    </div>
  );
});
