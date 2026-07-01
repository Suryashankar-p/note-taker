import React from "react";

const SkyscraperAlerts = () => {
  const alerts = [
    {
      title: "Largest gap vs target",
      desc: "Fan at -19.1 pp below PMA (₹44.92L, 2.1% of quarter revenue). So what: this family alone is the single biggest target miss in Q4 FY 26.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Highest revenue below target",
      desc: "HE (Coil) — ₹450.84L at -11.7 pp (20.7% share). So what: even if not the deepest miss, its size makes it the main lever to lift heating GM.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Chronic drag",
      desc: "HE (Coil) (20.7% share, -11.7 pp); Tube (3.9% share, -6.5 pp); pump 1 (3.5% share, -3.2 pp); Burner 1 (4.9% share, -1.8 pp) (+ 1 more) — below target for 3 consecutive quarters.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "HE (Coil) — diagnosis",
      desc: "Standard GM 65.0% (16% of family rev) vs non-standard 49.1%. Non-standard mix is the primary drag — bespoke / non-catalogue volume is running below PMA target.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={`border rounded-xl p-5 shadow-xs ${alert.borderColor}`}
        >
          <h4 className="text-xs font-extrabold uppercase tracking-wider mb-2">
            {alert.title}
          </h4>
          <p className="text-[11px] leading-relaxed opacity-90">{alert.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default SkyscraperAlerts;
