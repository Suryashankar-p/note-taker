import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: (string | Option)[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
  labelPrefix?: string; 
  alignRight?: boolean;
  darkTheme?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  className = "",
  labelPrefix,
  alignRight = false,
  darkTheme = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to Option objects
  const normalizedOptions: Option[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value) || normalizedOptions[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#a61c1e]/10 focus:border-[#a61c1e] transition-all cursor-pointer select-none ${
          darkTheme
            ? "text-slate-300 bg-[#1e2024] border-[#2e3035] hover:bg-[#25282d]"
            : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
        } ${className}`}
      >
        <span className="flex items-center gap-1">
          {labelPrefix && (
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {labelPrefix}
            </span>
          )}
          <span className="truncate max-w-[150px]">{selectedOption?.label}</span>
        </span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#a61c1e]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-[999] mt-1 min-w-[160px] max-h-60 overflow-y-auto rounded-lg border p-1 shadow-xl focus:outline-none ${
            darkTheme
              ? "bg-[#1e2024] border-[#2e3035] text-slate-300"
              : "bg-white border-gray-150 text-gray-700"
          } ${alignRight ? "right-0" : "left-0"}`}
        >
          {normalizedOptions.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-[#a61c1e]/5 text-[#a61c1e] font-semibold"
                    : darkTheme
                    ? "text-slate-300 hover:bg-[#25282d]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={12} className="text-[#a61c1e] ml-2 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
