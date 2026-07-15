import { db } from "../../firebase.js";
import { td, nt } from "../../utils/formatters.js";

export default function InviteQarzModal({ inviteQarz: iq, th, lg, user, qarzTur, qarzKim, qarzSum, qarzlar, setQarzlar, ok$, t, f, onClose }) {
  const link = (window.location.origin + "/?ref=") + (user?.id || "");
  const msg = (
    lg === "uz" ? "Salom! Men sizga Oila Hisobchi ilovasida qarz yozmoqchiman. Ilovani o'rnating: " :
    lg === "ru" ? "Привет! Я хочу записать долг в приложении Семейный Бюджет. Установите приложение: " :
    lg === "kk" ? "Сәлем! Мен сізге Отбасылық бюджет қолданбасында қарыз жазғым келеді. Қолданбаны орнатыңыз: " :
    lg === "ky" ? "Салам! Мен сизге Үй-бүлөлүк бюджет тиркемесинде карыз жазгым келет. Тиркемени орнотуңуз: " :
    lg === "tg" ? "Салом! Ман мехоҳам ба шумо дар барномаи Бюдҷети оилавӣ қарз нависам. Барномаро насб кунед: " :
    lg === "qr" ? "Salom! Men sizge Oila Hisobchisi ilovasinda qarz jazbaqshiman. Ilovani ornatin': " :
    "Hi! Join me on Oila Hisobchi app: "
  ) + link;

  const saveSimple = async () => {
    const item = { id: Date.now(), uid: user.id, tur: qarzTur, kim: qarzKim.trim(), summa: Number(qarzSum), izoh: "", sana: td(), paid: false, paidSana: "" };
    const upd = [item, ...qarzlar];
    await db.s("qarz_" + user.oilaId, upd);
    setQarzlar(upd);
    onClose();
    ok$(t.xa);
  };

  const shareVia = (platform) => {
    if (platform === "telegram") {
      window.open("https://t.me/share/url?url=" + encodeURIComponent(link) + "&text=" + encodeURIComponent(msg), "_blank");
    } else {
      if (navigator.share) { navigator.share({ text: msg, url: link }).catch(() => {}); }
      else { try { navigator.clipboard.writeText(msg); ok$(lg === "uz" ? "Nusxalandi!" : lg === "ru" ? "Скопировано!" : lg === "kk" ? "Көшірілді!" : lg === "ky" ? "Көчүрүлдү!" : lg === "tg" ? "Нусхабардорӣ шуд!" : lg === "qr" ? "Nusxalandi!" : "Copied!"); } catch {} }
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 1001, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: th.sur, borderRadius: 24, padding: "26px 24px", width: "100%", maxWidth: 360 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{ width: 60, height: 60, borderRadius: 17, background: th.am + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 12px" }}>📲</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: th.t1, marginBottom: 6 }}>{lg === "uz" ? "Bu raqam ilovada yo'q" : lg === "ru" ? "Этого номера нет в приложении" : lg === "kk" ? "Бұл нөмір қолданбада жоқ" : lg === "ky" ? "Бул номер тиркемеде жок" : lg === "tg" ? "Ин рақам дар барнома нест" : lg === "qr" ? "Bul nomer ilovada jo'q" : "Number not in app"}</div>
          <div style={{ fontSize: 13, color: th.t2, lineHeight: 1.5 }}>{lg === "uz" ? iq.tel + " raqami ilovada yo'q. Taklif yuboring!" : lg === "ru" ? "Номера " + iq.tel + " нет в приложении. Отправьте приглашение!" : lg === "kk" ? iq.tel + " нөмірі қолданбада жоқ. Шақыру жіберіңіз!" : lg === "ky" ? iq.tel + " номери тиркемеде жок. Чакыруу жөнөтүңүз!" : lg === "tg" ? "Рақами " + iq.tel + " дар барнома нест. Даъватнома фиристед!" : lg === "qr" ? iq.tel + " nomeri ilovada jo'q. Taklip jiberin'!" : "This number isn't in the app yet. Invite them!"}</div>
        </div>
        <button onClick={() => shareVia("telegram")} style={{ width: "100%", background: "#2196F3", border: "none", borderRadius: 14, padding: "13px", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          📩 {lg === "uz" ? "Telegram orqali taklif" : lg === "ru" ? "Пригласить через Telegram" : lg === "kk" ? "Telegram арқылы шақыру" : lg === "ky" ? "Telegram аркылуу чакыруу" : lg === "tg" ? "Даъват тавассути Telegram" : lg === "qr" ? "Telegram arqali taklip" : "Invite via Telegram"}
        </button>
        <button onClick={() => shareVia("other")} style={{ width: "100%", background: th.surH, border: "1px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t1, cursor: "pointer", fontWeight: 700, fontSize: 14, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          🔗 {lg === "uz" ? "Boshqa ilova orqali" : lg === "ru" ? "Через другое приложение" : lg === "kk" ? "Басқа қолданба арқылы" : lg === "ky" ? "Башка тиркеме аркылуу" : lg === "tg" ? "Тавассути барномаи дигар" : lg === "qr" ? "Basqa ilova arqali" : "Share via other app"}
        </button>
        <div style={{ height: 1, background: th.bor, marginBottom: 14 }} />
        <button onClick={saveSimple} style={{ width: "100%", background: "transparent", border: "1.5px solid " + th.bor, borderRadius: 14, padding: "13px", color: th.t2, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          {lg === "uz" ? "Oddiy qarz sifatida saqlash" : lg === "ru" ? "Сохранить как простой долг" : lg === "kk" ? "Жай қарыз ретінде сақтау" : lg === "ky" ? "Жөнөкөй карыз катары сактоо" : lg === "tg" ? "Ҳамчун қарзи оддӣ захира кардан" : lg === "qr" ? "A'diy qarz sipatinda saqlaw" : "Save as simple debt"}
        </button>
      </div>
    </div>
  );
}
