import React from "react";

const OverallQoQTable = () => {
  const headers = [
    { label: "Baseline\n(Q4 FY24 + Q1 FY25)", colSpan: 2 },
    { label: "Q2 FY25", colSpan: 2 },
    { label: "Q4 FY25", colSpan: 2 },
    { label: "Q1 FY26", colSpan: 2 },
    { label: "Q2 FY26", colSpan: 2 },
    { label: "Q3 FY26", colSpan: 2 },
    { label: "Q4 FY26", colSpan: 2 },
  ];

  const subHeaders = Array(7).fill(["Revenue\n(INR Cr)", "Achieved\nGM%"]).flat();

  const rows = [
    {
      type: "Overall",
      data: [
        { rev: "17.1", gm: "49.1%" },
        { rev: "18.9", gm: "51.9%", isGreen: true },
        { rev: "24.1", gm: "47.7%", isRed: true },
        { rev: "16.2", gm: "50.4%", isGreen: true },
        { rev: "20.7", gm: "51.7%", isGreen: true },
        { rev: "21.0", gm: "51.8%", isGreen: true },
        { rev: "21.8", gm: "52.2%", isGreen: true },
      ],
    },
    {
      type: "Standard",
      data: [
        { rev: "8.1", gm: "50.0%" },
        { rev: "9.3", gm: "52.1%", isGreen: true },
        { rev: "10.2", gm: "49.6%", isRed: true },
        { rev: "9.4", gm: "51.7%", isGreen: true },
        { rev: "9.3", gm: "52.8%", isGreen: true },
        { rev: "10.0", gm: "50.9%", isGreen: true },
        { rev: "10.0", gm: "52.8%", isGreen: true },
      ],
    },
    {
      type: "Non-standard",
      data: [
        { rev: "9.0", gm: "49.1%" },
        { rev: "9.6", gm: "51.0%", isGreen: true },
        { rev: "13.9", gm: "47.0%", isRed: true },
        { rev: "6.8", gm: "48.2%", isRed: true },
        { rev: "11.4", gm: "50.9%", isGreen: true },
        { rev: "11.0", gm: "51.1%", isGreen: true },
        { rev: "11.8", gm: "51.1%", isGreen: true },
      ],
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        Heating — overall QoQ (standard vs non-standard)
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            {/* Main Header Quarters */}
            <tr className="border-b border-gray-250 bg-gray-50">
              <th className="p-3 font-bold text-gray-600 border-r border-gray-200" rowSpan={2}>
                Heating
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
            </tr>

            {/* Sub-headers (Revenue & GM%) */}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverallQoQTable;
