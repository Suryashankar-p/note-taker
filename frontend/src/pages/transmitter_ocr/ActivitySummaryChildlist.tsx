import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Button from "../../components/Button.tsx";
import Search from "../../assets/search_icon.svg";
import {
  getInitials,
  getBorderColor,
  statusMapper,
} from "../../utils/functions.ts";
import NoData from "../../assets/no_data.tsx";
import Toast from "../../components/Toast.tsx";
import PageLoading from "../../components/PageLoading.tsx";
import { TransmitterGetMasterChildActivities } from "../../services/transmitter_ocr.ts";

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

interface ActivitySummaryChildListProps {
  onSelectActivity?: (activity: any) => void;
  onBack?: () => void;
}

const ActivitySummaryChildList: React.FC<ActivitySummaryChildListProps> = ({ onSelectActivity, onBack }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Prefer location state activity, then fallback to activityId from URL
  const [masterActivity, setMasterActivity] = useState<MasterActivity | null>(
    location.state?.activity || null
  );

  const masterId = masterActivity?.id?.toString() || searchParams.get("id");

  const dispatch = useDispatch<Dispatch>();
  const activityListRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState(false);
  const [childActivities, setChildActivities] = useState<ChildActivity[]>([]);
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [pageError, setPageError] = useState<boolean>(false);

  const toastStatus = useSelector((state: RootState) => state.toast);

  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (masterId) {
      getAllChildActivities(pageSize.skip, pageSize.limit, "");
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
    search_term: string
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetMasterChildActivities(
        masterId ? parseInt(masterId) : 0,
        skip,
        limit,
        search_term,
        undefined,
        undefined // user_status
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
      const response = await TransmitterGetMasterChildActivities(
        masterId ? parseInt(masterId) : 0,
        pageSize.skip + pageSize.limit,
        pageSize.limit,
        searchValue,
        undefined,
        undefined
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
      getAllChildActivities(pageSize.skip, pageSize.limit, searchTerm);
    }, 500);
  };

  const handleChildActivityClick = (activity: ChildActivity) => {
    if (onSelectActivity) {
      onSelectActivity(activity);
    } else {
      // Navigate to child activity detail page
      navigate(`/ai-studio/transmitter_ocr?page=SummaryDetail&id=${activity.id}`, {
        state: { activity },
      });
    }
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
            {/* Back Button */}
            {onBack && (
              <button
                onClick={onBack}
                className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <div className="flex flex-col">
              <Text className="text-2xl font-bold" type="header2">
                Activity Summary / {masterActivity?.title || "Loading..."}
              </Text>
            </div>
          </div>

          <div className="flex items-center space-x-4">
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
            <PageLoading />
          ) : childActivities.length > 0 ? (
            <div className="space-y-4">
              {childActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
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
                      <Text type="body" className="font-bold text-lg text-primary_text">
                        {activity.title}
                      </Text>
                      <Text className="text-[#505F79] text-xs mt-1">
                        Created on:{" "}
                        {new Date(activity.created_on).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>

                  <div className="flex items-center relative gap-8 pr-4">
                    <Text
                      type="body"
                      className={`border rounded-lg w-32 text-center h-12 p-3 text-primary_text ${getBorderColor(
                        activity?.status
                      )}`}
                    >
                      {activity?.status && statusMapper(activity.status)}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full">
              <NoData />
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