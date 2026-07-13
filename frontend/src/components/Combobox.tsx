import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import Text from './Text.tsx'

interface Props {
  error?: boolean;
  onChange: (value: any) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: any;
  listValues?: any;
  onQueryChange?: (query: string) => void;
}

const SearchDropdown: React.FC<Props> = ({onChange, className, placeholder, disabled, initialValue, error, listValues, onQueryChange}) =>  {

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(initialValue)

useEffect(() => {
  if (initialValue) {
    setSelected(initialValue);
  }
}, [initialValue])


  // When onQueryChange is provided, the caller owns filtering (e.g. a
  // server-side search) — listValues is trusted as-is instead of being
  // re-filtered against the locally-typed query.
  const filteredPeople =
    onQueryChange
      ? listValues
      : query === ''
        ? listValues
        : listValues.filter((item: any) => {
            return item.name.toLowerCase().includes(query.toLowerCase())
          })

  return (
    <div className={`mx-auto h-full ${className}`}>
      <Combobox value={selected} onChange={(value) => { setSelected(value); onChange(value)}} onClose={() => setQuery('')}>
        <div className="relative">
          <ComboboxInput
          className={clsx(
            'w-full rounded-lg border border-gray-400 bg-white py-1.5 pr-8 pl-3 text-sm/6 text-primary_text',
            'focus:outline-none data-[focus]:outline-2 data-[focus]:-outline-offset-2 data-[focus]:outline-white/25'
          )}
            displayValue={(item: any) => item?.name}
            onChange={(event) => {
              setQuery(event.target.value);
              onQueryChange?.(event.target.value);
            }}
            placeholder={placeholder}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="size-6 text-gray-400 group-data-[hover]:fill-blue" aria-hidden="true" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={clsx(
            'w-[var(--input-width)] rounded-xl border border-grey bg-white p-1 [--anchor-gap:var(--spacing-1)] empty:invisible',
            'transition duration-100 ease-in data-[leave]:data-[closed]:opacity-0 '
          )}
        >
          {filteredPeople.map((item: any, index: number) => (
            <ComboboxOption
              key={`${item?.name}-${index}`}
              value={item}
              className="group flex cursor-default text-primary_text items-center gap-2 rounded-lg py-1.5 px-3 select-none data-[focus]:bg-blue-100"
            >
              <CheckIcon className="invisible size-4 fill-gray group-data-[selected]:visible" />
              <div className='flex flex-row items-center gap-1'>
                <Text className="text-small text-primary_text">{item.name}</Text>
                {item?.subname && <Text className="text-[11px] text-primary_text">{'(' + item.subname + ')'}</Text>}
              </div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  )
}

export default SearchDropdown;