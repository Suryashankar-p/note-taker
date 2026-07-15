import React from "react";

interface Props {
  data?: {
    insight_texts?: string[];
  };
}

const ClassificationInsights = ({ data }: Props) => {
  const texts = data?.insight_texts || [];

  if (texts.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">
        Classification insights (vs prior quarters)
      </h3>
      <div className="flex flex-col gap-3.5 text-xs text-gray-600 leading-relaxed">
        {texts.map((text, index) => {
          let borderColor = "border-[#a61c1e]";
          if (text.includes("improved") || text.includes("accretive") || text.includes("gained")) {
            borderColor = "border-emerald-500";
          } else if (text.includes("below baseline across the matrix")) {
            borderColor = "border-gray-400";
          }

          // Split the text at the first colon to extract the strong title header
          const colonIndex = text.indexOf(":");
          const headline = colonIndex !== -1 ? text.substring(0, colonIndex + 1) : "";
          const body = colonIndex !== -1 ? text.substring(colonIndex + 1) : text;

          return (
            <div key={index} className={`border-l-4 ${borderColor} bg-gray-55 p-4 rounded-r-lg`}>
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

export default ClassificationInsights;
