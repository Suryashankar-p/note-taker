import React from "react";

interface ExampleItem {
  nk: string;
  label: string;
  classification: string | null;
  disp_drop_pp?: number | null;
  rev?: number | null;
}

interface DispersionMovementExamplesProps {
  setSelectedFamily: (val: string | null) => void;
  dispersionExamples?: {
    gm_up_disp_down?: ExampleItem[];
    gm_up_disp_up?: ExampleItem[];
    gm_flat_disp_down?: ExampleItem[];
  } | null;
  selectedQuarter?: string;
}

const DispersionMovementExamples = ({
  setSelectedFamily,
  dispersionExamples,
  selectedQuarter = "",
}: DispersionMovementExamplesProps) => {
  const categories = [
    {
      label: "GM gone up, Dispersion came down",
      items: dispersionExamples?.gm_up_disp_down || [],
    },
    {
      label: "GM gone up, Dispersion gone up",
      items: dispersionExamples?.gm_up_disp_up || [],
    },
    {
      label: "GM flat, dispersion down",
      items: dispersionExamples?.gm_flat_disp_down || [],
    },
  ];

  const getItemText = (item: ExampleItem) => {
    const hasClass = item.classification && item.classification !== "0" && item.classification !== "#N/A";
    const classificationSuffix = hasClass ? ` (${item.classification})` : "";
    return `${item.label}${classificationSuffix}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-2">
        Dispersion movement examples
      </h3>
      <p className="text-[10px] text-gray-400 mb-4">
        Click a family to update the dispersion charts above.
      </p>

      <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
            <th className="p-3 border-r border-gray-200 w-1/3">Category</th>
            <th className="p-3">Examples</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((ex, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50/55 transition-colors">
              <td className="p-3 font-semibold text-gray-700 border-r border-gray-200 bg-gray-50/20">{ex.label}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {ex.items.length === 0 ? (
                    <span className="text-gray-400 italic text-[11px]">No examples</span>
                  ) : (
                    ex.items.map((item, itemIdx) => (
                      <span
                        key={itemIdx}
                        onClick={() => setSelectedFamily(item.nk)}
                        className="bg-gray-100 hover:bg-gray-200 border border-gray-250 px-2.5 py-1 rounded-md text-[11px] font-medium text-gray-700 cursor-pointer transition-colors shadow-xs"
                      >
                        {getItemText(item)}
                      </span>
                    ))
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
