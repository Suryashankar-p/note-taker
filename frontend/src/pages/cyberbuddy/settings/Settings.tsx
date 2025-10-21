import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import useApiCheck from "../../../hooks/useApiCheck";
import { GetMemberCyberBuddyRole } from "../../../services/cyberbuddy";
import store, { Dispatch, RootState } from "../../../redux/store";
import PageLoading from "../../../components/PageLoading";
import SettingsSidebar from "./Sidebar";
import Members from "./Members";
import Usage from "./Usage";
import Documents from "./Documents";
import Feedback from "./Feedback";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "CyberBuddy",
    url: "/ai-studio/cyberbuddy",
  },
  {
    title: "Settings",
    url: "/ai-studio/cyberbuddy/settings",
  },
];

const Settings = () => {
  const SettingsComponents: { [key: string]: any } = {
    documents: {
      title: "Documents",
      component: <Documents />,
    },
    feedback: { 
    title: "Feedback",
    component: <Feedback />,
  },
    members: {
      title: "Members",
      component: <Members />,
    },
    usage: {
      title: "Usage",
      component: <Usage />,
    },
  };

  const [currentElement, setCurrentElement] = useState(
    SettingsComponents["documents"]
  );
  const [selectedKey, setSelectedKey] = useState("documents");
  const loading = useApiCheck("cyberbuddy");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSection = localStorage.getItem("selectedSettingsSection");
    const initialSection = SettingsComponents[savedSection]
      ? savedSection
      : "documents";
    setCurrentElement(SettingsComponents[initialSection]);
    setSelectedKey(initialSection);
    getCyberBuddyRole();
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
    setIsSidebarOpen(false);
    setSelectedKey(key);
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

      <div className="flex flex-1 lg:mt-[5.5vh] mt-[5vh] relative bg-background">
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-40 mt-6 md:w-[15rem] lg:w-[16rem] bg-primary_text transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform md:relative md:translate-x-0 md:w-1/4 md:block`}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-12 right-4 text-white text-2xl md:hidden"
          >
            ✖
          </button>

          <SettingsSidebar selected={selectedKey} onSelect={onSelect} />
        </div>
        <div
          className="pl-2 mt-20 xs:mt-16 sm:mt-18 md:mt-8 lg:mt-6 xl:mt-8 
                w-[12rem] sm:w-[24rem] md:w-[30rem] lg:w-[35rem] xl:w-[40rem] 
                flex-1 bg-background overflow-y-auto h-[107.5vh] sm:h-[109vh] md:h-[80vh] lg:h-[85vh] xl:h-[125vh] relative z-0"
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-1 left-4 z-50 text-3xl md:hidden"
          >
            ☰
          </button>
          {currentElement?.component}
        </div>
      </div>
    </div>
  );
};

export default Settings;

export const getCyberBuddyRole = async () => {
  const response = await GetMemberCyberBuddyRole();
  if (response?.id) {
    (store.dispatch as Dispatch).memberRole.setRole({
      service: "cyberbuddy",
      details: response,
    });
  }
};
