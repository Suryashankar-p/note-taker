import React, { useState } from 'react';
import { IconProps } from './Dislike';
import Tooltip from '../components/ToolTip';


const Trash: React.FC<IconProps> = ({ className = '', onClick, color = "#5661F6", disabled }) => {

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => !disabled && setIsHovered(false)}
        className={`icon-container relative ${className} ${color} opacity-45 ${!disabled && "hover:text-[#5661F6] hover:opacity-100"}`} onClick={onClick}>
            <svg width="18" height="18" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 3.40002H2.2H11.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.6 3.4V11.8C10.6 12.1183 10.4735 12.4235 10.2485 12.6485C10.0234 12.8736 9.71821 13 9.39995 13H3.39995C3.08169 13 2.77647 12.8736 2.55142 12.6485C2.32638 12.4235 2.19995 12.1183 2.19995 11.8V3.4M3.99995 3.4V2.2C3.99995 1.88174 4.12638 1.57652 4.35142 1.35147C4.57647 1.12643 4.88169 1 5.19995 1H7.59995C7.91821 1 8.22344 1.12643 8.44848 1.35147C8.67352 1.57652 8.79995 1.88174 8.79995 2.2V3.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5.19995 6.40002V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7.59985 6.40002V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {isHovered && <Tooltip data={'Delete'}/>}
        </div>
    );
}

export default Trash;
