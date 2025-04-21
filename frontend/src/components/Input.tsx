import React, { LegacyRef, useState } from "react";
import "./Loading.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  fixed_size?: "small" | "medium" | "large" | "very_large" | "full";
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  className?: string;
    ref?: LegacyRef<HTMLInputElement>
  inputClasssName?: string;
  maxLength?: number;
  onChange?: (event) => void;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  fixed_size = "medium",
  prefixIcon,
  suffixIcon,
  inputClasssName,
  ref,
  onChange,
  maxLength = 100,
  className = "",
  ...rest
}) => {
  let widthClass;
  let heightClass;

  const [warning, setWarning] = useState<string | null>(null);

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length > maxLength) {
      setWarning(`Maximum length of ${maxLength} characters exceeded!`);
    } else {
      onChange(event);
      setWarning(null);
    }
  };

  switch (fixed_size) {
    case "small":
      widthClass = "w-40";
      heightClass = "h-8";
      break;
    case "large":
      widthClass = "w-92";
      heightClass = "h-12";
      break;
    case "very_large":
      widthClass = "w-[60vw]";
      heightClass = "h-16";
      break;
    case "medium":
      widthClass = "w-[16vw]"; // Medium size
      heightClass = "h-10";
      break;
    case "full":
      widthClass = "md:w-[20rem] lg:w-[40rem] xl:w-[60rem] xl:landscape:w-[60] sm:w-[40rem] w-[25rem]";
      heightClass = "h-16";
      break;
    default:
      widthClass = "w-52"; // Medium size
      heightClass = "h-10";
      break;
  }

  return (
    <div className={"relative z-0 " + " " + className}>
      <div
        className={`box-border ${widthClass} ${heightClass} ${inputClasssName} border border-gray-300 focus:border-black rounded-full flex items-center ${
          fixed_size === "very_large" ? "pl-8" : "pl-6"
        } pr-10 border ${fixed_size === "very_large" && "shadow-xl"}`}
      >
        {prefixIcon && (
          <span className="absolute left-0 pl-4">{prefixIcon}</span>
        )}
        <input
          type={type}
          onChange={onInputChange}
          className={`custom-placeholder w-full h-full bg-transparent border-none outline-none ${
            fixed_size === "very_large" ? "pl-8" : "pl-6"
          } pr-2 placeholder-gray-400 text-primary_text font-medium text-[16px] leading-[140%]`}
          ref={ref}
          {...rest}
        />
        {suffixIcon && (
          <span className="absolute right-0 pr-2">{suffixIcon}</span>
        )}
      </div>
    </div>
  );
};

export default Input;
