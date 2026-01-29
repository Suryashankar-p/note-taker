// thermax-ai-studio/frontend/src/pages/transmitter_ocr/Sidebar.tsx
import React, { useState } from 'react';
import Text from '../../components/Text';
import Knowledge from '../../assets/marketplace.svg';
import Usage from '../../assets/usage.svg';
import Community from '../../assets/people-group.svg';
import downArrow from '../../assets/down_arrow.svg.svg';
import upArrow from '../../assets/up_arrow.svg.svg';

type SettingsValueType = {
  title: string;
  src: string;
  alt: string;
  key: string;
};

interface TransmitterOcrSidebarProps {
  onSelect: (key: string) => void;
  selected: string;
}

const TransmitterOcrSidebar: React.FC<TransmitterOcrSidebarProps> = ({ onSelect, selected }) => {
  const [expandedSections, setExpandedSections] = useState({
    master: true,
    child: true
  });

  const toggleSection = (section: 'master' | 'child') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const masterItems: SettingsValueType[] = [
    {
      title: 'Activity',
      src: Knowledge,
      alt: 'products',
      key: 'MasterActivity'
    },
    {
      title: 'Usage',
      src: Usage,
      alt: 'usage',
      key: 'MasterUsage'
    }
  ];

  const childItems: SettingsValueType[] = [
    {
      title: 'Activity',
      src: Knowledge,
      alt: 'products',
      key: 'ChildActivity'
    },
    {
      title: 'Usage',
      src: Usage,
      alt: 'usage',
      key: 'ChildUsage'
    }
  ];

  const otherItems: SettingsValueType[] = [
    {
      title: 'Activity Summary',
      src: Knowledge,
      alt: 'summary',
      key: 'ActivitySummary'
    },
    {
      title: 'Members',
      src: Community,
      alt: 'members',
      key: 'members'
    }
  ];

  return (
    <div className='w-1/6 flex flex-col mt-[7vh] h-full bg-neutral-700'>
      <div className='flex flex-col ml-[1vw] mt-10'>
        {/* Master Section */}
        <div className='mb-2'>
          <button
            onClick={() => toggleSection('master')}
            className='text-white my-[0.8vh] flex flex-row items-center gap-4 justify-start border-none hover:bg-[#373737] rounded-full p-2 transition duration-300 ease-in-out w-full'
          >
            <img 
              src={expandedSections.master ? upArrow : downArrow} 
              className='pl-3 filter invert' 
              loading='lazy' 
              alt="toggle" 
            />
            <Text className='text-[14px] font-bold' type='small'>Master</Text>
          </button>
          
          {expandedSections.master && (
            <div className="ml-8">
              {masterItems.map(({ title, src, alt, key }) => (
                <button
                  onClick={() => { onSelect(key); }}
                  key={key}
                  className={`text-white my-[0.8vh] flex flex-row items-center gap-4 justify-start border-none ${selected === key ? 'bg-danger' : 'hover:bg-[#373737]'} rounded-full p-2 transition duration-300 ease-in-out w-full`}
                >
                  <img src={src} className='pl-3' loading='lazy' alt={alt} />
                  <Text className='text-[14px]' type='small'>{title}</Text>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Child Section */}
        <div className='mb-2'>
          <button
            onClick={() => toggleSection('child')}
            className='text-white my-[0.8vh] flex flex-row items-center gap-4 justify-start border-none hover:bg-[#373737] rounded-full p-2 transition duration-300 ease-in-out w-full'
          >
            <img 
              src={expandedSections.child ? upArrow : downArrow} 
              className='pl-3 filter invert' 
              loading='lazy' 
              alt="toggle" 
            />
            <Text className='text-[14px] font-bold' type='small'>Child</Text>
          </button>
          
          {expandedSections.child && (
            <div className="ml-8">
              {childItems.map(({ title, src, alt, key }) => (
                <button
                  onClick={() => { onSelect(key); }}
                  key={key}
                  className={`text-white my-[0.8vh] flex flex-row items-center gap-4 justify-start border-none ${selected === key ? 'bg-danger' : 'hover:bg-[#373737]'} rounded-full p-2 transition duration-300 ease-in-out w-full`}
                >
                  <img src={src} className='pl-3' loading='lazy' alt={alt} />
                  <Text className='text-[14px]' type='small'>{title}</Text>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Other Items */}
        {otherItems.map(({ title, src, alt, key }) => (
          <button
            onClick={() => { onSelect(key); }}
            key={key}
            className={`text-white my-[0.8vh] flex flex-row items-center gap-4 justify-start border-none ${selected === key ? 'bg-danger' : 'hover:bg-[#373737]'} rounded-full p-2 transition duration-300 ease-in-out`}
          >
            <img src={src} className='pl-3' loading='lazy' alt={alt} />
            <Text className='text-[14px]' type='small'>{title}</Text>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransmitterOcrSidebar;