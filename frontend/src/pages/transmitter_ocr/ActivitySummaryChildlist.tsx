import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Button from "../../components/Button.tsx";
import DropDownButton from "../../components/DropDownButton.tsx";
import Search from "../../assets/search_icon.svg";
import BackIcon from "../../assets/back_arrow.svg";
import Menu from "../../assets/more.svg";
import DropDownMenu from "../../components/DropdownMenu.tsx";
import { getInitials } from "../../utils/functions.ts";
import NoData from "../../assets/no_data.tsx";
import Toast from "../../components/Toast.tsx";
import { TransmitterGetChildActivities } from "../../services/transmitter_ocr.ts";
import { statusMapper, userStatusMapper } from "../../utils/functions.ts";

interface ChildActivity {
  id: number;
  title: string;
  master_title: string;
  master_id: number;
  created_on: string;
  status: string;
  user: {
    name: string;
    user_id: string;
  };
}

interface MasterActivity {
  id: number;
  title: string;
  created_on: string;
  user: {
    name: string;
    user_id: string;
  };
}

const ActivitySummaryChildList: React.FC = () => {
  const { masterId } = useParams<{ masterId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<Dispatch>();
  const activityListRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    name: string;
  }>({ value: "all", name: "All" });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState(false);
  const [childActivities, setChildActivities] = useState<ChildActivity[]>([]);
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [pageError, setPageError] = useState<boolean>(false);
  const [masterActivity, setMasterActivity] = useState<MasterActivity | null>(
    location.state?.activity || null
  );

  const toastStatus = useSelector((state: RootState) => state.toast);

  let timeoutId: NodeJS.Timeout | null = null;

  const statusOptions = [
    { value: "all", name: "All" },
    { value: "inProgress", name: "In progress" },
    { value: "submitted", name: "Submitted" },
    { value: "rejected", name: "Rejected" },
  ];

  const menuItems = [
    {
      title: "View Details",
      component: <span>👁️</span>,
    },
    {
      title: "Delete",
      component: <span>🗑️</span>,
    },
  ];

  useEffect(() => {
    if (masterId) {
      getAllChildActivities(pageSize.skip, pageSize.limit, "", statusFilter.value);
    }
  }, [masterId]);

  useEffect(() => {
    const handleScroll = () => {
      const { current } = activityListRef;
      if (!current) return;

      const scrollPosition = current.scrollTop;

      if (
        current.scrollHeight - current.scrollTop === current.clientHeight &&
        !isFetching &&
        childActivities.length < activityTotal
      ) {
        loadMoreActivities(scrollPosition);
      }
    };

    const div = activityListRef.current;
    if (div) {
      div.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (div) {
        div.removeEventListener("scroll", handleScroll);
      }
    };
  }, [isFetching, childActivities, activityTotal]);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const getAllChildActivities = async (
    skip: number,
    limit: number,
    search_term: string,
    status: string
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetChildActivities(
        skip,
        limit,
        search_term,
        undefined, // user_status
        status !== "all" ? statusMapper(status) : undefined,
        masterId ? parseInt(masterId) : undefined
      );

      if (response?.result) {
        setChildActivities(response.result);
        setActivityTotal(response.total);
      } else {
        console.error("Error fetching child activities");
      }
    } catch (err) {
      console.error("Error fetching child activities", err);
      setPageError(true);
      if (err?.response?.data?.detail) {
        dispatch.toast.openToast({
          status: true,
          message: err?.response?.data?.detail,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreActivities = async (scrollPosition: number) => {
    setIsFetching(true);
    try {
      const response = await TransmitterGetChildActivities(
        pageSize.skip + pageSize.limit,
        pageSize.limit,
        searchValue,
        undefined,
        statusFilter.value !== "all" ? statusMapper(statusFilter.value) : undefined,
        masterId ? parseInt(masterId) : undefined
      );

      if (response?.result) {
        const newActivities = response.result;
        if (newActivities && newActivities.length > 0) {
          setChildActivities((prevActivities) => [
            ...prevActivities,
            ...newActivities,
          ]);
          setActivityTotal(response.total);
          setPageSize((prevPageSize) => ({
            ...prevPageSize,
            skip: prevPageSize.skip + prevPageSize.limit,
          }));

          activityListRef.current?.scrollTo(0, scrollPosition);
        }
      }
    } catch (err) {
      console.error("Error loading more activities", err);
    } finally {
      setIsFetching(false);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    setSearchValue(searchTerm);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      getAllChildActivities(pageSize.skip, pageSize.limit, searchTerm, statusFilter.value);
    }, 500);
  };

  const handleFilter = (value: any) => {
    setStatusFilter(value);
    getAllChildActivities(pageSize.skip, pageSize.limit, searchValue, value.value);
  };

  const handleBack = () => {
    navigate("/ai-studio/transmitter_ocr/activity-summary");
  };

  const handleMenuClick = (item: string, activity: ChildActivity) => {
    console.log(`Menu action: ${item} for activity:`, activity);
    // TODO: Implement menu actions (View Details, Delete)
    if (item === "View Details") {
      // Navigate to child activity detail page
      navigate(`/ai-studio/transmitter_ocr/child-activity/${activity.id}`, {
        state: { activity },
      });
    } else if (item === "Delete") {
      // Handle delete
      console.log("Delete activity:", activity);
    }
  };

  const handleChildActivityClick = (activity: ChildActivity) => {
    // Navigate to child activity detail page
    navigate(`/ai-studio/transmitter_ocr/child-activity/${activity.id}`, {
      state: { activity },
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case "INPROGRESS":
      case "IN_PROGRESS":
        return "border-blue-500 text-blue-700 bg-blue-50";
      case "SUBMITTED":
      case "SUBMITTED_SUCCESS":
        return "border-green-500 text-green-700 bg-green-50";
      case "REJECTED":
        return "border-red-500 text-red-700 bg-red-50";
      case "SUBMITTED_WAITING":
        return "border-yellow-500 text-yellow-700 bg-yellow-50";
      case "SUBMITTED_FAILED":
        return "border-orange-500 text-orange-700 bg-orange-50";
      default:
        return "border-gray-500 text-gray-700 bg-gray-50";
    }
  };

  const getStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      IN_PROGRESS: "INPROGRESS",
      INPROGRESS: "INPROGRESS",
      SUBMITTED: "SUBMITTED",
      SUBMITTED_SUCCESS: "SUBMITTED",
      REJECTED: "REJECTED",
      SUBMITTED_WAITING: "WAITING",
      SUBMITTED_FAILED: "FAILED",
    };
    return statusMap[status.toUpperCase()] || status;
  };

  return (
    <div className="flex flex-1 h-screen">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 p-6 h-full">
        <div className="flex justify-between items-center mt-1.5 mb-6 w-full">
          <div className="flex items-center">
            <Button
              onClick={handleBack}
              custom_type="secondary"
              className="mr-4 p-2 rounded-lg"
              size="custom"
            >
              <img src={BackIcon} alt="back" loading="lazy" className="w-5 h-5" />
            </Button>
            <div className="flex flex-col">
              <Text className="text-2xl font-bold" type="header2">
                Activity Summary / {masterActivity?.title || "Loading..."}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative flex items-center">
              <Text className="mr-2" type="small">
                Status:
              </Text>
              <DropDownButton
                className="w-36"
                listValues={statusOptions}
                value={statusFilter}
                onChange={handleFilter}
              />
            </div>

            <Input
              prefixIcon={<img src={Search} alt="search" loading="lazy" />}
              placeholder="Search"
              fixed_size="large"
              onChange={onSearchChange}
              value={searchValue}
            />
          </div>
        </div>

        {/* Child Activities List */}
        <div
          ref={activityListRef}
          className="flex-1 h-[calc(100vh-220px)] pr-4 overflow-y-auto"
        >
          {isLoading && childActivities.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
            </div>
          ) : childActivities.length > 0 ? (
            <div className="space-y-4">
              {childActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-2 border-blue-400 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleChildActivityClick(activity)}
                >
                  <div className="flex items-center flex-1">
                    <div
                      title={activity.user.name}
                      className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center font-medium text-sm"
                    >
                      {getInitials(activity.user.name)}
                    </div>
                    <div className="flex flex-col ml-4">
                      <Text type="body" className="font-semibold text-base">
                        {activity.title}
                      </Text>
                      <Text className="text-[#505F79] text-xs">
                        Master: {activity.master_title}
                      </Text>
                      <Text className="text-[#505F79] text-xs">
                        Created On:{" "}
                        {new Date(activity.created_on).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div
                      className={`border-2 rounded-lg px-6 py-2 font-medium ${getStatusColor(
                        activity.status
                      )}`}
                    >
                      {getStatusLabel(activity.status)}
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                      <DropDownMenu
                        onChange={(item: string) =>
                          handleMenuClick(item, activity)
                        }
                        content={
                          <img
                            className="w-8 h-8 cursor-pointer"
                            src={Menu}
                            alt="menu"
                            loading="lazy"
                          />
                        }
                        menuItems={menuItems}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <NoData />
              <Text
                type="header3"
                className="mt-6 text-gray-700 font-semibold text-2xl"
              >
                No Results Found
              </Text>
              <Text type="body" className="mt-2 text-gray-500">
                No child activities found for this master
              </Text>
            </div>
          )}

          {isFetching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-danger"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivitySummaryChildList;