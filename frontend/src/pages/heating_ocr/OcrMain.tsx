import { useState, useEffect } from "react";
import Header from "../../components/Header";
import OcrSidebar from "./Sidebar";
import Activity from "./ActivityPage";
import MembersPage from "./Member";
import Usage from "./Usage";
import ActivityDetailPage from "./ActivityDetailPage";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useOCRApiCheck from "../../hooks/useOCRApiCheck.ts";
import PageLoading from "../../components/PageLoading.tsx";
import BaanTable from "./BAANTable.tsx";
import useApiCheck from "../../hooks/useApiCheck.ts";
import GroupsListPage from "./GroupsListPage";

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
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const handleSelectActivity = (activity: any) => {
    setSelectedActivity(activity);
    if (activity) {
      const activityUrl = `/ai-studio/heating_ocr?activity_id=${activity.id}`;
      if (activity?.template === "Plate") {
        setCurrentPage("groupListing");
        navigate(activityUrl, { state: { activity } });
      } else {
        setCurrentPage("activityDetail");
        navigate(activityUrl, { replace: true, state: { activity } });
      }
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
    // IMPORTANT: Clear selected activity FIRST before changing page
    setSelectedActivity(null);
    setCurrentPage(page);
    
    // Navigate with null state to clear any previous activity state
    navigate("/ai-studio/heating_ocr", { replace: true, state: null });
    
    setBreadCrumbs([
      {
        title: "AI Studio",
        url: "/ai-studio",
      },
      {
        title: "Heating OCR",
        url: "/ai-studio/heating_ocr",
      },
    ]);
  };

  const renderPage = () => {
    const view = searchParams.get("view");
    const activityId = searchParams.get("activity_id");
    
    // Check if we're viewing a specific group's activity detail
    if (view === "group" && location.state?.isGroupView && location.state?.group) {
      return <ActivityDetailPage />;
    }

    // IMPORTANT: Only show activity-related pages if we have BOTH selectedActivity AND activityId
    // AND the current page is related to activities (not members/usage)
    if (selectedActivity && activityId && (currentPage === "groupListing" || currentPage === "activityDetail")) {
      if (selectedActivity?.template === "Plate") {
        return <GroupsListPage />;
      }
      return <ActivityDetailPage />;
    }

    // Render based on currentPage state (for sidebar navigation)
    switch (currentPage) {
      case "Activity":
        return <Activity onSelectActivity={handleSelectActivity} />;
      case "members":
        return <MembersPage />;
      case "usage":
        return <Usage />;
      case "baan":
        return <BaanTable />;
      case "groupListing":
        if (selectedActivity) {
          return <GroupsListPage />;
        }
        return <Activity onSelectActivity={handleSelectActivity} />;
      default:
        return <Activity onSelectActivity={handleSelectActivity} />;
    }
  };

  useEffect(() => {
    const activityId = searchParams.get("activity_id");
    const view = searchParams.get("view");

    // If no activity_id in URL, ensure we're showing the correct page based on currentPage
    // and clear selectedActivity
    if (!activityId) {
      setSelectedActivity(null);
      // Don't override currentPage here - let handleSidebarSelect control it
      return;
    }

    // Check if viewing a specific group
    if (view === "group" && location.state?.isGroupView && location.state?.group) {
      setCurrentPage("activityDetail");
      setSelectedActivity(location.state?.activity);
    } else if (activityId && location.state?.activity?.template === "Plate") {
      setCurrentPage("groupListing");
      setSelectedActivity(location.state?.activity);
    } else if (activityId && location.state?.activity) {
      setCurrentPage("activityDetail");
      setSelectedActivity(location.state?.activity);
    }
  }, [location.pathname, location.search]); // Only depend on URL changes, not full location object

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
