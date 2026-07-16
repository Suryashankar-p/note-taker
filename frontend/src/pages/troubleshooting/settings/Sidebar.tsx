import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../redux/store'
import Text from '../../../components/Text'
import SettingsIcon from '../../../assets/setting-2.svg'
import Community from '../../../assets/people-group.svg'
import Usage from '../../../assets/usage.svg'
import Knowledge from '../../../assets/marketplace.svg'
import Message from '../../../assets/questions.svg'
import FeedbackIcon from '../../../assets/feedback.svg'

type SettingsValueType = {
    title: string;
    src: any;
    alt: string;
    key: string;
    ownerOnly?: boolean;
}

interface SettingsSidebarProps {
    onSelect: (title: string) => void;
    selected: string
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ onSelect, selected }) => {

    const member = useSelector((state: RootState) => state.memberRole);
    const details = member.service === "troubleshooting" ? member?.details : undefined;
    const isOwner = details?.role === "OWNER";

    const settingsValues: SettingsValueType[] = [
        {
            title: 'Product',
            src: Knowledge,
            alt: 'product',
            key: 'product'
        },
        {
            title: 'Knowledge Base',
            src: Knowledge,
            alt: 'knowledge_base',
            key: 'knowledge_base'
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
            title: 'Analysis',
            src: Message,
            alt: 'analysis',
            key: 'analysis',
            ownerOnly: true
        },
        {
            title: 'Feedback',
            src: FeedbackIcon,
            alt: 'feedback',
            key: 'feedback',
            ownerOnly: true
        }
        // {
        //     title: 'Problem',
        //     src: Message,
        //     alt: 'problem',
        //     key: 'problem'
        // }

    ].filter((item) => !item.ownerOnly || isOwner)

    return (

        <div className='w-full md:w-[20rem] flex flex-col  mt-[8vh] md:mt-[4vh]'>
            <Text className='flex flex-row justify-start ml-[1.2vw] font-medium text-[14px] gap-3 text-background' type='small'>
                <img src={SettingsIcon} loading='lazy' alt='settings' />
                Settings
            </Text>
            <div className='flex flex-col ml-[1vw] mt-[1vh]'>
                {
                    settingsValues.map((item: SettingsValueType, key: number) => (
                        <button onClick={() => { onSelect(item.key) }} key={key} className={`text-white my-[0.8vh] mx-3 flex flex-row items-center gap-4 justify-start border border-none ${selected === item.key && 'bg-danger'} ${selected !== item.key && 'hover:bg-[#373737]'}  rounded-full  p-2 transition duration-300 ease-in-out`}>
                            <img src={item.src} className='pl-3' loading='lazy' alt={item.alt} />
                            <Text className='text-[14px]' type='small'>{item.title}</Text>
                        </button>
                    ))
                }
            </div>
        </div>

    )
}

export default SettingsSidebar