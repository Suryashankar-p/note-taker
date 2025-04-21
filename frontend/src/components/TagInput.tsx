import React, { useEffect, useState } from 'react';
import { UseFormRegister } from 'react-hook-form';
import { IFormInput } from './Modals/AddProductModal';

interface TagInputProps {
    value: { id: number | null, title: string }[];
    onChange: (tags: { id: number | null, title: string }[]) => void;
    placeholder?: string;
    register: UseFormRegister<IFormInput>;
    error?: string;
}

const TagInput: React.FC<TagInputProps> = ({ value, onChange, placeholder = 'Enter tags', register, error }) => {
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        register('models', { required: 'Field is required' }); 
    }, [register]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() !== '') {
            e.preventDefault();
            const newTagTitle = tagInput.trim().toUpperCase();

            // Check if the tag already exists
            const isDuplicate = value.some(tag => tag.title === newTagTitle);
            if (isDuplicate) {
                setTagInput(''); // Clear input if duplicate
                return; // Don't add the duplicate tag
            }

            const newTag = { id: null, title: newTagTitle };
            const newTags = [...value, newTag];
            onChange(newTags);
            setTagInput('');
        }
    };

    const removeTag = (index: number) => {
        const newTags = value.filter((_, i) => i !== index);
        onChange(newTags);
    };

    return (
        <div className="flex flex-col flex-wrap w-full gap-2">
            <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md text-primary_text px-3 py-1 h-12 focus:outline-none`}
                placeholder={placeholder}
            />
            <div className='flex flex-row flex-wrap gap-2'>
                {value?.map((tag, index) => (
                    <div key={`${tag.id ?? 'new'}-${index}`} className="bg-gray-200 rounded-full px-3 py-1 flex items-center">
                        <span className="text-gray-600">{tag.title}</span>
                        <button
                            type="button"
                            className="ml-2 focus:outline-none"
                            onClick={() => removeTag(index)}
                        >
                            &#x2715;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TagInput;
