import React, { useRef, useEffect, useState } from "react";

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  className?: string;
  maxLength?: number;
  autoSize?: boolean;
  fixed_size?: "small" | "medium" | "large" | "very_large" | "full";
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder,
  disabled,
  prefixIcon,
  suffixIcon,
  className = "",
  maxLength = 200,
  autoSize = true,
  fixed_size = "medium",
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (autoSize && textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
    }
  }, [value, autoSize]);

  let widthClass;
  let heightClass;

  switch (fixed_size) {
    case "small":
      widthClass = "w-40";
      heightClass = "h-16";
      break;
    case "large":
      widthClass = "w-92";
      heightClass = "h-20";
      break;
    case "very_large":
      widthClass = "w-[60vw]";
      heightClass = "h-24";
      break;
    case "medium":
      widthClass = "w-[16vw]";
      heightClass = "h-20";
      break;
    case "full":
      widthClass =
        "md:w-[20rem] lg:w-[40rem] xl:w-[66rem] xl:landscape:w-[60] sm:w-[40rem] xs:w-[22rem] w-[23rem]";
      heightClass = "h-24";
      break;
    default:
      widthClass = "w-52";
      heightClass = "h-20";
      break;
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > maxLength) {
      setWarning(`Maximum length of ${maxLength} characters exceeded!`);
      return;
    }
    setWarning(null);
    onChange(e.target.value);
  };

  return (
    <div className={`relative z-0 ${className}`}>
      <div
        className={`box-border ${widthClass} ${heightClass} border border-gray-300 rounded-full flex items-center pl-6 pr-10 bg-white ${
          fixed_size === "large" && "shadow-xl"
        }`}
      >
        {prefixIcon && (
          <span className="absolute left-0 pl-6 md:pl-4 flex items-center">
            {prefixIcon}
          </span>
        )}

        <textarea
          ref={textAreaRef}
          disabled={disabled}
          onKeyDown={onKeyDown}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          rows={1}
          className={`custom-placeholder flex-1 bg-transparent border-none outline-none resize-none text-[16px] leading-[140%] text-primary_text font-medium
            ${fixed_size === "large" ? "pl-8" : "pl-6"} pr-14`}
        />

        {suffixIcon && (
          <span className="absolute right-0 pr-14 flex items-center">
            {suffixIcon}
          </span>
        )}
      </div>

      {warning && (
        <p className="text-red-500 text-xs pt-1 pl-2">{warning}</p>
      )}
    </div>
  );
};

export default TextArea;
