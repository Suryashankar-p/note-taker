import React from "react";
import { getInitials } from "../utils/functions";

interface InitialsProps {
  name?: string;
  size?: number | string;
  fontSize?: string;
  bgColor?: string;
  textColor?: string;
  className?: string;
}

const InitialsAvatar: React.FC<InitialsProps> = ({
  name = "User",
  size = 64,
  fontSize = "22px",
  bgColor = "#ED3438",
  textColor = "#FFFFFF",
  className = "",
}) => {
  const initials = getInitials(name) || "PK";
  const dimension = typeof size === "number" ? `${size}px` : size;

  return (
    <div
      style={{
        width: dimension,
        height: dimension,
        backgroundColor: bgColor,
        color: textColor,
        fontSize,
      }}
      className={`rounded-full flex items-center justify-center font-bold tracking-wide select-none ${className}`}
    >
      {initials}
    </div>
  );
};

export default InitialsAvatar;
