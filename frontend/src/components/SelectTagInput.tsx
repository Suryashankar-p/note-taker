import React, { useState, useRef, useEffect } from "react";
import Text from "./Text";

interface Tag {
  id: number | null | string;
  title: string;
}

interface SelectTagInputProps {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  options: Tag[];
  placeholder?: string;
  disabled?: boolean;
}

const SelectTagInput: React.FC<SelectTagInputProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<Tag[]>(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    setInputValue(input);
    if (input.length > 0) {
      setFilteredOptions(
        options.filter((option) =>
          option.title.toLowerCase().includes(input.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
    setDropdownOpen(true); // Ensure dropdown opens when typing
  };

  const handleAddTag = (tag: Tag) => {
    if (!value.find((t) => t.id === tag.id)) {
      onChange([...value, tag]);
      setInputValue("");
      setDropdownOpen(false);
    }
  };

  const handleRemoveTag = (tag: Tag) => {
    const index = value.findIndex((t) => String(t.id) === String(tag.id));
    if (index === -1) return;

    const newTags = [...value];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Reset filtered options when options change
    setFilteredOptions(options);
  }, [options]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex flex-wrap gap-2 max-h-32 overflow-auto items-center border rounded-md p-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {value.length === 0 && !inputValue && (
          <span className="text-gray-400">{placeholder}</span>
        )}

        {value?.map((tag) => (
          <div
            key={String(tag.id)}
            className="flex items-center bg-blue-100 text-blue-700 rounded-full px-3 py-1"
          >
            <span className="truncate max-w-[120px]" title={tag.title}>
              {tag.title}
            </span>
            <button
              type="button"
              disabled={disabled}
              className="ml-2 focus:outline-none text-blue-500 hover:text-blue-700"
              onClick={() => handleRemoveTag(tag)}
            >
              &times;
            </button>
          </div>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setDropdownOpen(true)}
          onMouseDown={() => setDropdownOpen(true)}
          ref={inputRef}
          disabled={disabled}
          className="flex-grow min-w-[100px] border-none text-primary_text p-2 focus:outline-none"
        />
      </div>

      {dropdownOpen && (
        <div className="absolute max-h-28 overflow-auto z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          {filteredOptions?.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={String(option.id)}
                className="p-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleAddTag(option)}
              >
                {option.title}
              </div>
            ))
          ) : (
            <div className="p-2 text-primary_text">
              <Text type="body">No options available</Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectTagInput;
