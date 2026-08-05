import React from "react";

interface InsightItem {
  type?: string;
  text: string;
}

interface Props {
  data?: InsightItem[] | string[] | { insight_texts?: string[] };
}

const ClassificationInsights = ({ data }: Props) => {
  let texts: InsightItem[] = [];

  if (Array.isArray(data)) {
    texts = data.map((item) => {
      if (typeof item === "string") {
        return { text: item };
      }
      return item;
    });
  } else if (data && typeof data === "object" && "insight_texts" in data) {
    texts = (data.insight_texts || []).map((text) => ({ text }));
  }

  if (texts.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800">
      <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4">
        Classification insights (vs prior quarters)
      </h3>
      <div className="flex flex-col gap-4 text-xs leading-relaxed text-gray-600">
        {texts.map((item, index) => {
          const text = item.text;
          let borderColor = "border-[#a61c1e] bg-red-50/10";
          if (text.includes("Commodity - High") || text.includes("weakened")) {
            borderColor = "border-[#06b6d4] bg-cyan-50/10"; // Cyan accent
          } else if (text.includes("improved") || text.includes("accretive") || text.includes("gained") || text.includes("Commodity - Medium")) {
            borderColor = "border-emerald-500 bg-emerald-50/10"; // Emerald accent
          } else if (text.includes("Concentration") || text.includes("baseline concentration")) {
            borderColor = "border-gray-400 bg-gray-50/50"; // Gray/Info accent
          }

          // Split headline on first colon
          const colonIndex = text.indexOf(":");
          const headline = colonIndex !== -1 ? text.substring(0, colonIndex + 1) : "";
          const body = colonIndex !== -1 ? text.substring(colonIndex + 1) : text;

          return (
            <div key={index} className={`border-l-4 ${borderColor} p-4 rounded-r-xl border border-y border-r border-gray-200/50`}>
              {headline ? (
                <>
                  <strong className="text-gray-900 block mb-1 font-bold">{headline}</strong>
                  <span>{body}</span>
                </>
              ) : (
                <span>{text}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassificationInsights;
