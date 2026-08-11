import React from "react";

interface InsightObject {
  title?: string;
  text: string;
}

interface SkyscraperInsightsProps {
  insights: string[] | InsightObject[];
}

const SkyscraperInsights = ({ insights }: SkyscraperInsightsProps) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm text-gray-800">
      <h3 className="text-sm font-bold tracking-wider text-gray-500 uppercase mb-4">
        Revenue & GM ladder insights
      </h3>
      <div className="flex flex-col gap-4 text-xs leading-relaxed text-gray-600">
        {insights.map((item, index) => {
          let title = "";
          let body = "";

          if (typeof item === "string") {
            const colonIndex = item.indexOf(":");
            title = colonIndex !== -1 ? item.substring(0, colonIndex + 1) : "";
            body = colonIndex !== -1 ? item.substring(colonIndex + 1) : item;
          } else {
            title = item.title ? `${item.title}:` : "";
            body = item.text;
          }

          let borderColor = "border-[#a61c1e] bg-red-50/10";
          if (title.toLowerCase().includes("largest gap") || body.toLowerCase().includes("biggest target miss")) {
            borderColor = "border-[#06b6d4] bg-cyan-50/10"; // Cyan accent
          } else if (title.toLowerCase().includes("highest revenue") || body.toLowerCase().includes("main lever")) {
            borderColor = "border-emerald-500 bg-emerald-50/10"; // Emerald accent
          } else if (title.toLowerCase().includes("chronic drag")) {
            borderColor = "border-gray-400 bg-gray-50/50"; // Gray/Info accent
          }

          return (
            <div key={index} className={`border-l-4 ${borderColor} p-4 rounded-r-xl border border-y border-r border-gray-200/50`}>
              {title ? (
                <>
                  <strong className="text-gray-900 block mb-1 font-bold">{title}</strong>
                  <span>{body}</span>
                </>
              ) : (
                <span>{body}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SkyscraperInsights;
