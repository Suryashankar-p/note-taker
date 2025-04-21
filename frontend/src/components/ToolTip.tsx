import React from 'react';

interface TooltipProps {
    data?: string;
}

const Tooltip: React.FC<TooltipProps> = ({ data }) => {
    return (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 mt-1 rounded-md shadow-md z-10">
            {data}
        </div>
    );
}

export default Tooltip;
