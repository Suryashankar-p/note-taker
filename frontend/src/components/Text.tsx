import React from 'react';

// Define your custom props
interface CustomTextProps {
    type?: 'header1' | 'header2' | 'header3' | 'subtitle' | 'body' | 'bold-body' | 'small' | 'pre-title' | 'button-text' | 'link';
    children?: React.ReactNode; // Define children prop explicitly
}

// Extend the custom props with the props of a <p> element
type TextProps = CustomTextProps & React.ComponentPropsWithoutRef<'p'>;

const Text: React.FC<TextProps> = ({ type = '', children, className = '', ...props }) => {
    let textStyle = '';

    // Define text styles based on type
    switch (type) {
        case 'header1':
            textStyle = 'font-semibold text-primary_text text-[64px] tracking-[-0.8px]';
            break;
        case 'header2':
            textStyle = 'text-xl lg:text-4xl text-primary_text font-semibold tracking-[-0.8px]';
            break;
        case 'header3':
            textStyle = 'font-bold text-xl leading-7 tracking-[-0.02rem] text-[#172B4D]';
            break;
        case 'subtitle':
            textStyle = 'font-medium text-xl';
            break;
        case 'body':
            textStyle = 'font-medium text-[16px] leading-[140%]';
            break;
        case 'bold-body':
            textStyle = 'font-bold text-[16px] leading-[140%]';
            break;
        case 'small':
            textStyle = 'text-[14px] font-normal ';
            break;
        case 'pre-title':
            textStyle = 'text-base font-normal';
            break;
        case 'button-text':
            textStyle = 'text-xs font-semibold leading-snug tracking-[0.3px]';
            break;
        case 'link':
            textStyle = 'font-bold text-link underline';
            break;
        default:
            textStyle = '';
            break;
    }

    // Spread the rest of the props onto the <p> element
    return <p className={`${textStyle} ${className}`} {...props}>{children}</p>;
};

export default Text;
