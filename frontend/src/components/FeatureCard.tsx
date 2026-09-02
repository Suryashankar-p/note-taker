import React from "react";

interface FeatureCardProps {
  title?: string;
  subtitle?: string;
  path?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Universal FeatureCard Component
 * Supports both feature info badges (with compact p-4 padding) and custom section containers (with p-6 padding).
 */
const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  subtitle,
  path,
  className = "",
  children,
}) => (
  <div className={`border border-[#E5E7EB] bg-white rounded-xl shadow-sm ${path ? "p-4" : "p-6"} ${className}`}>
    {title && !path && (
      <h2 className="text-[12px] font-semibold tracking-wider text-primary_text uppercase pb-3 border-b border-[#F0F0F0]">
        {title}
      </h2>
    )}
    {path ? (
      <div className="flex flex-row items-center gap-3.5 min-h-[4rem]">
        <div className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 flex-shrink-0 bg-white">
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={path} />
          </svg>
        </div>
        <div className="flex flex-col justify-center text-left min-w-0 flex-1">
          <h4 className="text-[14px] font-semibold text-gray-900 leading-tight whitespace-nowrap">{title}</h4>
          {subtitle && <p className="text-[12px] text-gray-500 mt-1 leading-normal">{subtitle}</p>}
        </div>
      </div>
    ) : (
      <div className={title ? "pt-5" : ""}>{children}</div>
    )}
  </div>
);

export default FeatureCard;
