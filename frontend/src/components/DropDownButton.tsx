import { Fragment, useState } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import Text from './Text';
import { FieldError } from 'react-hook-form';

interface Props {
  label?: string;
  listValues: any[];
  value: any; // Value selected in the dropdown
  onChange: (value: any) => void; // Function to handle dropdown value change
  error?: FieldError; // Error message for validation
  className?: string
}

const DropDownButton: React.FC<Props> = ({ label, listValues = [{ name: '' }], value, onChange, error, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className} flex flex-col gap-1`}>
      <label>
        <Text className='text-primary_text'>{label}</Text>
      </label>
      <Listbox value={value} onChange={onChange}>
        <div className="relative w-full">
          <ListboxButton
            className={`text-center cursor-pointer relative w-full h-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border focus:outline-none focus:ring-none focus:ring-offset-2 focus:ring-none ${
              error ? 'border-red-500' : ''
            }`}
          >
            <span className="block truncate">{value?.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </ListboxButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-75"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {listValues.map((option, index) => (
                <ListboxOption
                  key={index}
                  className={({ active }) =>
                    `relative cursor-default text-center flex justify-start select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-[#0061F3] bg-opacity-10 text-link_text' : 'text-gray-900'
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        <Text>{option.name}</Text>
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                          <CheckIcon className="h-5 w-5 text-[#0061F3]" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

export default DropDownButton;
