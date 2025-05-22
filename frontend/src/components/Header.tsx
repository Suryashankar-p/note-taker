import React, { useEffect, useState } from "react";
import logo from "../assets/logo2.png";
import Text from "./Text";
import DropDownMenu from "./DropdownMenu";
import LogOut from "../assets/logout.svg";
import { redirectToLogin } from "../services/Axios";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../redux/store";
import { GetUserDetails } from "../services/common.ts";
import { useLocalStorageListener } from "../hooks/useLocalStorage.ts";
// Assuming you have the Avatar component as a separate file or component

type breadCrumbs = {
  title: string;
  url: string;
};

interface InputProps {
  breadCrumbs?: breadCrumbs[];
}

const Header: React.FC<InputProps> = ({ breadCrumbs }) => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const baseUrl = "/genaistudio";
  useLocalStorageListener("user", (newValue, oldValue) => {
    getUserInfo();
  });
  const dispatch = useDispatch<Dispatch>();

  useEffect(() => {
    if (Object.keys(userData).length < 1) {
      getUserInfo();
    }
  }, []);

  let userDetails = userData;

  const getUserInfo = async () => {
    try {
      const user = await GetUserDetails();
      if (user?.id) {
        // dispatch.userDetails.setUser(user)
        localStorage.setItem("user", JSON.stringify(user));
        userDetails = user;
      }
    } catch (err) {
      console.log(err, "err");
    }
  };

  const profileItem = [
    {
      title: "Logout",
      component: (
        <img className="w-4 h-4" src={LogOut} loading="lazy" alt="logout" />
      ),
    },
  ];

  const onProfileClick = (item: string) => {
    if (item === "Logout") {
      dispatch.userDetails.clearUser("", "");
      redirectToLogin();
    }
  };

  const Avatar = () => {
    const getInitials = (name: string) => {
      const nameParts = name?.trim().split(" ");
      const initials = nameParts
        ?.slice(0, 2)
        .map((part) => part.charAt(0))
        .join("");
      return initials?.toUpperCase();
    };

    return (
      <div className="relative flex items-center justify-center mr-3">
        {/* Green dot for online status */}
        <div className="absolute -bottom-1 right-0 border-2 border-white w-3 h-3 bg-green-500 rounded-full"></div>

        {/* User initials */}
        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
          <span className="text-background">
            {userDetails && getInitials(userDetails?.name)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-md z-[100] w-full fixed h-16">
      <div className="w-full max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex absolute top-[1vh] left-[3vw] md:left-[5vw]">
          <img loading="lazy" src={logo} alt="Logo" className="h-10 mr-2" />
        </div>
  
        {/* Breadcrumb Navigation */}
        <nav className="hidden md:block absolute top-[3vh] left-[14vw] md:left-[18vw] lg:left-[20vw]">
          <ol className="flex items-center space-x-2">
            {breadCrumbs &&
              breadCrumbs.map((item: any, key: number) => (
                <React.Fragment key={key}>
                  <li>
                    <a
                      href={baseUrl + item.url}
                      className={`text-${
                        key < breadCrumbs?.length - 1 ? "gray-600" : "link_text"
                      } hover:text-gray-800`}
                    >
                      <Text type="body">{item.title}</Text>
                    </a>
                  </li>
                  {key < breadCrumbs?.length - 1 && <li>/</li>}
                </React.Fragment>
              ))}
          </ol>
        </nav>
  
        {/* Profile Dropdown */}
        <div className="flex items-center absolute top-[1vh] right-[0vw] md:right-[1vw]">
          <span className="mr-1 text-gray-700">
            <DropDownMenu
              profile={true}
              onChange={onProfileClick}
              menuItems={profileItem}
              content={<Avatar />}
            />
          </span>
        </div>
      </div>
    </header>
  );
  
};

export default Header;
