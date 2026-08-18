import { useState, useEffect, useRef } from "react";
import Header from "../../../components/Header";
import useApiCheck from "../../../hooks/useApiCheck";
import { GetMemberTroubleshootingRole } from "../../../services/troubleshooting";
import store, { Dispatch, RootState } from "../../../redux/store";
import PageLoading from "../../../components/PageLoading";
import SettingsSidebar from "./Sidebar";
import Members from "./Members";
import Usage from "./Usage";
import Products from "./Product";
import KnowledgeBase from "./KnowledgeBase";
import Analysis from "./Analysis";
import Feedback from "./Feedback";
import SupportInteractions from "./SupportInteractions";
// import Problem from "./Problem";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Smart Troubleshooting App",
    url: "/ai-studio/troubleshooting",
  },
  {
    title: "Settings",
    url: "/ai-studio/troubleshooting/settings",
  },
];

const Settings = () => {
  const SettingsComponents: { [key: string]: any } = {
    product: {
      title: "Product",
      component: <Products />,
    },
    knowledge_base: {
      title: "Knowledge Base",
      component: <KnowledgeBase />,
    },
    members: {
      title: "Members",
      component: <Members />,
    },
    usage: {
      title: "Usage",
      component: <Usage />,
    },
    analysis: {
      title: "Analysis",
      component: <Analysis />,
    },
    feedback: {
      title: "Feedback",
      component: <Feedback />,
    },
    support_report: {
      title: "Support Report",
      component: <SupportInteractions />,
    },
    // 'problem': {
    //     title: 'Problem',
    //     component: <Problem />
    // }
  };

  const [currentElement, setCurrentElement] = useState(
    SettingsComponents["members"]
  );
  const [selectedKey, setSelectedKey] = useState("members");
  const loading = useApiCheck("troubleshooting");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSection = localStorage.getItem("selectedSettingsSection");
    const initialSection = savedSection || "members";
    setCurrentElement(SettingsComponents[initialSection]);
    setSelectedKey(initialSection);
    getTroubleshootingRole();
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

      <div className="flex flex-1 lg:mt-[5.5vh] mt-[2vh] relative bg-background">
        {/* Sidebar (Hidden by default on mobile, visible on desktop) */}
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-40 mt-6 w-3/4 sm:w-1/2 bg-primary_text transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform overflow-y-auto md:relative md:mt-0 md:inset-y-auto md:translate-x-0 md:w-64 lg:w-72 md:shrink-0 md:block`}
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

        {/* Main Content Area.
            Sized purely by the flex row: fixed widths here used to fight flex-1
            (so the pane never actually filled the screen), and heights above 100vh
            produced a second scrollbar. min-w-0 is what lets wide children —
            the report table, the decision tree — scroll inside instead of
            pushing the layout sideways. */}
        <div
          className="flex-1 min-w-0 pl-2 pt-10 md:pt-4 bg-background overflow-y-auto
                h-[calc(100vh-5.5vh)] relative z-0"
        >
          {/* Burger Button (Only for Mobile). Kept below the drawer's z-40 so it
              does not float on top of the sidebar once that is open. */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-1 left-4 z-30 text-3xl md:hidden"
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

export const getTroubleshootingRole = async () => {
  const response = await GetMemberTroubleshootingRole();
  if (response?.id) {
    (store.dispatch as Dispatch).memberRole.setRole({
      service: "troubleshooting",
      details: response,
    });
  }
};
