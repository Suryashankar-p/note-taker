import React from "react";
import Text from "../../components/Text";

type NavItem = {
  title: string;
  key: string;
};

interface LegalCheckerSidebarProps {
  onSelect: (key: string) => void;
  selected: string;
}

const navItems: NavItem[] = [
  { title: "NDA Review", key: "NDA Review" },
  { title: "BG Review", key: "Bank Guarantee Review" },
  { title: "Admin", key: "Admin" },
];

const LegalCheckerSidebar: React.FC<LegalCheckerSidebarProps> = ({
  onSelect,
  selected,
}) => {
  return (
    <div className="w-1/6 flex flex-col mt-[7vh] h-full bg-neutral-700">
      <div className="flex flex-col ml-[1vw] mt-10">
        {navItems.map(({ title, key }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`text-white my-[0.8vh] mx-3 flex flex-row items-center gap-4 justify-start border-none ${
              selected === key ? "bg-danger" : "hover:bg-[#373737]"
            } rounded-full p-2 transition duration-300 ease-in-out`}
          >
            <Text className="text-[14px] px-3" type="small">
              {title}
            </Text>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LegalCheckerSidebar;
