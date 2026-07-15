import React from "react";

interface SkyscraperInsightsProps {
  insights: string[];
}

const SkyscraperInsights = ({ insights }: SkyscraperInsightsProps) => {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        Skyscraper insights
      </h3>
      <div className="flex flex-col gap-3.5 text-xs text-gray-600 leading-relaxed">
        {insights.map((text, index) => {
          let borderColor = "border-[#a61c1e]"; 
          if (text.includes("above target") || text.includes("+")) {
            borderColor = "border-emerald-500";
          } else if (text.includes("below target") || text.includes("-")) {
            borderColor = "border-rose-500";
          }

          const colonIndex = text.indexOf(":");
          const headline = colonIndex !== -1 ? text.substring(0, colonIndex + 1) : "";
          const body = colonIndex !== -1 ? text.substring(colonIndex + 1) : text;

          return (
            <div key={index} className={`border-l-4 ${borderColor} bg-gray-50 p-4 rounded-r-lg`}>
              {headline ? (
                <>
                  <strong className="text-gray-900 block mb-1">{headline}</strong>
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

export default SkyscraperInsights;
