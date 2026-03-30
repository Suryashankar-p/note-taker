import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/Header.tsx";
import TransmitterOcrSidebar from "./Sidebar.tsx";
import MasterActivityPage from "./MasterActivityPage.tsx";
import ChildActivityPage from "./ChildActivityPage.tsx";
import MembersPage from "./Member.tsx";
import Usage from "./Usage.tsx";
import ActivitySummaryPage from "./ActivitySummaryPage.tsx";
import MasterActivityDetailPage from "./MasterActivityDetailPage.tsx";
import ChildActivityDetailPage from "./ChildActivityDetailPage.tsx";
import ActivitySummaryChildList from "./ActivitySummaryChildlist.tsx";
import ActivitySummaryDetail from "./ActivitySummaryDetail.tsx";
import ChildActivityTags from "./ChildActivityTags.tsx";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import useApiCheck from "../../hooks/useApiCheck.ts";
import PageLoading from "../../components/PageLoading.tsx";

const TransmitterOcrMain: React.FC = () => {
  const loading = useApiCheck('transmitter_ocr');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [breadCrumbs, setBreadCrumbs] = useState([
    { title: "AI Studio", url: "/ai-studio" },
    { title: "Transmitter OCR", url: "/ai-studio/transmitter_ocr" },
  ]);

  const MAX_TITLE_LENGTH = 20;

  // Derive state from URL
  const currentPage = searchParams.get("page") || "MasterActivity";
  const activityId = searchParams.get("id");
  const parentId = searchParams.get("parent_id");
  
  // Use location state for quick access to activity details if available
  const selectedActivity = location.state?.activity || null;

  // Map detail pages to sidebar items for highlighting
  const sidebarSelectedKey = useMemo(() => {
    switch (currentPage) {
      case "MasterDetail": return "MasterActivity";
      case "ChildDetail":
      case "TagDetail": return "ChildActivity";
      case "SummaryChildList":
      case "SummaryDetail": return "ActivitySummary";
      default: return currentPage;
    }
  }, [currentPage]);

  const truncateTitle = (title: string) => {
    if (!title) return "";
    return title.length > MAX_TITLE_LENGTH ? `${title.substring(0, MAX_TITLE_LENGTH)}...` : title;
  };

  const handleSelectActivity = (activity: any, type: string = "master") => {
    let params = new URLSearchParams();
    
    switch (type) {
      case "master":
        params.set("page", "MasterDetail");
        params.set("id", activity.id);
        break;
      case "child":
        params.set("page", "ChildDetail");
        params.set("id", activity.id);
        params.set("title", activity.title);
        break;
      case "tag_detail":
        params.set("page", "TagDetail");
        params.set("id", activity.id); // tag id
        params.set("parent_id", activity.parent_id || activityId || ""); // child activity id
        params.set("title", activity.title || ""); // child activity title
        break;
      case "summary":
        params.set("page", "SummaryChildList");
        params.set("id", activity.id);
        break;
      case "summary_detail":
        params.set("page", "SummaryDetail");
        params.set("id", activity.id);
        break;
      default:
        params.set("page", "MasterDetail");
        params.set("id", activity.id);
    }

    navigate(`/ai-studio/transmitter_ocr?${params.toString()}`, { state: { activity } });
  };

  const handleSidebarSelect = (page: string) => {
    navigate(`/ai-studio/transmitter_ocr?page=${page}`);
  };

  // Centralized Breadcrumb Logic
  useEffect(() => {
    const baseBreadcrumbs = [
      { title: "AI Studio", url: "/ai-studio" },
      { title: "Transmitter OCR", url: "/ai-studio/transmitter_ocr" },
    ];

    let newBreadCrumbs = [...baseBreadcrumbs];

    if (currentPage === "MasterDetail" && selectedActivity) {
      newBreadCrumbs.push({
        title: truncateTitle(selectedActivity.title),
        url: location.pathname + location.search
      });
    } else if (currentPage === "ChildDetail" && selectedActivity) {
      newBreadCrumbs.push({
        title: truncateTitle(selectedActivity.title),
        url: location.pathname + location.search
      });
    } else if (currentPage === "TagDetail" && selectedActivity) {
      // Child Activity Name -> Tag Number
      newBreadCrumbs.push({
        title: truncateTitle(selectedActivity.title || "Child Activity"),
        url: `/ai-studio/transmitter_ocr?page=ChildDetail&id=${parentId}&title=${encodeURIComponent(selectedActivity.title || "")}`
      });
      newBreadCrumbs.push({
        title: selectedActivity?.tagData?.tag_number || "Tag Details",
        url: location.pathname + location.search
      });
    } else if (currentPage === "SummaryChildList" && selectedActivity) {
      newBreadCrumbs.push({
        title: truncateTitle(selectedActivity.title),
        url: location.pathname + location.search
      });
    } else if (currentPage === "SummaryDetail" && selectedActivity) {
      // Summary -> Activity Detail
      newBreadCrumbs.push({
        title: "Activity Summary",
        url: "/ai-studio/transmitter_ocr?page=ActivitySummary"
      });
      newBreadCrumbs.push({
        title: truncateTitle(selectedActivity.title),
        url: location.pathname + location.search
      });
    } else if (currentPage !== "MasterActivity") {
      // For other sidebar pages, add context if needed
      const pageTitleMap: Record<string, string> = {
        "ChildActivity": "Child Activity",
        "MasterUsage": "Master Usage",
        "ChildUsage": "Child Usage",
        "ActivitySummary": "Activity Summary",
        "members": "Members"
      };
      if (pageTitleMap[currentPage]) {
        newBreadCrumbs[1] = { title: pageTitleMap[currentPage], url: location.pathname + location.search };
      }
    }

    setBreadCrumbs(newBreadCrumbs);
  }, [currentPage, selectedActivity, location.search, parentId]);

  const renderPage = () => {
    switch (currentPage) {
      case "MasterDetail":
        return <MasterActivityDetailPage />;
      case "ChildDetail":
        return (
          <ChildActivityTags
            activityTitle={selectedActivity?.title}
            onSelectTag={(tag: any) => handleSelectActivity({ ...selectedActivity, ...tag, tagData: tag, parent_id: activityId }, "tag_detail")}
            onBack={() => navigate("/ai-studio/transmitter_ocr?page=ChildActivity")}
          />
        );
      case "TagDetail":
        return <ChildActivityDetailPage onBack={() => navigate(-1)} />;
      case "SummaryChildList":
        return (
          <ActivitySummaryChildList 
            onSelectActivity={(activity: any) => handleSelectActivity(activity, "summary_detail")}
            onBack={() => navigate("/ai-studio/transmitter_ocr?page=ActivitySummary")}
          />
        );
      case "SummaryDetail":
        return <ActivitySummaryDetail onBack={() => navigate(-1)} />;
      case "MasterActivity":
        return <MasterActivityPage onSelectActivity={(activity) => handleSelectActivity(activity, "master")} />;
      case "ChildActivity":
        return <ChildActivityPage onSelectActivity={(activity) => handleSelectActivity(activity, "child")} />;
      case "MasterUsage":
        return <Usage usageType="master" />;
      case "ChildUsage":
        return <Usage usageType="child" />;
      case "ActivitySummary":
        return <ActivitySummaryPage onSelectActivity={(activity) => handleSelectActivity(activity, "summary")} />;
      case "members":
        return <MembersPage />;
      default:
        return <MasterActivityPage onSelectActivity={(activity) => handleSelectActivity(activity, "master")} />;
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header breadCrumbs={breadCrumbs} />
      <div className="flex flex-1 mt-4 overflow-hidden">
        <TransmitterOcrSidebar onSelect={handleSidebarSelect} selected={sidebarSelectedKey} />
        <div className="flex-1 overflow-hidden py-6 px-2 ml-3 mr-3 mt-3 flex flex-col">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default TransmitterOcrMain;