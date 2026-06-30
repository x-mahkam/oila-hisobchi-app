export default function Confetti({ th }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999, overflow: "hidden" }}>
      <style>{`@keyframes confFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(105vh) rotate(720deg);opacity:0}}`}</style>
      {Array.from({ length: 60 }).map((_, i) => {
        const colors = ["#6366f1","#10b981","#f59e0b","#ec4899","#06b6d4","#ef4444","#8b5cf6"];
        const c = colors[i % colors.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const dur = 2 + Math.random() * 1.5;
        const size = 6 + Math.random() * 8;
        return <div key={i} style={{ position: "absolute", top: 0, left: left + "%", width: size, height: size, background: c, borderRadius: i % 2 === 0 ? "50%" : "2px", animation: `confFall ${dur}s ${delay}s ease-in forwards` }} />;
      })}
    </div>
  );
}
