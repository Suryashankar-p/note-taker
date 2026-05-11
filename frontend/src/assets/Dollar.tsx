import React, { useState } from 'react'
import { roundToFourDecimals } from '../utils/functions'

interface DollarProps {
  disabled?: boolean;
  onClick?: any;
  className?: string;
  data?: string;
}

interface TooltipProps {
  data?: string
}

const Dollar: React.FC<DollarProps> = ({ disabled, onClick, className, data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`icon-container ${className} relative`}
      onClick={onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => !disabled && setIsHovered(false)}
    >
      <svg style={{ fill: isHovered ? '#5661F6' : '#374151', fillOpacity: isHovered ? 1 : 0.7 }} xmlns="http://www.w3.org/2000/svg" width="17" height="17" className="bi bi-currency-dollar" viewBox="0 0 14 14">
        <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73z" />
      </svg>
      {isHovered && !disabled && <Tooltip data={parseFloat(data) >= 0 ? '$' + roundToFourDecimals(data) : 'Price Not available'} />}
    </div>
  );
}
export default Dollar;

const Tooltip: React.FC<TooltipProps> = ({ data }) => {
  return (
    <div className="absolute top-full left-2 transform -translate-x-1 bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-md">
      {data}
    </div>
  );
}


