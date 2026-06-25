import React from "react";

const InsightsList = () => {
  const topInsights = [
    {
      num: 1,
      text: "Heating GM improved +0.3% vs Q3 FY 26 (51.9% → 52.2%) — about -3.2 pp from revenue mix and +3.5 pp from margin rate. Large-share families below PMA: HE (Coil) (20.7% share, -11.7%); Valve 1 (0.9% share, -0.1%).",
    },
    {
      num: 2,
      text: "Fan Spares added the most to portfolio GM QoQ (+1.4 pp net: 0.0 mix, 1.4 margin) — now 2.7% of Q4 FY 26 revenue.",
    },
    {
      num: 3,
      text: "He (Shell) leads on target beat (+12.3%, 64.3% actual on 0.4% of quarter revenue).",
    },
    {
      num: 4,
      text: "HE (Coil) gained the most revenue share (+2.5 pp vs Q3 FY 26, now 20.7% of heating) at 51.7% GM.",
    },
    {
      num: 5,
      text: "Revenue mix is 42% standard / 58% non-standard; standard runs 3.3 pp higher GM — where share moves next quarter will steer the headline number.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Insights */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Top Insights — Q4 FY 26
        </h3>
        <div className="flex flex-col gap-3">
          {topInsights.map((item) => (
            <div key={item.num} className="flex gap-3 text-xs leading-relaxed text-gray-600">
              <span className="text-[#a61c1e] font-bold">{item.num}.</span>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Business Insights (QoQ GM Bridge) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
          Business insights
        </h3>
        <div className="border border-gray-200 bg-gray-50/50 rounded-lg p-5">
          <p className="text-xs font-semibold text-emerald-700 leading-normal mb-6">
            QoQ GM bridge (Q3 FY 26 – Q4 FY 26): % GM bridge — GMs +0.3 pp (51.9% → 52.2%). Mix -3.2 pp + margin +3.5 pp = +0.3 pp (check vs ΔGM%).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Mix Impact section */}
            <div>
              <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                Mix impact (% GM)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between"><span>HE (Coil)</span><span className="text-emerald-600 font-bold">+1.4 pp</span></div>
                    <div className="flex justify-between"><span>WH Tube</span><span className="text-emerald-600 font-bold">+0.8 pp</span></div>
                    <div className="flex justify-between"><span>Burner 4</span><span className="text-emerald-600 font-bold">+0.8 pp</span></div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between"><span>Gas train</span><span className="text-rose-600 font-bold">-1.7 pp</span></div>
                    <div className="flex justify-between"><span>HE (Blank Tubes)</span><span className="text-rose-600 font-bold">-0.8 pp</span></div>
                    <div className="flex justify-between"><span>Furnace</span><span className="text-rose-600 font-bold">-0.8 pp</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Margin Impact section */}
            <div>
              <h4 className="font-bold text-gray-500 uppercase tracking-wide border-b border-gray-200 pb-1.5 mb-3">
                Margin impact (% GM)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase block mb-2">Positive (Top 3)</span>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between"><span>Fan Spares</span><span className="text-emerald-600 font-bold">+1.6 pp</span></div>
                    <div className="flex justify-between"><span>N/A</span><span className="text-emerald-600 font-bold">+0.7 pp</span></div>
                    <div className="flex justify-between"><span>HEAT EXCHANGER</span><span className="text-emerald-600 font-bold">+0.4 pp</span></div>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-rose-600 font-bold tracking-wider uppercase block mb-2">Negative (Top 3)</span>
                  <div className="space-y-1.5 text-gray-600">
                    <div className="flex justify-between"><span>HE (Coil)</span><span className="text-rose-600 font-bold">-0.8 pp</span></div>
                    <div className="flex justify-between"><span>APH</span><span className="text-rose-600 font-bold">-0.3 pp</span></div>
                    <div className="flex justify-between"><span>WH Tube</span><span className="text-rose-600 font-bold">-0.3 pp</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsList;
