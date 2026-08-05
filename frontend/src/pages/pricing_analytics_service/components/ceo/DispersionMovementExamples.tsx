import React from "react";

interface DispersionMovementExamplesProps {
  setSelectedFamily: (val: string) => void;
  dispersionExamples?: Array<{
    category: string;
    examples: string[];
  }>;
  selectedQuarter?: string;
}

const DispersionMovementExamples = ({
  setSelectedFamily,
  dispersionExamples,
  selectedQuarter = "",
}: DispersionMovementExamplesProps) => {
  const defaultCategories = [
    {
      category: "GM gone up, Dispersion came down",
      examples: ["Heat Pump (Unclassified)", "Panel 2 (VA) (Value-added)"],
    },
    {
      category: "GM gone up, Dispersion gone up",
      examples: ["Burner 1 (Commodity)", "PUMP 1 (Commodity)"],
    },
    {
      category: "GM flat, dispersion down",
      examples: ["Pressure switch (Commodity)", "Ignition transformer (Commodity)"],
    },
  ];

  const categories = dispersionExamples || defaultCategories;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800">
      <h3 className="text-sm font-bold tracking-wider text-gray-550 uppercase mb-2">
        Dispersion movement examples
      </h3>
      <p className="text-[10px] text-gray-400 mb-4 font-semibold uppercase">
        Click a family to update the dispersion charts above.
      </p>

      <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
            <th className="p-3 border-r border-gray-200 w-1/3">Category</th>
            <th className="p-3">Examples</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {categories.map((ex, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
              <td className="p-3 font-semibold text-gray-900 border-r border-gray-200 bg-gray-50/20">
                {ex.category}
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {ex.examples.length === 0 ? (
                    <span className="text-gray-400 italic text-[11px]">No examples</span>
                  ) : (
                    ex.examples.map((item, itemIdx) => {
                      const cleanNk = item.split(" (")[0];
                      return (
                        <span
                          key={itemIdx}
                          onClick={() => setSelectedFamily(cleanNk)}
                          className="bg-gray-100 hover:bg-gray-200 border border-gray-250 px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 cursor-pointer transition-colors shadow-xs"
                        >
                          {item}
                        </span>
                      );
                    })
                  )}
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
