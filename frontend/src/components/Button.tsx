import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>{
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'very_small' | 'custom';
  custom_type?: 'primary' | 'secondary' | 'danger' | 'normal';
  rounded?: boolean;
  className?: string;
}

const Button: React.FC<PrimaryButtonProps> = ({ children, size = 'custom', custom_type='primary', rounded=false, className='', ...rest }) => {
  let sizeClasses;
  let typeClasses;
  let roundedClasses = rounded ? 'rounded-full' : 'rounded-lg';

  switch (size) {
    case 'very_small':
      sizeClasses = 'w-12 h-14'
      break
    case 'small':
      sizeClasses = 'px-1 py-2 text-sm w-32';
      break;
    case 'medium':
      sizeClasses = 'px-4 py-2 text-base';
      break;
    case 'large':
      sizeClasses = 'px-12 py-4 text-lg md:py-2';
      break;
    case 'custom':
      sizeClasses = '';
      break;
    default:
      sizeClasses = 'px-8 py-2 text-base';
  }

  switch (custom_type) {
    case 'primary':
        typeClasses = 'bg-primary';
        break;
    case 'secondary':
        typeClasses = 'bg-inherit border border-white ';
        break;
    case 'danger':
        typeClasses = 'bg-background border border-danger text-danger';
        break;
    case 'normal':
        typeClasses = '';
        break;
    default:
        typeClasses = '';
  }


  return (
    <button {...rest} className={`flex items-center  ${typeClasses} text-white ${roundedClasses} ${sizeClasses} ${className}`}>
      {children}
    </button>
  );
}

export default Button;