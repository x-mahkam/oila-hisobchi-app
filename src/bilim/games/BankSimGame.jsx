import { useState, useMemo } from "react";
import { PageHeader, AppCard } from "../../components/ui/index.js";
import { SPACE, RADIUS, TYPE, ALPHA, SHADOW, COMP, PREMIUM, PALETTE } from "../../utils/tokens.js";
import { f } from "../../utils/formatters.js";
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  HelpCircle, 
  Scale, 
  ArrowRightLeft, 
  Coins, 
  ShieldAlert, 
  Lightbulb 
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";

export default function BankSimGame({ dark, onBack }) {
  const { t } = useApp();
  const th = dark ? PALETTE.dark : PALETTE.light;

  const [mode, setMode] = useState("deposit"); // deposit | loan

  // --- Deposit (Omonat) Sliders ---
  const [depPrincipal, setDepPrincipal] = useState(1000000); // 1,000,000 UZS
  const [depMonthly, setDepMonthly] = useState(100000); // 100,000 UZS
  const [depRate, setDepRate] = useState(20); // 20% yillik
  const [depYears, setDepYears] = useState(10); // 10 yil

  // --- Loan (Kredit) Sliders ---
  const [loanPrincipal, setLoanPrincipal] = useState(10000000); // 10,000,000 UZS
  const [loanRate, setLoanRate] = useState(28); // 28% yillik
  const [loanYears, setLoanYears] = useState(3); // 3 yil

  // --- Deposit Calculation ---
  const depositData = useMemo(() => {
    let balance = depPrincipal;
    let totalPrincipal = depPrincipal;
    let totalInterest = 0;
    const history = [];

    for (let y = 1; y <= depYears; y++) {
      let interestThisYear = 0;
      let principalThisYear = 0;
      for (let m = 1; m <= 12; m++) {
        balance += depMonthly;
        totalPrincipal += depMonthly;
        principalThisYear += depMonthly;
        
        const interestThisMonth = balance * (depRate / 12 / 100);
        balance += interestThisMonth;
        totalInterest += interestThisMonth;
        interestThisYear += interestThisMonth;
      }
      history.push({
        year: y,
        principal: Math.round(totalPrincipal),
        interest: Math.round(totalInterest),
        total: Math.round(balance)
      });
    }
    return history;
  }, [depPrincipal, depMonthly, depRate, depYears]);

  // --- Loan Calculation (Amortization) ---
  const loanData = useMemo(() => {
    const P = loanPrincipal;
    const r = (loanRate / 12 / 100);
    const n = loanYears * 12;
    
    // PMT formula
    const monthlyPayment = r > 0 
      ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : P / n;

    let remainingBalance = P;
    let cumulativePaid = 0;
    let cumulativeInterest = 0;
    const history = [];

    for (let y = 1; y <= loanYears; y++) {
      let principalPaidThisYear = 0;
      let interestPaidThisYear = 0;
      for (let m = 1; m <= 12; m++) {
        const interestThisMonth = remainingBalance * r;
        const principalThisMonth = Math.min(remainingBalance, monthlyPayment - interestThisMonth);
        
        remainingBalance -= principalThisMonth;
        cumulativePaid += (principalThisMonth + interestThisMonth);
        cumulativeInterest += interestThisMonth;

        principalPaidThisYear += principalThisMonth;
        interestPaidThisYear += interestThisMonth;
      }
      history.push({
        year: y,
        paidPrincipal: Math.round(loanPrincipal - remainingBalance),
        paidInterest: Math.round(cumulativeInterest),
        totalPaid: Math.round(cumulativePaid),
        remaining: Math.round(remainingBalance)
      });
    }

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPaid: Math.round(cumulativePaid),
      totalInterest: Math.round(cumulativeInterest),
      history
    };
  }, [loanPrincipal, loanRate, loanYears]);

  // Maximum value for scaling the bar charts
  const maxDepositVal = depositData[depositData.length - 1]?.total || 1;
  const maxLoanVal = loanData.totalPaid || 1;

  return (
    <div style={{ paddingBottom: SPACE.s8 }}>
      <PageHeader th={th} title={t("gam_bank_title")} onBack={onBack} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: SPACE.s2, marginBottom: SPACE.s4 }}>
        <button
          onClick={() => setMode("deposit")}
          className="ui-press"
          style={{
            flex: 1,
            background: mode === "deposit" ? th.gr + "1A" : th.sur,
            border: mode === "deposit" ? "2px solid " + th.gr : "1px solid " + th.bor,
            borderRadius: RADIUS.m,
            padding: SPACE.s3,
            color: mode === "deposit" ? th.gr : th.t2,
            fontFamily: "inherit",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACE.s2,
            cursor: "pointer"
          }}
        >
          <TrendingUp size={18} />
          {t("gam_bank_depositTab")}
        </button>

        <button
          onClick={() => setMode("loan")}
          className="ui-press"
          style={{
            flex: 1,
            background: mode === "loan" ? th.rd + "1A" : th.sur,
            border: mode === "loan" ? "2px solid " + th.rd : "1px solid " + th.bor,
            borderRadius: RADIUS.m,
            padding: SPACE.s3,
            color: mode === "loan" ? th.rd : th.t2,
            fontFamily: "inherit",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: SPACE.s2,
            cursor: "pointer"
          }}
        >
          <Building2 size={18} />
          {t("gam_bank_loanTab")}
        </button>
      </div>

      {mode === "deposit" ? (
        // ================= DEPOSIT VIEW =================
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s4 }}>
          
          {/* Inputs Section */}
          <AppCard th={th} style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
            <div>
              <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_initialPrincipal")}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>{f(depPrincipal, true)}</span>
              </div>
              <input 
                type="range" 
                min="100000" 
                max="10000000" 
                step="100000" 
                value={depPrincipal} 
                onChange={(e) => setDepPrincipal(Number(e.target.value))} 
                style={{ width: "100%", accentColor: th.gr }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_monthlyContribution")}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>{f(depMonthly, true)}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="1000000" 
                step="10000" 
                value={depMonthly} 
                onChange={(e) => setDepMonthly(Number(e.target.value))} 
                style={{ width: "100%", accentColor: th.gr }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3 }}>
              <div>
                <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_annualRate")}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>{depRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="30" 
                  step="1" 
                  value={depRate} 
                  onChange={(e) => setDepRate(Number(e.target.value))} 
                  style={{ width: "100%", accentColor: th.gr }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_termYears")}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: th.gr }}>{depYears} {t("gam_bank_yearsUnit")}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="15" 
                  step="1" 
                  value={depYears} 
                  onChange={(e) => setDepYears(Number(e.target.value))} 
                  style={{ width: "100%", accentColor: th.gr }}
                />
              </div>
            </div>
          </AppCard>

          {/* Visualization Chart (Stacked Bars) */}
          <AppCard th={th} style={{ padding: SPACE.s4 }}>
            <h3 style={{ ...TYPE.subtitle, color: th.t1, marginBottom: SPACE.s3 }}>
              {t("gam_bank_savingsGrowthViz")}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {depositData.map((d) => {
                const principalPct = (d.principal / maxDepositVal) * 100;
                const interestPct = (d.interest / maxDepositVal) * 100;
                return (
                  <div key={d.year} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: th.t3, width: 40, flexShrink: 0 }}>
                      {d.year}{t("gam_bank_yearSuffix")}
                    </span>
                    <div style={{ flex: 1, height: 16, background: th.bor + ALPHA.faint, borderRadius: RADIUS.s, overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${principalPct}%`, background: th.ac, transition: "width 0.3s" }} title={t("gam_bank_savingsPrincipalTooltip", { amt: f(d.principal, true) })} />
                      <div style={{ width: `${interestPct}%`, background: th.gr, transition: "width 0.3s" }} title={t("gam_bank_savingsInterestTooltip", { amt: f(d.interest, true) })} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: th.t1, width: 85, textStyle: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                      {f(d.total, false)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s4, marginTop: SPACE.s3, fontSize: 11, fontWeight: 700 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: th.ac, borderRadius: RADIUS.s }} />
                <span style={{ color: th.t2 }}>{t("gam_bank_yourContribution")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: th.gr, borderRadius: RADIUS.s }} />
                <span style={{ color: th.t2 }}>{t("gam_bank_interestIncome")}</span>
              </div>
            </div>
          </AppCard>

          {/* Tabular breakdown */}
          <AppCard th={th}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid " + th.bor, color: th.t2 }}>
                    <th style={{ padding: "8px 12px" }}>{t("gam_bank_tableYear")}</th>
                    <th style={{ padding: "8px 12px" }}>{t("gam_bank_tableContribution")}</th>
                    <th style={{ padding: "8px 12px" }}>{t("gam_bank_tableInterest")}</th>
                    <th style={{ padding: "8px 12px" }}>{t("gam_bank_tableBalance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {depositData.filter((_, i) => i === 0 || i === 2 || i === 4 || i === 9 || i === depositData.length - 1).map((d) => (
                    <tr key={d.year} style={{ borderBottom: "1px solid " + th.bor }}>
                      <td style={{ padding: "8px 12px", fontWeight: 800, color: th.t1 }}>{d.year}</td>
                      <td style={{ padding: "8px 12px", color: th.t2 }}>{f(d.principal, false)}</td>
                      <td style={{ padding: "8px 12px", color: th.gr, fontWeight: 700 }}>{f(d.interest, false)}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 800, color: th.t1 }}>{f(d.total, false)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AppCard>

          {/* Educational Insights */}
          <AppCard th={th} style={{ background: th.gr + "0D", border: "1.5px solid " + th.gr + "33" }}>
            <div style={{ display: "flex", gap: SPACE.s3 }}>
              <Lightbulb size={24} color={th.gr} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ ...TYPE.subtitle, fontSize: 14, color: th.gr, fontWeight: 800 }}>
                  {t("gam_bank_compoundPowerTitle")}
                </h4>
                <p style={{ ...TYPE.caption, fontSize: 12, color: th.t2, marginTop: 4, lineHeight: 1.5 }}>
                  {t("gam_bank_compoundPowerDesc")}
                </p>
              </div>
            </div>
          </AppCard>

        </div>
      ) : (
        // ================= LOAN VIEW =================
        <div style={{ display: "flex", flexDirection: "column", gap: SPACE.s4 }}>
          
          {/* Inputs Section */}
          <AppCard th={th} style={{ display: "flex", flexDirection: "column", gap: SPACE.s3 }}>
            <div>
              <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_loanAmount")}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: th.rd }}>{f(loanPrincipal, true)}</span>
              </div>
              <input 
                type="range" 
                min="1000000" 
                max="50000000" 
                step="1000000" 
                value={loanPrincipal} 
                onChange={(e) => setLoanPrincipal(Number(e.target.value))} 
                style={{ width: "100%", accentColor: th.rd }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s3 }}>
              <div>
                <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_loanRateLabel")}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: th.rd }}>{loanRate}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="45" 
                  step="1" 
                  value={loanRate} 
                  onChange={(e) => setLoanRate(Number(e.target.value))} 
                  style={{ width: "100%", accentColor: th.rd }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifySpace: "space-between", marginBottom: 4 }}>
                  <span style={{ ...TYPE.caption, fontWeight: 700, color: th.t1 }}>{t("gam_bank_termYears")}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: th.rd }}>{loanYears} {t("gam_bank_yearsUnit")}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="1" 
                  value={loanYears} 
                  onChange={(e) => setLoanYears(Number(e.target.value))} 
                  style={{ width: "100%", accentColor: th.rd }}
                />
              </div>
            </div>
          </AppCard>

          {/* Quick Metrics display */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: SPACE.s2 }}>
            <div style={{ background: th.sur, border: "1px solid " + th.bor, padding: SPACE.s4, borderRadius: RADIUS.m }}>
              <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_bank_monthlyPayment")}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: th.rd, marginTop: 4 }}>{f(loanData.monthlyPayment, true)}</div>
            </div>
            <div style={{ background: th.sur, border: "1px solid " + th.bor, padding: SPACE.s4, borderRadius: RADIUS.m }}>
              <div style={{ ...TYPE.tiny, color: th.t2 }}>{t("gam_bank_overpayment")}</div>
              <div style={{ fontSize: 16, fontWeight: 900, color: th.rd, marginTop: 4 }}>{f(loanData.totalInterest, true)}</div>
            </div>
          </div>

          {/* Visualization Chart */}
          <AppCard th={th} style={{ padding: SPACE.s4 }}>
            <h3 style={{ ...TYPE.subtitle, color: th.t1, marginBottom: SPACE.s3 }}>
              {t("gam_bank_loanPaymentsViz", { total: f(loanData.totalPaid, true) })}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {loanData.history.map((d) => {
                const principalPct = (d.paidPrincipal / maxLoanVal) * 100;
                const interestPct = (d.paidInterest / maxLoanVal) * 100;
                return (
                  <div key={d.year} style={{ display: "flex", alignItems: "center", gap: SPACE.s2 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: th.t3, width: 40, flexShrink: 0 }}>
                      {d.year}{t("gam_bank_yearSuffix")}
                    </span>
                    <div style={{ flex: 1, height: 16, background: th.bor + ALPHA.faint, borderRadius: RADIUS.s, overflow: "hidden", display: "flex" }}>
                      <div style={{ width: `${principalPct}%`, background: th.ac, transition: "width 0.3s" }} title={t("gam_bank_principalPaidTooltip", { amt: f(d.paidPrincipal, true) })} />
                      <div style={{ width: `${interestPct}%`, background: th.rd, transition: "width 0.3s" }} title={t("gam_bank_interestPaidTooltip", { amt: f(d.paidInterest, true) })} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: th.t1, width: 85, textStyle: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                      {f(d.totalPaid, false)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: SPACE.s4, marginTop: SPACE.s3, fontSize: 11, fontWeight: 700 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: th.ac, borderRadius: RADIUS.s }} />
                <span style={{ color: th.t2 }}>{t("gam_bank_loanPrincipalLegend")}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, background: th.rd, borderRadius: RADIUS.s }} />
                <span style={{ color: th.t2 }}>{t("gam_bank_loanInterestLegend")}</span>
              </div>
            </div>
          </AppCard>

          {/* Educational Insights */}
          <AppCard th={th} style={{ background: th.rd + "0D", border: "1.5px solid " + th.rd + "33" }}>
            <div style={{ display: "flex", gap: SPACE.s3 }}>
              <ShieldAlert size={24} color={th.rd} style={{ flexShrink: 0 }} />
              <div>
                <h4 style={{ ...TYPE.subtitle, fontSize: 14, color: th.rd, fontWeight: 800 }}>
                  {t("gam_bank_debtTrapTitle")}
                </h4>
                <p style={{ ...TYPE.caption, fontSize: 12, color: th.t2, marginTop: 4, lineHeight: 1.5 }}>
                  {t("gam_bank_debtTrapDesc")}
                </p>
              </div>
            </div>
          </AppCard>

        </div>
      )}
    </div>
  );
}
