import React, { useState } from "react";
import Text from "../../components/Text";
import SettingsIcon from "../../assets/setting-2.svg";
import DashboardIcon from "../../assets/grid.svg";
import RecordingsIcon from "../../assets/mic.svg";

type SettingsValueType = {
    title: string;
    src: any;
    alt: string;
    key: string;
};

interface SettingsSidebarProps {
    onSelect: (title: string) => void;
    selected: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
    onSelect,
    selected,
}) => {
    const settingsValues: SettingsValueType[] = [
        {
            title: "Dashboard",
            src: DashboardIcon,
            alt: "dashboard",
            key: "dashboard",
        },
        {
            title: 'Recordings',
            src: RecordingsIcon,
            alt: 'Recordings',
            key: 'Recordings'
        },
        {
            title: "Settings",
            src: SettingsIcon,
            alt: "settings",
            key: "settings",
        },
    ];

    return (
        <div className="w-full md:w-[20rem] flex flex-col mt-[8vh] md:mt-[4vh]">
            <div className="flex flex-col ml-[1vw] mt-[1vh]">
                {settingsValues.map((item: SettingsValueType, key: number) => (
                    <button
                        onClick={() => {
                            onSelect(item.key);
                        }}
                        key={key}
                        className={`text-white my-[0.8vh] mx-3 flex flex-row items-center gap-4 justify-start border border-none ${selected === item.key && "bg-danger"
                            } ${selected !== item.key && "hover:bg-[#373737]"
                            } rounded-full p-2 transition duration-300 ease-in-out`}
                    >
                        <img
                            src={item.src}
                            className="pl-3"
                            loading="lazy"
                            alt={item.alt}
                        />
                        <Text className="text-[14px]" type="small">
                            {item.title}
                        </Text>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SettingsSidebar;
