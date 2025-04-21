import React, { useState } from 'react';

interface TooltipProps {
  children: (props: {
    showTooltip: (content: string, position: { top: number; left: number }) => void;
    hideTooltip: () => void;
  }) => React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [tooltip, setTooltip] = useState<{ content: string; position: { top: number; left: number } } | null>(null);

  const showTooltip = (content: string, position: { top: number; left: number }) => {
    setTooltip({ content, position });
  };

  const hideTooltip = () => {
    setTooltip(null);
  };

  return (
    <>
      {children({ showTooltip, hideTooltip })}
      {tooltip && (
        <div
          className="absolute bg-gray-700 text-white text-xs rounded py-1 px-2 z-50"
          style={{ top: tooltip.position.top + 10, left: tooltip.position.left + 10 }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
};

export default Tooltip;
