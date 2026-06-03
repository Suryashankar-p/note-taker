import React, { useState } from "react";
import Header from "../../../components/Header";
import PageLoading from "../../../components/PageLoading";
import useApiCheck from "../../../hooks/useApiCheck";
import SettingsSidebar from "./SideBar";
import Members from "./Members";
import Usage from "./Usage";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Document Translator",
    url: "/ai-studio/doc_translator",
  },
  {
    title: "Settings",
    url: "/ai-studio/doc_translator/settings",
  },
];

const Settings: React.FC = () => {
  const loading = useApiCheck("doc_translator");

  const SettingsComponents: { [key: string]: any } = {
    members: {
      title: "Members",
      component: <Members />,
    },
    usage: {
      title: "Usage Analytics",
      component: <Usage />,
    },
  };

  const [selectedKey, setSelectedKey] = useState<string>("members");
  const [currentElement, setCurrentElement] = useState(
    SettingsComponents["members"]
  );

  const onSelect = (key: string) => {
    const selectedElement = SettingsComponents[key];
    if (selectedElement) {
      setSelectedKey(key);
      setCurrentElement(selectedElement);
    }
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

      {/* Content */}
      <div className="flex flex-1 lg:mt-[5.5vh] mt-[5vh] relative bg-background overflow-y-hidden">
        {/* Sidebar wrapper (gives grey background) */}
        <div className="fixed inset-y-0 left-0 z-40 mt-6 md:w-[15rem] lg:w-[16rem] bg-primary_text md:relative md:block">
          <SettingsSidebar selected={selectedKey} onSelect={onSelect} />
        </div>

        {/* Main content */}
        <div
          className="pl-2 mt-20 xs:mt-16 sm:mt-18 md:mt-8 lg:mt-6 xl:mt-8
                     w-[12rem] sm:w-[24rem] md:w-[30rem] lg:w-[35rem] xl:w-[40rem]
                     flex-1 bg-background overflow-y-hidden relative z-0"
        >
          {currentElement?.component}
        </div>
      </div>
    </div>
  );
};

export default Settings;