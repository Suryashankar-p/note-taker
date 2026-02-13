import React from "react";
import { useSelector } from "react-redux";

import Text from "../../../components/Text";
import SettingsIcon from "../../../assets/setting-2.svg";
import Community from "../../../assets/people-group.svg";

import { RootState } from "../../../redux/store";

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
  const memberRole = useSelector((state: RootState) => state.memberRole);

  const translatorMemberDetails =
    memberRole.service === "doc_translator" ? memberRole.details : null;

  // 🔐 RBAC: Only OWNER can see Settings
  if (translatorMemberDetails?.role !== "OWNER") {
    return null;
  }

  const settingsValues: SettingsValueType[] = [
    {
      title: "Members",
      src: Community,
      alt: "members",
      key: "members",
    },
  ];

  return (
    <div className="w-full md:w-[15rem] flex flex-col mt-[8vh] md:mt-[4vh]">
      <Text
        className="flex flex-row justify-start ml-[1.2vw] font-medium text-[14px] gap-3 text-background"
        type="small"
      >
        <img src={SettingsIcon} loading="lazy" alt="settings" />
        Settings
      </Text>

      <div className="flex flex-col mr-[1vw] mt-[1vh]">
        {settingsValues.map((item: SettingsValueType, index: number) => (
          <button
            key={index}
            onClick={() => onSelect(item.key)}
            className={`w-9/10 text-white my-[0.8vh] mx-3 flex flex-row items-center gap-4 justify-start ${
              selected === item.key ? "bg-danger" : "hover:bg-[#373737]"
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