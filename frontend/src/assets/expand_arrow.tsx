import React, { MouseEventHandler } from 'react';
import {colors} from '../utils/colors.js';

interface IconProps {
  color?: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement> | undefined;
  width?: string;
  height?: string;
  border?: string;
}

const Icon: React.FC<IconProps> = ({ color = '#979797', width='56', height='56', className='', onClick, border='none'}) => {
  return (
    <div className={className} onClick={onClick}>
      <svg width={width} height={height} viewBox={`0 0 56 56`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d)">
          <circle cx="28" cy="23" r="12" fill={color} />
          <circle cx="28" cy="23" r="11.75" stroke={border} strokeWidth="0.5" />
        </g>
        <path
          d={color === colors.danger ? "M25 21L28 25L31 21": "M26.5269 26.9115L30.4206 23.0001L26.5269 19.0887"}
          stroke={color === colors.danger ? 'white' : '#979797'}
          strokeLinecap="round"
          strokeLinejoin="round"
          
        />
        <defs>
          <filter id="filter0_d" x="0" y="0" width="56" height="56" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset dy="5" />
            <feGaussianBlur stdDeviation="8" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.0323264 0 0 0 0 0.0598209 0 0 0 0 0.204167 0 0 0 0.06 0" />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default Icon;
