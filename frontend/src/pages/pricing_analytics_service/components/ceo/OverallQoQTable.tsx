import React from "react";

interface OverallQoQTableProps {
  businessUnit?: string;
  data?: Array<{
    segment: string;
    label: string;
    baseline_rev_cr: number;
    baseline_gm_pct: number;
    quarters: Record<string, { rev_cr: number; gm_pct: number | null }>;
  }>;
}

const OverallQoQTable = ({ data, businessUnit }: OverallQoQTableProps) => {
  const activeBu = businessUnit || "heating";
  const buLabel = activeBu.charAt(0).toUpperCase() + activeBu.slice(1);

  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1]);
    const yA = parseInt(yearA[1]);
    const qB = parseInt(matchB[1]);
    const yB = parseInt(yearB[1]);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  if (!data || data.length === 0) return null;
  
  const getQuarterVal = (q: string) => {
    const match = q.match(/Q(\d) /);
    const year = q.match(/FY (\d+)/);
    if (!match || !year) return 0;
    const qNum = parseInt(match[1]);
    const yNum = parseInt(year[1]);
    return yNum * 10 + qNum;
  };

  const activeQuarters = Object.keys(data[0].quarters)
    .sort(sortQuarters)
    .filter((q) => {
      const val = getQuarterVal(q);
      return val >= 253 && val <= 264;
    });

  const headers = [
    { label: "Baseline\n(Q4 FY24 + Q1 FY25)", colSpan: 2 },
    ...activeQuarters.map((q) => ({ label: q, colSpan: 2 })),
  ];

  const subHeaders = Array(headers.length).fill(["Revenue\n(INR Cr)", "Achieved\nGM%"]).flat();

  const rows = data.map((item) => {
    const baselineGm = item.baseline_gm_pct;
    
    const q4Data = item.quarters["Q4 FY 26"];
    let deltaStr = "-";
    let deltaClass = "text-gray-500";
    if (q4Data && q4Data.gm_pct !== null && baselineGm !== null) {
      const delta = q4Data.gm_pct - baselineGm;
      deltaStr = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
      deltaClass = delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-600" : "text-gray-500";
    }

    return {
      type: item.label,
      data: [
        { 
          rev: item.baseline_rev_cr !== null ? item.baseline_rev_cr.toFixed(1) : "-", 
          gm: item.baseline_gm_pct !== null ? `${item.baseline_gm_pct.toFixed(1)}%` : "-",
          isGreen: false,
          isRed: false,
        },
        ...activeQuarters.map((q) => {
          const qData = item.quarters[q];
          if (!qData || qData.gm_pct === null) {
            return { 
              rev: qData && qData.rev_cr !== null ? qData.rev_cr.toFixed(1) : "-", 
              gm: "-",
              isGreen: false,
              isRed: false,
            };
          }
          const isGreen = qData.gm_pct > baselineGm;
          const isRed = qData.gm_pct < baselineGm;
          return {
            rev: qData.rev_cr !== null ? qData.rev_cr.toFixed(1) : "-",
            gm: `${qData.gm_pct.toFixed(1)}%`,
            isGreen,
            isRed,
          };
        }),
      ],
      deltaStr,
      deltaClass,
    };
  });

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        {buLabel} — overall QoQ (standard vs non-standard)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-250 bg-gray-50">
              <th className="p-3 font-bold text-gray-600 border-r border-gray-200" rowSpan={2}>
                {buLabel}
              </th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  colSpan={h.colSpan}
                  className="p-3 text-center font-bold text-gray-700 border-r border-gray-200 whitespace-pre-line"
                >
                  {h.label}
                </th>
              ))}
              <th
                className="p-3 font-bold text-gray-700 border-r border-gray-200 whitespace-pre-line text-center bg-gray-50/70"
                rowSpan={2}
              >
                {"ΔGM%\n(Q4 FY26 vs Baseline)"}
              </th>
            </tr>

            <tr className="border-b border-gray-250 bg-gray-50/50">
              {subHeaders.map((sh, i) => (
                <th
                  key={i}
                  className="p-2 text-center text-[10px] font-bold text-gray-500 border-r border-gray-200 whitespace-pre-line"
                >
                  {sh}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                <td className="p-3 font-bold text-gray-700 bg-gray-50/30 border-r border-gray-200">
                  {row.type}
                </td>
                {row.data.map((col, colIdx) => (
                  <React.Fragment key={colIdx}>
                    <td className="p-3 text-center text-gray-600 border-r border-gray-200">
                      {col.rev}
                    </td>
                    <td
                      className={`p-3 text-center font-bold border-r border-gray-200 ${
                        col.isGreen ? "text-emerald-600" : col.isRed ? "text-rose-600" : "text-gray-500"
                      }`}
                    >
                      {col.gm}
                    </td>
                  </React.Fragment>
                ))}
                <td className={`p-3 text-center font-bold border-r border-gray-200 bg-gray-50/30 ${row.deltaClass}`}>
                  {row.deltaStr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverallQoQTable;
