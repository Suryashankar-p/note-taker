import React from 'react';
import Text from '../../components/Text';
import Knowledge from '../../assets/marketplace.svg';
import Usage from '../../assets/usage.svg';
import Community from '../../assets/people-group.svg';
import db from '../../assets/database.svg';

type SettingsValueType = {
  title: string;
  src: string;
  alt: string;
  key: string;
};

interface OcrSidebarProps {
  onSelect: (key: string) => void;
  selected: string;
}

const OcrSidebar: React.FC<OcrSidebarProps> = ({ onSelect, selected }) => {
  
  const settingsValues: SettingsValueType[] = [
    {
      title: 'Activity',
      src: Knowledge,
      alt: 'products',
      key: 'Activity'
    },
    {
      title: 'Members',
      src: Community,
      alt: 'members',
      key: 'members'
    },
    {
      title: 'Usage',
      src: Usage,
      alt: 'usage',
      key: 'usage'
    },
    {
      title: 'BAAN',
      src: db,
      alt: 'baan',
      key: 'baan'
    }
  ];

  return (
    <div className='w-1/6 flex flex-col mt-[7vh] h-full bg-neutral-700'>
      <div className='flex flex-col ml-[1vw] mt-10'>
        {settingsValues.map(({ title, src, alt, key }) => (
          <button
            onClick={() => { onSelect(key); }}
            key={key}
            className={`text-white my-[0.8vh] mx-3 flex flex-row items-center gap-4 justify-start border-none ${selected === key ? 'bg-danger' : 'hover:bg-[#373737]'} rounded-full p-2 transition duration-300 ease-in-out`}
          >
            <img src={src} className='pl-3' loading='lazy' alt={alt} />
            <Text className='text-[14px]' type='small'>{title}</Text>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OcrSidebar;
