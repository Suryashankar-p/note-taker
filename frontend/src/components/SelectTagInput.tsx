import React, { useState, useRef, useEffect } from 'react';
import Text from './Text';

interface Tag {
    id: number | null;
    title: string;
}

interface SelectTagInputProps {
    value: Tag[];
    onChange: (tags: Tag[]) => void;
    options: Tag[];
    placeholder?: string;
    disabled?: boolean;
}

const SelectTagInput: React.FC<SelectTagInputProps> = ({ value, onChange, options, placeholder, disabled }) => {
    const [inputValue, setInputValue] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<Tag[]>(options);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const input = event.target.value;
        setInputValue(input);
        if (input.length > 0) {
            setFilteredOptions(options.filter(option => option.title.toLowerCase().includes(input.toLowerCase())));
        } else {
            setFilteredOptions(options);
        }
        setDropdownOpen(true); // Ensure dropdown opens when typing
    };

    const handleAddTag = (tag: Tag) => {
        if (!value.find(t => t.id === tag.id)) {
            onChange([...value, tag]);
            setInputValue('');
            setDropdownOpen(false);
        }
    };

    const handleRemoveTag = (tag: Tag) => {
        onChange(value.filter(t => t.id !== tag.id));
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        // Reset filtered options when options change
        setFilteredOptions(options);
    }, [options]);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div className="flex flex-wrap max-h-32 overflow-auto items-center border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setDropdownOpen(true)}
                    onMouseDown={() => setDropdownOpen(true)}
                    ref={inputRef}
                    disabled={disabled}
                    className="flex-grow h-12 w-full border-none text-primary_text p-2 focus:outline-none"
                    placeholder={placeholder}
                />
                {value?.map(tag => (
                    <div key={tag.id} className="flex items-center bg-blue-100 text-blue-700 rounded-full px-2 py-1 mr-2 mb-2">
                        <span>{tag.title}</span>
                        <button
                            type="button"
                            disabled={disabled}
                            className="ml-2 focus:outline-none"
                            onClick={() => handleRemoveTag(tag)}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            {dropdownOpen && (
                <div className="absolute max-h-28 overflow-auto z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                    {filteredOptions?.length > 0 ? filteredOptions?.map(option => (
                        <div
                            key={option.id}
                            className="p-2 hover:bg-blue-100 cursor-pointer"
                            onClick={() => handleAddTag(option)}
                        >
                            {option.title}
                        </div>
                    )) :
                        <div className="p-2 text-primary_text">
                            <Text type='body'>No options available</Text>
                        </div>}
                </div>
            )}
        </div>
    );
};

export default SelectTagInput;
