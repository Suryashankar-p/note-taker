// thermax-ai-studio/frontend/src/pages/transmitter_ocr/TransmitterOcrMain.tsx
import React, { useState, useEffect } from "react";
import Header from "../../components/Header.tsx";
import TransmitterOcrSidebar from "./Sidebar.tsx";
import MasterActivityPage from "./MasterActivityPage.tsx";
import ChildActivityPage from "./ChildActivityPage.tsx";
import MembersPage from "./Member.tsx";
import Usage from "./Usage.tsx";
import ActivitySummaryPage from "./ActivitySummaryPage.tsx";
import MasterActivityDetailPage from "./MasterActivityDetailPage.tsx";
import ChildActivityDetailPage from "./ChildActivityDetailPage.tsx";
import { useNavigate } from "react-router-dom";
import useApiCheck from "../../hooks/useApiCheck.ts";
import PageLoading from "../../components/PageLoading.tsx";

const TransmitterOcrMain: React.FC = () => {
  const loading = useApiCheck('transmitter_ocr');
  const [currentPage, setCurrentPage] = useState<string>("MasterActivity");
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [selectedActivityType, setSelectedActivityType] = useState<string>("master"); // "master" or "child"
  const [breadCrumbs, setBreadCrumbs] = useState([
    {
      title: "AI Studio",
      url: "/ai-studio",
    },
    {
      title: "Transmitter OCR",
      url: "/ai-studio/transmitter_ocr",
    },
  ]);
  const MAX_TITLE_LENGTH = 20;
  const navigate = useNavigate();
  
  const handleSelectActivity = (activity: any, type: string = "master") => {
    setSelectedActivity(activity);
    setSelectedActivityType(type);
    if (activity) {
      const activityUrl = `/ai-studio/transmitter_ocr?activity_id=${activity.id}`;
      navigate(activityUrl, { replace: true, state: { activity, type } });
      setBreadCrumbs((prev) => [
        ...prev,
        {
          title: activity?.title?.length > MAX_TITLE_LENGTH 
                 ? `${activity.title.substring(0, MAX_TITLE_LENGTH)}...` 
                 : `${activity.title}`,
          url: activityUrl,
        },
      ]);
    }
  };
  
  const handleSidebarSelect = (page: string) => {
    setSelectedActivity(null);
    setCurrentPage(page);
    let pageUrl: string;
    switch (page) {
      case "MasterActivity":
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
      case "ChildActivity":
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
      case "MasterUsage":
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
      case "ChildUsage":
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
      case "ActivitySummary":
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
      case "members":
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
      default:
        pageUrl = "/ai-studio/transmitter_ocr";
        break;
    }
    navigate(pageUrl);
    setBreadCrumbs([
      {
        title: "AI Studio",
        url: "/ai-studio",
      },
      {
        title: "Transmitter OCR",
        url: pageUrl,
      },
    ]);
  };
  
  const renderPage = () => {
    if (selectedActivity) {
      if (selectedActivityType === "master") {
        return <MasterActivityDetailPage />;
      } else {
        return <ChildActivityDetailPage />;
      }
    }
    switch (currentPage) {
      case "MasterActivity":
        return <MasterActivityPage onSelectActivity={(activity) => handleSelectActivity(activity, "master")} />;
      case "ChildActivity":
        return <ChildActivityPage onSelectActivity={(activity) => handleSelectActivity(activity, "child")} />;
      case "MasterUsage":
        return <Usage usageType="master" />;
      case "ChildUsage":
        return <Usage usageType="child" />;
      case "ActivitySummary":
        return <ActivitySummaryPage />;
      case "members":
        return <MembersPage />;
      default:
        return <MasterActivityPage onSelectActivity={(activity) => handleSelectActivity(activity, "master")} />;
    }
  };
  
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath.includes("members")) {
      setCurrentPage("members");
    } else if (currentPath.includes("MasterUsage")) {
      setCurrentPage("MasterUsage");
    } else if (currentPath.includes("ChildUsage")) {
      setCurrentPage("ChildUsage");
    } else if (currentPath.includes("ActivitySummary")) {
      setCurrentPage("ActivitySummary");
    } else {
      setCurrentPage("MasterActivity");
    }
    
    // Check if we have activity data in location state
    const locationState = window.history.state;
    if (locationState?.activity) {
      setSelectedActivity(locationState.activity);
      setSelectedActivityType(locationState.type || "master");
    }
  }, []);
  
  if (loading) {
    return <PageLoading />;
  }
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 mt-4 overflow-hidden">
        <TransmitterOcrSidebar onSelect={handleSidebarSelect} selected={currentPage} />
        <div className="flex-1 overflow-hidden py-6 px-2 ml-3 mr-3 mt-3 flex flex-col">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default TransmitterOcrMain;