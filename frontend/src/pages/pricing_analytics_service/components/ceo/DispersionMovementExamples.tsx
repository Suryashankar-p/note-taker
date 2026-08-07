import React from "react";

interface DispersionMovementExamplesProps {
  setSelectedFamily: (val: string) => void;
  dispersionExamples?: any;
  selectedQuarter?: string;
}

const DispersionMovementExamples = ({
  setSelectedFamily,
  dispersionExamples,
  selectedQuarter = "",
}: DispersionMovementExamplesProps) => {
  const getPriorQuarter = (qtr: string) => {
    const match = qtr.match(/Q(\d)\s+FY\s+(\d+)/);
    if (!match) return "";
    const q = parseInt(match[1]);
    const y = parseInt(match[2]);
    if (q === 1) {
      return `Q4 FY ${y - 1}`;
    }
    return `Q${q - 1} FY ${y}`;
  };

  let categories: Array<{ category: string; examples: string[] }> = [];
  if (Array.isArray(dispersionExamples)) {
    categories = dispersionExamples;
  } else if (dispersionExamples && typeof dispersionExamples === "object") {
    categories = Object.entries(dispersionExamples).map(([key, val]) => ({
      category: key,
      examples: Array.isArray(val) ? val : [],
    }));
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800">
      <h3 className="text-sm font-bold tracking-wider text-gray-550 uppercase mb-2">
        Dispersion movement examples {selectedQuarter ? `(${selectedQuarter})` : ""}
      </h3>
      <p className="text-[10px] text-gray-400 mb-4 font-semibold uppercase">
        Click a family to update the dispersion charts above.{selectedQuarter ? ` GM movement vs prior quarter (${getPriorQuarter(selectedQuarter)}); dispersion vs baseline (Q4 FY 24 + Q1 FY 25).` : ""}
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
                      if (!item) return null;
                      const isString = typeof item === "string";
                      const anyItem = item as any;
                      const itemText = isString ? item : (anyItem.display_name || anyItem.name || anyItem.display || anyItem.nk || "");
                      const cleanNk = isString ? item.split(" (")[0] : (anyItem.nk || anyItem.name || "");
                      return (
                        <span
                          key={itemIdx}
                          onClick={() => setSelectedFamily(cleanNk)}
                          className="bg-gray-100 hover:bg-gray-200 border border-gray-250 px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 cursor-pointer transition-colors shadow-xs"
                        >
                          {itemText}
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
