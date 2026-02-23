import { useState, useMemo } from "react";

// ======== DATA TABLES FROM EXCEL ========

const REGIONS = [
  { id: "gush", label: "גוש עציון והסביבה", km: 25, hours: 6 },
  { id: "jerusalem", label: "ירושלים והסביבה", km: 100, hours: 7 },
  { id: "center", label: "מרכז עד חדרה", km: 250, hours: 10 },
  { id: "south", label: "דרום עד באר שבע", km: 200, hours: 10 },
];

const GUEST_BRACKETS = [70, 100, 150, 200, 250, 300, 350];

const WORKERS_TABLE = { 70: 1, 100: 2, 150: 2, 200: 2, 250: 2, 300: 2, 350: 2 };
const DRINKS_TABLE = { 70: 70, 100: 100, 150: 150, 200: 200, 250: 250, 300: 300, 350: 350 };

// Unit costs
const UNIT_COSTS = {
  coffeePerCup: 2.5,
  workerPerHour: 60,
  fuelPerKm: 2,
  eventWear: 100,
  shakePerPerson: 2.5,
  coldDrinkPerPerson: 1.5,
  insurance: 33,
  commissionRate: 0.1,
  vatRate: 0.18,
};

function getClosestBracket(guests) {
  if (guests <= 70) return 70;
  for (let b of GUEST_BRACKETS) {
    if (guests <= b) return b;
  }
  return 350;
}

function calculate(inputs) {
  const { region, guests, customerPrice, addColdDrinks, addShakes } = inputs;
  if (!region || !guests || !customerPrice) return null;

  const bracket = getClosestBracket(guests);
  const regionData = REGIONS.find((r) => r.id === region);
  const workers = WORKERS_TABLE[bracket];
  const drinks = DRINKS_TABLE[bracket];
  const coldDrinksQty = addColdDrinks ? drinks / 2 : 0;
  const shakesQty = addShakes ? drinks / 2 : 0;

  const coffeeCost = drinks * UNIT_COSTS.coffeePerCup;
  const workerCost = workers * regionData.hours * UNIT_COSTS.workerPerHour;
  const fuelCost = regionData.km * UNIT_COSTS.fuelPerKm;
  const wearCost = UNIT_COSTS.eventWear;
  const shakeCost = shakesQty * UNIT_COSTS.shakePerPerson;
  const coldDrinkCost = coldDrinksQty * UNIT_COSTS.coldDrinkPerPerson;
  const insuranceCost = UNIT_COSTS.insurance;

  const totalCostBeforeCommission =
    coffeeCost + workerCost + fuelCost + wearCost + shakeCost + coldDrinkCost + insuranceCost;

  const commission = customerPrice * UNIT_COSTS.commissionRate;
  const operatingProfit = customerPrice - totalCostBeforeCommission - commission;
  const profitAfterVat = operatingProfit / (1 + UNIT_COSTS.vatRate);

  return {
    bracket,
    workers,
    drinks,
    coldDrinksQty,
    shakesQty,
    regionData,
    breakdown: [
      { label: "קפה ושתייה", qty: drinks, unit: "כוסות", unitCost: UNIT_COSTS.coffeePerCup, total: coffeeCost },
      { label: "עובדים", qty: `${workers} × ${regionData.hours}ש'`, unit: "שעות", unitCost: UNIT_COSTS.workerPerHour, total: workerCost },
      { label: "דלק (נסיעה הלוך חזור)", qty: regionData.km, unit: "ק\"מ", unitCost: UNIT_COSTS.fuelPerKm, total: fuelCost },
      { label: "בלאי ציוד", qty: 1, unit: "", unitCost: UNIT_COSTS.eventWear, total: wearCost },
      ...(addShakes ? [{ label: "עמדת שייק", qty: shakesQty, unit: "מנות", unitCost: UNIT_COSTS.shakePerPerson, total: shakeCost }] : []),
      ...(addColdDrinks ? [{ label: "עמדת שתייה קרה", qty: coldDrinksQty, unit: "מנות", unitCost: UNIT_COSTS.coldDrinkPerPerson, total: coldDrinkCost }] : []),
      { label: "ביטוח", qty: 1, unit: "", unitCost: UNIT_COSTS.insurance, total: insuranceCost },
    ],
    totalCostBeforeCommission,
    commission,
    operatingProfit,
    profitAfterVat,
    customerPrice,
  };
}

const fmt = (n) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(n);

