import React from "react";
import { AlertCircle, ArrowRight, BarChart3, TrendingUp, Sparkles } from "lucide-react";

interface CellData {
  row: string;
  col: string;
  count: number;
  colorClass: string;
  families: string[];
}

interface QoqMatrixTabProps {
  selectedQoqCell: CellData | null;
  setSelectedQoqCell: (cell: CellData | null) => void;
  selectedFamily: string | null;
  setSelectedFamily: (family: string | null) => void;
  onNavigateToSku: () => void;
}

const QoqMatrixTab: React.FC<QoqMatrixTabProps> = ({
  selectedQoqCell,
  setSelectedQoqCell,
  selectedFamily,
  setSelectedFamily,
  onNavigateToSku,
}) => {
  const columns = [
    "Higher — last 3Q (all > PY avg)",
    "Higher — last 2Q (last 2 > PY avg)",
    "Lower — last 2Q (last 2 < PY avg)",
    "Lower — last 3Q (all 3 < PY avg)",
    "Fluctuating / other (mixed)",
  ];

  const rows = [
    "Above +3% vs PMA",
    "Within ±3% vs PMA",
    "Below -3% vs PMA",
  ];

  const matrixData: Record<string, Record<string, { count: number; color: string; families: string[]; familyData: any[] }>> = {
    "Above +3% vs PMA": {
      "Higher — last 3Q (all > PY avg)": {
        count: 2,
        color: "bg-emerald-800 hover:bg-emerald-700 text-white",
        families: ["He (Shell)", "Sight Glass"],
        familyData: [
          { name: "He (Shell)", revenue: "₹9.02L", actual: "64.3%", target: "52.0%", delta: "+12.3" },
          { name: "Sight Glass", revenue: "₹0.16L", actual: "63.8%", target: "59.5%", delta: "+4.3" }
        ]
      },
      "Higher — last 2Q (last 2 > PY avg)": {
        count: 1,
        color: "bg-emerald-800 hover:bg-emerald-700 text-white",
        families: ["Furnace"],
        familyData: [{ name: "Furnace", revenue: "₹0.57L", actual: "74.6%", target: "64.3%", delta: "+10.3" }]
      },
      "Lower — last 2Q (last 2 < PY avg)": {
        count: 2,
        color: "bg-emerald-800 hover:bg-emerald-700 text-white",
        families: ["Sight Glass Type B", "Air Preheater 1"],
        familyData: [
          { name: "Sight Glass Type B", revenue: "₹1.10L", actual: "62.4%", target: "58.0%", delta: "+4.4" },
          { name: "Air Preheater 1", revenue: "₹2.20L", actual: "60.9%", target: "57.5%", delta: "+3.4" }
        ]
      },
      "Lower — last 3Q (all 3 < PY avg)": {
        count: 2,
        color: "bg-emerald-800 hover:bg-emerald-700 text-white",
        families: ["VALVE 2 (VA)", "Pneumatic Cylinder"],
        familyData: [
          { name: "VALVE 2 (VA)", revenue: "₹3.71L", actual: "65.8%", target: "60.0%", delta: "+5.8" },
          { name: "Pneumatic Cylinder", revenue: "₹5.00L", actual: "61.7%", target: "56.3%", delta: "+5.4" }
        ]
      },
      "Fluctuating / other (mixed)": {
        count: 3,
        color: "bg-amber-800 hover:bg-amber-750 text-white",
        families: ["ID Fan", "Screw Feeder", "He (MPA)"],
        familyData: [
          { name: "ID Fan", revenue: "₹21.67L", actual: "51.9%", target: "45.9%", delta: "+8.0" },
          { name: "Screw Feeder", revenue: "₹11.37L", actual: "63.3%", target: "58.1%", delta: "+5.2" },
          { name: "He (MPA)", revenue: "₹74.34L", actual: "56.8%", target: "52.0%", delta: "+4.8" }
        ]
      },
    },
    "Within ±3% vs PMA": {
      "Higher — last 3Q (all > PY avg)": {
        count: 5,
        color: "bg-amber-800 hover:bg-amber-750 text-white",
        families: ["Boiler Spares", "Pump Motor", "Ducting B", "Standard Piping", "Heat Tube A"],
        familyData: [
          { name: "Boiler Spares", revenue: "₹15.20L", actual: "52.1%", target: "50.0%", delta: "+2.1" },
          { name: "Pump Motor", revenue: "₹8.40L", actual: "53.2%", target: "51.5%", delta: "+1.7" }
        ]
      },
      "Higher — last 2Q (last 2 > PY avg)": {
        count: 2,
        color: "bg-amber-800 hover:bg-amber-750 text-white",
        families: ["Coupler Joint", "WEGMAN CONE"],
        familyData: [
          { name: "Coupler Joint", revenue: "₹2.40L", actual: "58.4%", target: "57.0%", delta: "+1.4" },
          { name: "WEGMAN CONE", revenue: "₹37.98L", actual: "64.2%", target: "59.9%", delta: "+4.3" }
        ]
      },
      "Lower — last 2Q (last 2 < PY avg)": {
        count: 6,
        color: "bg-rose-900 hover:bg-rose-800 text-white",
        families: ["Flange Standard", "O-Ring Seal", "Gasket Sheet", "Thermocouple A", "Igniter Rod", "Refractory Brick"],
        familyData: [
          { name: "Flange Standard", revenue: "₹1.90L", actual: "48.2%", target: "49.0%", delta: "-0.8" }
        ]
      },
      "Lower — last 3Q (all 3 < PY avg)": {
        count: 5,
        color: "bg-rose-900 hover:bg-rose-800 text-white",
        families: ["Nozzle Tip", "Burner Mounting", "Pressure Valve", "Solenoid Coil", "Oil Preheater"],
        familyData: [
          { name: "Nozzle Tip", revenue: "₹3.10L", actual: "47.1%", target: "48.5%", delta: "-1.4" }
        ]
      },
      "Fluctuating / other (mixed)": {
        count: 8,
        color: "bg-amber-800 hover:bg-amber-750 text-white",
        families: ["Air Compressor", "Exhaust Duct", "Level Gauge", "Bimetal Switch", "Safety Valve", "Fuel Line B", "Expansion Joint", "Filter Mesh"],
        familyData: [
          { name: "Air Compressor", revenue: "₹9.80L", actual: "50.4%", target: "51.0%", delta: "-0.6" }
        ]
      },
    },
    "Below -3% vs PMA": {
      "Higher — last 3Q (all > PY avg)": {
        count: 9,
        color: "bg-rose-900 hover:bg-rose-800 text-white",
        families: ["Air nozzle", "HE (Economiser)", "Spiral", "Transmitter", "RG / CG / PG", "Level Gauge 1"],
        familyData: [
          { name: "Air nozzle", revenue: "₹20.26L", actual: "53.5%", target: "54.6%", delta: "-1.1" },
          { name: "HE (Economiser)", revenue: "₹25.68L", actual: "49.6%", target: "51.4%", delta: "-1.8" },
          { name: "Spiral", revenue: "₹9.11L", actual: "56.5%", target: "55.2%", delta: "+1.3" },
          { name: "Transmitter", revenue: "₹7.47L", actual: "54.9%", target: "54.4%", delta: "+0.5" },
          { name: "RG / CG / PG", revenue: "₹7.21L", actual: "63.9%", target: "63.0%", delta: "+0.9" },
          { name: "Level Gauge 1", revenue: "₹10.45L", actual: "53.9%", target: "51.7%", delta: "+2.2" }
        ]
      },
      "Higher — last 2Q (last 2 > PY avg)": {
        count: 2,
        color: "bg-rose-900 hover:bg-rose-800 text-white",
        families: ["Steam Trap", "Blowdown Valve"],
        familyData: [
          { name: "Steam Trap", revenue: "₹1.45L", actual: "44.2%", target: "48.0%", delta: "-3.8" }
        ]
      },
      "Lower — last 2Q (last 2 < PY avg)": {
        count: 6,
        color: "bg-rose-900 hover:bg-rose-800 text-white",
        families: ["Thermostat", "Limit Switch", "Pilot Burner", "Diffuser Plate", "Blower Wheel", "V-Belt Fan"],
        familyData: [
          { name: "Thermostat", revenue: "₹0.95L", actual: "45.0%", target: "50.0%", delta: "-5.0" }
        ]
      },
      "Lower — last 3Q (all 3 < PY avg)": {
        count: 4,
        color: "bg-rose-900 hover:bg-rose-800 text-white",
        families: ["Manifold Block", "Air Filter", "Pressure Switch", "Pilot Gas Train"],
        familyData: [
          { name: "Manifold Block", revenue: "₹2.10L", actual: "42.0%", target: "48.0%", delta: "-6.0" }
        ]
      },
      "Fluctuating / other (mixed)": {
        count: 18,
        color: "bg-amber-800 hover:bg-amber-750 text-white",
        families: ["Gas train", "Furnace standard", "HE (Flue Tubes)", "Heating Coil B"],
        familyData: [
          { name: "Gas train", revenue: "₹28.40L", actual: "46.2%", target: "51.0%", delta: "-4.8" }
        ]
      },
    },
  };

  const handleCellClick = (r: string, c: string) => {
    const item = matrixData[r][c];
    setSelectedQoqCell({
      row: r,
      col: c,
      count: item.count,
      colorClass: item.color,
      families: item.families,
    });
    setSelectedFamily(null); // Clear selected family until clicked in the table
  };

  const getRowTotal = (r: string) => {
    let sum = 0;
    columns.forEach((c) => {
      sum += matrixData[r][c].count;
    });
    return sum;
  };

  // Find active family data rows to render
  const activeFamiliesList = selectedQoqCell
    ? matrixData[selectedQoqCell.row]?.[selectedQoqCell.col]?.familyData || []
    : [];

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* Matrix Box */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-gray-850">
              QoQ matrix — margin vs PMA × revenue momentum
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
              Revenue trend vs GM vs PMA matrix.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#a61c1e]/5 border border-[#a61c1e]/20 text-gray-700 p-4 rounded-xl mb-6 text-xs font-semibold">
          <AlertCircle className="text-[#a61c1e] shrink-0" size={16} />
          <p>Click any number in the matrix below to see which product families sit in that cell.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-400 font-extrabold uppercase text-[8px] tracking-wider text-center">
                <th className="py-2 px-3 text-left"></th>
                <th className="py-2 px-3 border-l border-gray-150" colSpan={5}>Revenue Trend (Product families — Q4 FY 26)</th>
                <th></th>
              </tr>
              <tr className="border-b border-gray-150 bg-gray-50 text-gray-700 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-3 px-4 w-52 text-left">GM vs PMA \ Revenue vs PY</th>
                {columns.map((colName) => (
                  <th key={colName} className="py-3 px-3 text-center border-l border-gray-150 w-36 font-semibold leading-snug">
                    {colName}
                  </th>
                ))}
                <th className="py-3 px-4 text-center border-l border-gray-200 bg-gray-100/50 w-24">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-center font-semibold">
              {rows.map((rowName) => {
                const total = getRowTotal(rowName);
                return (
                  <tr key={rowName} className="hover:bg-slate-50/40">
                    <td className="py-4 px-4 font-bold text-gray-800 text-left bg-gray-50/20 border-r border-gray-150">
                      {rowName}
                    </td>

                    {columns.map((colName) => {
                      const item = matrixData[rowName][colName];
                      const isSelected = selectedQoqCell?.row === rowName && selectedQoqCell?.col === colName;
                      return (
                        <td key={colName} className="py-4 px-3 border-r border-gray-150">
                          <button
                            onClick={() => handleCellClick(rowName, colName)}
                            className={`w-10 h-10 rounded-lg font-extrabold text-sm transition-all shadow-sm ${item.color} ${
                              isSelected ? "ring-4 ring-[#a61c1e]/40 border-2 border-white scale-105" : ""
                            }`}
                          >
                            {item.count}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-4 px-4 bg-gray-100/30 text-gray-900 font-extrabold text-sm border-l border-gray-200">
                      {total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Product Family Drill-down (populated only when cell is clicked) */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold tracking-tight text-gray-850 mb-3">
          Product family drill-down
        </h3>
        
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 p-3 rounded-lg mb-4 text-xs font-semibold">
          <AlertCircle className="text-teal-600 shrink-0" size={14} />
          <p>Click a product family to see performance and dispersion. Scroll down and open SKU drill-down for line-level deviations.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-4">Product Family</th>
                <th className="py-2.5 px-4 text-right">Revenue (Q4 FY 26)</th>
                <th className="py-2.5 px-4 text-right">Actual GM%</th>
                <th className="py-2.5 px-4 text-right">Target GM%</th>
                <th className="py-2.5 px-4 text-right">Δ (PP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
              {activeFamiliesList.length > 0 ? (
                activeFamiliesList.map((fam, idx) => {
                  const isSelected = selectedFamily === fam.name;
                  const isPositive = fam.delta.startsWith("+");
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedFamily(fam.name)}
                      className={`cursor-pointer hover:bg-slate-50 transition-colors ${
                        isSelected ? "bg-red-50/20 text-[#a61c1e]" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-gray-900">{fam.name}</td>
                      <td className="py-3 px-4 text-right">{fam.revenue}</td>
                      <td className="py-3 px-4 text-right">{fam.actual}</td>
                      <td className="py-3 px-4 text-right">{fam.target}</td>
                      <td className={`py-3 px-4 text-right font-bold ${isPositive ? "text-emerald-600" : "text-rose-600"}`}>
                        {fam.delta}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 font-bold text-xs bg-slate-50/50">
                    No cell selected in step 3. Click a matrix number above to load product families.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Render charts only if a family is selected */}
      {selectedFamily && (
        <div className="bg-white border border-gray-250 rounded-xl p-6 shadow-sm flex flex-col gap-6 animate-fade-in">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-gray-800">
              Revenue and GM % by quarter
            </h3>
            <p className="text-[11px] text-gray-400 font-semibold uppercase mt-0.5">
              Select a product family row in the table to update all charts below. (Active: <strong className="text-[#a61c1e]">{selectedFamily}</strong>)
            </p>
          </div>

          {/* Render custom SVGs/Charts simulating Quarter values in screenshot */}
          <div className="h-60 bg-slate-50 rounded-xl border border-gray-150 p-4 flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 font-extrabold uppercase">Revenue and GM % by quarter for {selectedFamily}</span>
            <div className="flex items-end justify-between h-40 px-6">
              {[50, 42, 68, 35, 60, 55, 63, 44, 52].map((height, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-12">
                  <span className="text-[9px] text-[#a61c1e] font-extrabold">₹{((height * 2.5) / 10).toFixed(1)}L</span>
                  <div className="w-6 bg-[#a61c1e]/20 hover:bg-[#a61c1e]/40 rounded-t border-t border-[#a61c1e] transition-all" style={{ height: `${height}px` }}></div>
                  <span className="text-[8px] text-gray-400 font-bold">Q{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. GM% Dispersion Analysis */}
          <div className="border-t border-gray-100 pt-6 mt-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
              GM% dispersion analysis
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="border border-gray-150 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase mb-4">Normal distribution — GM%</span>
                <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-lg">
                  [Normal Curve Simulation for {selectedFamily}]
                </div>
              </div>
              <div className="border border-gray-150 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase mb-4">GM% distribution trend — quarter on quarter</span>
                <div className="h-40 flex items-center justify-center text-xs text-gray-400 font-semibold border-2 border-dashed border-gray-200 rounded-lg">
                  [Quarter Trend Simulation for {selectedFamily}]
                </div>
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-5 gap-3 text-center border-t border-gray-150 pt-6">
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Mean GM%</span>
              <span className="text-sm font-extrabold text-gray-900 block mt-1">51.6%</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Std-dev (σ)</span>
              <span className="text-sm font-extrabold text-gray-900 block mt-1">7.0%</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Median</span>
              <span className="text-sm font-extrabold text-gray-900 block mt-1">54.6%</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Min GM%</span>
              <span className="text-sm font-extrabold text-rose-600 block mt-1">39.5%</span>
            </div>
            <div>
              <span className="text-[9px] text-gray-400 font-bold uppercase">Max GM%</span>
              <span className="text-sm font-extrabold text-emerald-600 block mt-1">70.0%</span>
            </div>
          </div>

          {/* Drill-down button */}
          <button
            onClick={onNavigateToSku}
            className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-colors"
          >
            SKU deviation drill-down —
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default QoqMatrixTab;
