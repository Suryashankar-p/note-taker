import React from "react";

interface SkyscraperAlertsProps {
  families: Array<{
    name: string;
    actual: string;
    target: string;
    delta: string;
    deltaVal: number;
    revenueInr: number;
    share: string;
  }>;
  selectedQuarter: string;
  compareVs: string;
  insights?: string[];
}

const SkyscraperAlerts = ({
  selectedQuarter,
  insights = [],
}: SkyscraperAlertsProps) => {
  const activeQtr = selectedQuarter || "Q2 FY 26";

  if (insights && insights.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {insights.slice(0, 4).map((text, idx) => {
          const colonIndex = text.indexOf(":");
          const title = colonIndex !== -1 ? text.substring(0, colonIndex) : "Insight";
          const desc = colonIndex !== -1 ? text.substring(colonIndex + 1).trim() : text;

          let borderColor = "border-slate-200 bg-slate-50/50 text-slate-800";
          if (text.includes("below target") || text.includes("-")) {
            borderColor = "border-rose-200 bg-rose-50/55 text-rose-900";
          } else if (text.includes("above target") || text.includes("+")) {
            borderColor = "border-emerald-200 bg-emerald-50/55 text-emerald-950";
          }

          return (
            <div
              key={idx}
              className={`border rounded-xl p-5 shadow-xs ${borderColor}`}
            >
              <h4 className="text-xs font-extrabold uppercase tracking-wider mb-2">
                {title}
              </h4>
              <p className="text-[11px] leading-relaxed opacity-90">{desc}</p>
            </div>
          );
        })}
      </div>
    );
  }

  const alerts = [
    {
      title: "Largest gap vs target",
      desc: `HE (Shell) at -88.2 pp below PMA (0.38L, 0.0% share). So what: this family is the single deepest target miss in ${activeQtr}.`,
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Highest revenue below target",
      desc: "HE (Coil) — 3.29Cr at -12.8 pp (15.9% share). So what: even if not the deepest miss, its size makes it the main lever to lift heating GM.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Top portfolio drags",
      desc: `HE (Shell) (0.0% share, -88.2 pp); Fusible plug (0.6% share, -31.5 pp); JACKET (3.0% share, -29.0 pp) — below target. So what: these represent the key negative contributors dragging down overall portfolio GM in ${activeQtr}.`,
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Top positive contributor",
      desc: "HE (Bank Tubes) at +20.7 pp above target (3.03L, 0.1% share). So what: this family is the strongest performer helping to offset the drags.",
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
