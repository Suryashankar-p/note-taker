import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import SettingsSidebar from "./Sidebar";
import Products from "./Products";
import Members from "./Members";
// import Faq from "./Faq"
import Faq from "./Faq";

import useApiCheck from "../../../hooks/useApiCheck";
import { GetMemberDoctorConbotRole } from "../../../services/doctor_conbot";
import store, { Dispatch, RootState } from "../../../redux/store";
import Usage from "./Usage";
import PageLoading from "../../../components/PageLoading";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Dr. ConBot.",
    url: "/ai-studio/doctor_conbot",
  },
  {
    title: "Settings",
    url: "/ai-studio/doctor_conbot/settings",
  },
];

const Settings = () => {
  const SettingsComponents: { [key: string]: any } = {
    knowledge: {
      title: "Knowledge",
      component: <Products />,
    },
    members: {
      title: "Members",
      component: <Members />,
    },
    faq: {
      title: "Faq",
      component: <Faq />,
    },
    // 'feedback': {
    //     title: 'Feedback',
    //     component: <Feedback />
    // },
    usage: {
      title: "Usage",
      component: <Usage />,
    },
  };

  const [currentElement, setCurrentElement] = useState(
    SettingsComponents["knowledge"]
  );
  const [selectedKey, setSelectedKey] = useState("knowledge");
  const loading = useApiCheck("doctor_conbot");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Retrieve the selected section from local storage if it exists
    const savedSection = localStorage.getItem("selectedSettingsSection");
    const initialSection = savedSection || "knowledge";
    setCurrentElement(SettingsComponents[initialSection]);
    setSelectedKey(initialSection);
    getDoctorConbotRole();
    return () => {
      localStorage.removeItem("selectedSettingsSection");
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const onSelect = (key: string) => {
    const selectedElement = SettingsComponents[key];
    setCurrentElement(selectedElement);
    setSelectedKey(key);
    // Save the selected section to local storage
    localStorage.setItem("selectedSettingsSection", key);
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="fixed w-full z-50">
        <Header breadCrumbs={breadCrumbs} />
      </div>

      <div className="flex flex-1 lg:mt-[5.5vh] mt-[2vh] relative bg-background">
        {/* Sidebar (Hidden by default on mobile, visible on desktop) */}
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-40 mt-6 w-3/4 md:w-[20rem] lg:w-[20rem] bg-primary_text transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform md:relative md:translate-x-0 md:w-1/4 md:block`}
        >
          {/* Close Button (Mobile Only) */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-12 right-4 text-white text-2xl md:hidden"
          >
            ✖
          </button>

          <SettingsSidebar selected={selectedKey} onSelect={onSelect} />
        </div>

        {/* Main Content Area */}
        <div className="pl-2 mt-12 sm:mt-10 md:mt-8 lg:mt-6 xl:mt-8 
                w-[12rem] sm:w-[24rem] md:w-[30rem] lg:w-[35rem] xl:w-[40rem] 
                flex-1 bg-background overflow-y-auto h-[107.5vh] sm:h-[109vh] md:h-[80vh] lg:h-[85vh] xl:h-[125vh] relative z-0">
  {/* Burger Button (Only for Mobile) */}
  <button
    onClick={() => setIsSidebarOpen(true)}
    className="absolute top-1 left-4 z-50 text-3xl md:hidden"
  >
    ☰
  </button>

  {currentElement.component}
</div>

      </div>
    </div>
  );
};

export default Settings;

export const getDoctorConbotRole = async () => {
  const response = await GetMemberDoctorConbotRole();
  if (response?.id) {
    (store.dispatch as Dispatch).memberRole.setRole({
      service: "doctor_conbot",
      details: response,
    });
  }
};
