import { Radio, RadioGroup } from '@headlessui/react';
import React, { useState } from 'react';
import Text from './Text';

type List = {
    name: string;
    id: number;
}

interface Props {
    radioList: List[];
    onChange: (value: List | undefined) => void;
}

const RadioButtonGroup: React.FC<Props> = ({ radioList, onChange }) => {
    const [selected, setSelected] = useState<List | undefined>(undefined);

    const onRadioChange = (value: List) => {
        setSelected(value);
        onChange(value);
    };

    return (
        <div className="w-full">
            <div className="mt-4 relative w-full max-w-full">
                <RadioGroup
                    value={selected}
                    onChange={onRadioChange}
                    aria-label="Server size"
                    className="flex absolute justify-between space-x-4"
                >
                    {radioList.map((item) => (
                        <Radio
                            key={item.id}
                            value={item}
                            className={({ checked }) => 
                                `min-w-fit h-10 group py-2 px-4 relative flex cursor-pointer border rounded-full shadow-md transition focus:outline-none ${
                                    checked ? 'bg-blue-500 text-background' : 'bg-white/5 text-primary_text'
                                }`
                            }
                        >
                            <Text type='small'>{item.name}</Text>
                        </Radio>
                    ))}
                </RadioGroup>
            </div>
        </div>
    );
};

export default RadioButtonGroup;
