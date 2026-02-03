interface PillProps {
    label: string;
    onClick: () => void;
    size: "small" | "medium" | "large";
    selected?: boolean;
  }
  
  const Pill: React.FC<PillProps> = ({ label, onClick, size, selected = false }) => {
    const sizeClasses = {
      small: "px-2 py-1 text-sm ",
      medium: "px-3 py-1 text-base",
      large: "px-3 py-0.5 text-lg",
    };
  
    return (
      <button
        onClick={onClick}
        className={`w-fit rounded-md border bg-white-100 ${
          selected
            ? "border-[#414143] text-[#414143]"
            : "border-red-300 text-red-300"
        } ${sizeClasses[size]} shadow-sm transition-colors duration-200  hover:border-red-400 hover:text-red-700 text-sm`}
      >
        {label}
      </button>
    );
  };
  
  export default Pill;