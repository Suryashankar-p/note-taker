import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import React, { ReactNode, useEffect, useState } from "react";
import Text from "./Text";
import UserAvatar from "../assets/chat_user.png"; // Path to user avatar image
import LogOut from "../assets/logout.svg";
import { redirectToLogin } from "../services/Axios";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../redux/store";
import { getInitials } from "../utils/functions";

interface DropDownMenuProps {
  content: ReactNode;
  menuItems: any[];
  position?: any;
  onChange?: any;
  profile?: boolean; // Add profile parameter
  disabled?: boolean;
}

const DropDownMenu: React.FC<DropDownMenuProps> = ({
  content,
  menuItems,
  position = "bottom end",
  onChange,
  profile,
  disabled,
}) => {
  const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const [userData, setuserData] = useState(userDetails);
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
    if (userDetails) {
      setuserData(userDetails);
    }
  }, []);

  return (
    <div className="relative">
      <Menu>
        <MenuButton
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
          className={`inline-flex items-center gap-2 rounded-md py-1.5 px-3 focus:outline-none ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
        >
          {content}
        </MenuButton>
        <Transition
          enter="transition ease-out duration-75"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <MenuItems
            anchor={position}
            className={`absolute w-${
              profile ? "68" : "fit"
            } z-100 rounded-xl shadow-custom border border-grey bg-background p-1 text-[14px] text-primary_text data-[focus]:text-black [--anchor-gap:var(--spacing-1)] focus:outline-none`}
          >
            {profile ? ( // Render profile menu items if profile parameter is true
              <>
                <MenuItem>
                  <div className="px-3 py-2 flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600">
                        {userData && getInitials(userData.name)}
                      </span>
                    </div>
                    <div className="ml-3 overflow-hidden">
                      <Text type="small" className="font-bold">
                        {userData?.name}
                      </Text>
                      <Text
                        type="small"
                        className="text-gray-500 max-w-48 text-[11px] block overflow-hidden text-ellipsis whitespace-nowrap"
                        title={userData?.email}
                      >
                        {userData?.email}
                      </Text>
                    </div>
                  </div>
                </MenuItem>
                <hr className="my-1" />
                <MenuItem>
                  <button
                    onClick={redirectToLogin}
                    className="group flex w-full items-center gap-2 justify-center rounded-lg py-1.5 px-3 data-[focus]:bg-[#0061F3] data-[focus]:bg-opacity-10 data-[focus]:text-[#0061F3] hover:bg-red-100"
                  >
                    <img
                      className="w-6 h-6"
                      src={LogOut}
                      loading="lazy"
                      alt="logout"
                    />
                    <Text type="small" className="text-danger">
                      Logout
                    </Text>
                  </button>
                </MenuItem>
              </>
            ) : (
              menuItems?.map((item, index) => (
                <MenuItem key={index}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent parent onClick firing
                      onChange(item?.title);
                    }}
                    className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-[#0061F3] data-[focus]:bg-opacity-10 data-[focus]:text-[#0061F3]"
                  >
                    {item.component}
                    <Text type="small">{item.title}</Text>
                  </button>
                </MenuItem>
              ))
            )}
          </MenuItems>
        </Transition>
      </Menu>
    </div>
  );
};

export default DropDownMenu;
