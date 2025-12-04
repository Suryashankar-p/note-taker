import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import OcrSidebar from "./Sidebar";
import Activity from "./ActivityPage";
import MembersPage from "./Member";
import Usage from "./Usage";
import ActivityDetailPage from "./ActivityDetailPage";
import { useNavigate } from "react-router-dom";
import useOCRApiCheck from "../../hooks/useOCRApiCheck.ts";
import PageLoading from "../../components/PageLoading.tsx";
import BaanTable from "./BAANTable.tsx";
import useApiCheck from "../../hooks/useApiCheck.ts";

const ActivityMain: React.FC = () => {
  const loading = useApiCheck('heating_ocr');
  const [currentPage, setCurrentPage] = useState<string>("Activity");
  const [selectedActivity, setSelectedActivity] = useState<any | null>(null);
  const [breadCrumbs, setBreadCrumbs] = useState([
    {
      title: "AI Studio",
      url: "/ai-studio",
    },
    {
      title: "Heating OCR",
      url: "/ai-studio/heating_ocr",
    },
  ]);
  const MAX_TITLE_LENGTH = 20;
  const navigate = useNavigate();

  const handleSelectActivity = (activity: any) => {
    setSelectedActivity(activity);
    if (activity) {
      const activityUrl = `/ai-studio/heating_ocr?activity_id=${activity.id}`;
      navigate(activityUrl, { replace: true, state: { activity } });
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
      case "Activity":
        pageUrl = "/ai-studio/heating_ocr";
        break;
      case "members":
        pageUrl = "/ai-studio/heating_ocr";
        break;
      case "usage":
        pageUrl = "/ai-studio/heating_ocr";
        break;
      default:
        pageUrl = "/ai-studio/heating_ocr";
        break;
    }

    navigate(pageUrl);
    setBreadCrumbs([
      {
        title: "AI Studio",
        url: "/ai-studio",
      },
      {
        title: "Heating OCR",
        url: pageUrl,
      },
    ]);
  };

  const renderPage = () => {
    if (selectedActivity) {
      return <ActivityDetailPage  />;
    }

    switch (currentPage) {
      case "Activity":
        return <Activity onSelectActivity={handleSelectActivity} />;
      case "members":
        return <MembersPage />;
      case "usage":
        return <Usage />;
      case "baan":
        return <BaanTable />;
      default:
        return <Activity onSelectActivity={handleSelectActivity} />;
    }
  };

  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath.includes("members")) {
      setCurrentPage("members");
    } else if (currentPath.includes("usage")) {
      setCurrentPage("usage");
    } else {
      setCurrentPage("Activity");
    }
  }, []);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 mt-4 overflow-hidden">
        <OcrSidebar onSelect={handleSidebarSelect} selected={currentPage} />
        <div className="flex-1 overflow-hidden py-6 px-2 ml-3 mr-3 mt-3 flex flex-col">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default ActivityMain;
