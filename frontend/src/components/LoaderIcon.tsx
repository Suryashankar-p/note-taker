const LoaderIcon = ({ size = 24, color = "red" }) => {
    return (
      <svg
        className="animate-spin"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="10"
          cy="10"
          r="2"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeDasharray="50"
          strokeDashoffset="10"
          opacity="0"
        />
        <path
          d="M4 12a8 8 0 018-8"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  };
  
  export default LoaderIcon;
  