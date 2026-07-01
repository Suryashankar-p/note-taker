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
}

const SkyscraperAlerts = ({
  families,
  selectedQuarter,
  compareVs,
}: SkyscraperAlertsProps) => {
  const formatRev = (val?: number) => {
    if (val === undefined || val === null) return "₹0.00";
    if (val >= 10000000) {
      return `${(val / 10000000).toFixed(2)}Cr`;
    }
    return `${(val / 100000).toFixed(2)}L`;
  };

  const targetLabel = compareVs === "target" ? "PMA" : "Baseline";

  // 1. Worst performer (deepest negative gap)
  const sortedByDeltaAsc = [...families].sort((a, b) => a.deltaVal - b.deltaVal);
  const worstFamily = sortedByDeltaAsc[0];

  // 2. Highest revenue below target
  const negativeFamilies = families.filter((f) => f.deltaVal < 0);
  const highestRevNegativeFamily = [...negativeFamilies].sort(
    (a, b) => b.revenueInr - a.revenueInr
  )[0];

  // 3. Top drags (up to 3 worst performers)
  const topDrags = sortedByDeltaAsc.filter((f) => f.deltaVal < 0).slice(0, 3);

  // 4. Best performer (highest positive gap)
  const bestFamily = families[0];

  const alerts = [
    {
      title: `Largest gap vs ${compareVs}`,
      desc: worstFamily && worstFamily.deltaVal < 0
        ? `${worstFamily.name} at ${worstFamily.delta} pp below ${targetLabel} (${formatRev(worstFamily.revenueInr)}, ${worstFamily.share} share). So what: this family is the single deepest target miss in ${selectedQuarter}.`
        : "No families are below target in this quarter.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Highest revenue below target",
      desc: highestRevNegativeFamily
        ? `${highestRevNegativeFamily.name} — ${formatRev(highestRevNegativeFamily.revenueInr)} at ${highestRevNegativeFamily.delta} pp (${highestRevNegativeFamily.share} share). So what: even if not the deepest miss, its size makes it the main lever to lift heating GM.`
        : "No underperforming families found.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Top portfolio drags",
      desc: topDrags.length > 0
        ? `${topDrags.map((f) => `${f.name} (${f.share} share, ${f.delta} pp)`).join("; ")} — below target. So what: these represent the key negative contributors dragging down overall portfolio GM in ${selectedQuarter}.`
        : "No underperforming drag families.",
      borderColor: "border-teal-200 bg-teal-50/50 text-teal-800",
    },
    {
      title: "Top positive contributor",
      desc: bestFamily && bestFamily.deltaVal >= 0
        ? `${bestFamily.name} at ${bestFamily.delta} pp above target (${formatRev(bestFamily.revenueInr)}, ${bestFamily.share} share). So what: this family is the strongest performer helping to offset the drags.`
        : "No positive performer found.",
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