export default function App() {
  const [inputs, setInputs] = useState({
    region: "gush",
    guests: 100,
    customerPrice: 2600,
    addColdDrinks: false,
    addShakes: false,
  });

  const result = useMemo(() => calculate(inputs), [inputs]);

  const set = (key, val) => setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e8dcc8", fontFamily: "'Heebo', sans-serif", direction: "rtl" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #1a1d27; } ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 3px; }
        .input-field { background: #1a1d27; border: 1px solid #2e3347; color: #e8dcc8; border-radius: 8px; padding: 10px 14px; width: 100%; font-family: inherit; font-size: 15px; outline: none; transition: border-color 0.2s; }
        .input-field:focus { border-color: #c9a84c; }
        .select-field { background: #1a1d27; border: 1px solid #2e3347; color: #e8dcc8; border-radius: 8px; padding: 10px 14px; width: 100%; font-family: inherit; font-size: 15px; outline: none; cursor: pointer; appearance: none; transition: border-color 0.2s; }
        .select-field:focus { border-color: #c9a84c; }
        .toggle-btn { background: #1a1d27; border: 2px solid #2e3347; color: #8a8fa8; border-radius: 8px; padding: 10px 20px; font-family: inherit; font-size: 14px; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .toggle-btn.active { background: #c9a84c18; border-color: #c9a84c; color: #c9a84c; }
        .card { background: #1a1d27; border: 1px solid #2e3347; border-radius: 14px; padding: 24px; }
        .profit-positive { color: #4caf88; }
        .profit-negative { color: #e05252; }
        .profit-neutral { color: #c9a84c; }
        .row-alt:nth-child(odd) { background: #ffffff05; }
        .pill { display: inline-flex; align-items: center; gap: 6px; background: #c9a84c18; border: 1px solid #c9a84c44; border-radius: 20px; padding: 4px 12px; font-size: 13px; color: #c9a84c; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.4s ease forwards; }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a1d27 0%, #0f1117 100%)", borderBottom: "1px solid #2e3347", padding: "28px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg, #c9a84c, #e8c870)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>☕</div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.5px", color: "#fff" }}>תמחור אירועים 2026</h1>
              <p style={{ color: "#6b7094", fontSize: 14, marginTop: 2 }}>מחשבון עלויות ורווחיות לאירועי קפה</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

          {/* ---- INPUTS ---- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚙️</span> פרמטרי האירוע
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#8a8fa8", marginBottom: 6, fontWeight: 500 }}>📍 אזור / מרחק מאפרת</label>
                  <div style={{ position: "relative" }}>
                    <select className="select-field" value={inputs.region} onChange={e => set("region", e.target.value)}>
                      {REGIONS.map(r => (
                        <option key={r.id} value={r.id}>{r.label} ({r.km} ק"מ, {r.hours} ש')</option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#c9a84c", fontSize: 12 }}>▼</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#8a8fa8", marginBottom: 6, fontWeight: 500 }}>👥 כמות מוזמנים</label>
                  <input type="number" className="input-field" value={inputs.guests} min={1} onChange={e => set("guests", parseInt(e.target.value) || 0)} />
                  {inputs.guests > 0 && (
                    <p style={{ fontSize: 12, color: "#6b7094", marginTop: 5 }}>
                      → מדרגה: {getClosestBracket(inputs.guests)} אורחים
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#8a8fa8", marginBottom: 6, fontWeight: 500 }}>💰 מחיר ללקוח (₪)</label>
                  <input type="number" className="input-field" value={inputs.customerPrice} min={0} onChange={e => set("customerPrice", parseFloat(e.target.value) || 0)} />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span>➕</span> תוספות לאירוע
              </h2>
              <div style={{ display: "flex", gap: 12 }}>
                <button className={`toggle-btn ${inputs.addColdDrinks ? "active" : ""}`} onClick={() => set("addColdDrinks", !inputs.addColdDrinks)}>
                  🧊 שתייה קרה
                </button>
                <button className={`toggle-btn ${inputs.addShakes ? "active" : ""}`} onClick={() => set("addShakes", !inputs.addShakes)}>
                  🥤 שייקים
                </button>
              </div>
            </div>

            {/* Quick stats */}
            {result && (
              <div className="card fade-in">
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", marginBottom: 16 }}>📋 נתוני אירוע</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { icon: "👤", label: "עובדים", value: result.workers },
                    { icon: "🕐", label: "שעות עבודה", value: `${result.regionData.hours} ש'` },
                    { icon: "🚗", label: "מרחק", value: `${result.regionData.km} ק"מ` },
                    { icon: "☕", label: "כוסות קפה", value: result.drinks },
                    ...(inputs.addColdDrinks ? [{ icon: "🧊", label: "שתייה קרה", value: result.coldDrinksQty }] : []),
                    ...(inputs.addShakes ? [{ icon: "🥤", label: "שייקים", value: result.shakesQty }] : []),
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#ffffff05", borderRadius: 10, padding: "12px 14px", border: "1px solid #2e3347" }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 12, color: "#6b7094" }}>{s.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#e8dcc8" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ---- RESULTS ---- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {result ? (
              <>
                {/* Cost Breakdown */}
                <div className="card fade-in">
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", marginBottom: 16 }}>📊 פירוט עלויות</h2>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #2e3347" }}>
                        {["פריט", "כמות", "עלות ליח'", "סך הכל"].map(h => (
                          <th key={h} style={{ padding: "8px 6px", fontSize: 12, color: "#6b7094", fontWeight: 600, textAlign: "right" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.breakdown.map((item, i) => (
                        <tr key={i} className="row-alt">
                          <td style={{ padding: "9px 6px", fontSize: 13, color: "#e8dcc8" }}>{item.label}</td>
                          <td style={{ padding: "9px 6px", fontSize: 12, color: "#8a8fa8" }}>{item.qty} {item.unit}</td>
                          <td style={{ padding: "9px 6px", fontSize: 12, color: "#8a8fa8" }}>₪{item.unitCost}</td>
                          <td style={{ padding: "9px 6px", fontSize: 13, fontWeight: 600, color: "#e8dcc8", direction: "ltr", textAlign: "right" }}>{fmt(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: "1px solid #2e3347" }}>
                        <td colSpan={3} style={{ padding: "10px 6px", fontSize: 13, fontWeight: 700, color: "#c9a84c" }}>סך עלויות ישירות</td>
                        <td style={{ padding: "10px 6px", fontSize: 14, fontWeight: 700, color: "#c9a84c", direction: "ltr", textAlign: "right" }}>{fmt(result.totalCostBeforeCommission)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Profit Summary */}
                <div className="card fade-in">
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#c9a84c", marginBottom: 16 }}>💹 סיכום רווחיות</h2>
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {[
                      { label: "מחיר ללקוח", value: result.customerPrice, color: "#e8dcc8", bold: false },
                      { label: "עלויות ישירות", value: -result.totalCostBeforeCommission, color: "#e05252", bold: false },
                      { label: `עמלת מכירה (${(UNIT_COSTS.commissionRate * 100).toFixed(0)}%)`, value: -result.commission, color: "#e05252", bold: false },
                    ].map((row, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid #2e334730" }}>
                        <span style={{ fontSize: 14, color: "#8a8fa8" }}>{row.label}</span>
                        <span style={{ fontSize: 14, fontWeight: row.bold ? 700 : 500, color: row.color }}>
                          {row.value < 0 ? `(${fmt(Math.abs(row.value))})` : fmt(row.value)}
                        </span>
                      </div>
                    ))}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #2e3347" }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>רווח תפעולי</span>
                      <span style={{ fontSize: 18, fontWeight: 900, className: "profit-positive" + (result.operatingProfit < 0 ? " profit-negative" : ""), color: result.operatingProfit >= 0 ? "#4caf88" : "#e05252" }}>
                        {result.operatingProfit < 0 ? `(${fmt(Math.abs(result.operatingProfit))})` : fmt(result.operatingProfit)}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>רווח אחרי מע"מ ({(UNIT_COSTS.vatRate * 100).toFixed(0)}%)</span>
                      <span style={{ fontSize: 20, fontWeight: 900, color: result.profitAfterVat >= 0 ? "#4caf88" : "#e05252" }}>
                        {result.profitAfterVat < 0 ? `(${fmt(Math.abs(result.profitAfterVat))})` : fmt(result.profitAfterVat)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Margin indicator */}
                <div className="card fade-in" style={{ border: result.profitAfterVat > 0 ? "1px solid #4caf8844" : "1px solid #e0525244", background: result.profitAfterVat > 0 ? "#4caf8808" : "#e0525208" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#6b7094", marginBottom: 4 }}>מרווח רווח (לאחר מע"מ)</div>
                      <div style={{ fontSize: 28, fontWeight: 900, color: result.profitAfterVat > 0 ? "#4caf88" : "#e05252" }}>
                        {result.customerPrice > 0 ? ((result.profitAfterVat / result.customerPrice) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    <div style={{ fontSize: 48 }}>{result.profitAfterVat > 0 ? "✅" : "⚠️"}</div>
                  </div>

                  <div style={{ marginTop: 14, background: "#00000030", borderRadius: 6, height: 8, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(100, Math.max(0, (result.profitAfterVat / result.customerPrice) * 100))}%`,
                      background: result.profitAfterVat > 0 ? "linear-gradient(90deg, #4caf88, #6de0a8)" : "#e05252",
                      borderRadius: 6,
                      transition: "width 0.5s ease"
                    }} />
                  </div>
                </div>
              </>
            ) : (
              <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, color: "#4a4f6a", gap: 12 }}>
                <div style={{ fontSize: 48 }}>📋</div>
                <p style={{ fontSize: 15 }}>הכנס פרמטרים לחישוב</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 24, padding: "14px 20px", background: "#1a1d2750", borderRadius: 10, border: "1px solid #2e3347", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: "#c9a84c", fontSize: 16 }}>ℹ️</span>
          <p style={{ fontSize: 12, color: "#6b7094", lineHeight: 1.6 }}>
            החישוב מבוסס על טבלאות הנתונים מהקובץ המקורי. מרחקים מחושבים מאפרת הלוך וחזור. כמויות שתייה ושייקים = מחצית ממספר המוזמנים.
            עמלת מכירה {(UNIT_COSTS.commissionRate * 100).toFixed(0)}%. מע"מ {(UNIT_COSTS.vatRate * 100).toFixed(0)}%.
          </p>
        </div>
      </div>
    </div>
  );
}
