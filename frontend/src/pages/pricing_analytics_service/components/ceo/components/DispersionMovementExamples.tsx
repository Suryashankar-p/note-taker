import React from "react";

interface DispersionMovementExamplesProps {
  setSelectedFamily: (val: string | null) => void;
}

const DispersionMovementExamples = ({
  setSelectedFamily,
}: DispersionMovementExamplesProps) => {
  const examples = [
    {
      category: "GM gone up, Dispersion came down",
      items: ["Heat Pump (Unclassified)", "Panel 2 (VA) (Value-added)"],
    },
    {
      category: "GM gone up, Dispersion gone up",
      items: ["Burner 1 (Commodity)", "PUMP 1 (Commodity)"],
    },
    {
      category: "GM flat, dispersion down",
      items: ["Pressure switch (Commodity)", "Ignition transformer (Commodity)"],
    },
  ];

  const handleFamilyClick = (itemText: string) => {
    const bracketIdx = itemText.indexOf("(");
    const displayName = bracketIdx !== -1 ? itemText.substring(0, bracketIdx).trim() : itemText.trim();
    const nk = displayName.toLowerCase();
    setSelectedFamily(nk);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2">
        Dispersion movement examples (Q4 FY 25)
      </h3>
      <p className="text-[10px] text-gray-400 mb-4">
        Click a family to update the dispersion charts above. GM movement vs prior quarter (Q3 FY 25); dispersion vs baseline (Q4 FY 24 + Q1 FY 25).
      </p>

      <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
            <th className="p-3 border-r border-gray-200 w-1/3">Category</th>
            <th className="p-3">Examples</th>
          </tr>
        </thead>
        <tbody>
          {examples.map((ex, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50/55 transition-colors">
              <td className="p-3 font-semibold text-gray-700 border-r border-gray-200 bg-gray-50/20">{ex.category}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {ex.items.map((item, itemIdx) => (
                    <span
                      key={itemIdx}
                      onClick={() => handleFamilyClick(item)}
                      className="bg-gray-100 hover:bg-gray-200 border border-gray-250 px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 cursor-pointer transition-colors shadow-xs"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DispersionMovementExamples;
