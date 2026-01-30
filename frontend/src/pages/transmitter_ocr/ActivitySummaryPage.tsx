import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Text from "../../components/Text.tsx";
import Input from "../../components/Input.tsx";
import Search from "../../assets/search_icon.svg";
import { getInitials } from "../../utils/functions.ts";
import NoData from "../../assets/no_data.tsx";
import Toast from "../../components/Toast.tsx";
import { TransmitterGetMasterActivities } from "../../services/transmitter_ocr.ts";

interface MasterActivity {
  id: number;
  title: string;
  created_on: string;
  user: {
    name: string;
    user_id: string;
  };
}

const ActivitySummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const activityListRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState(false);
  const [masterActivities, setMasterActivities] = useState<MasterActivity[]>([]);
  const [activityTotal, setActivityTotal] = useState<number>(0);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 50 });
  const [pageError, setPageError] = useState<boolean>(false);
  const toastStatus = useSelector((state: RootState) => state.toast);

  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    getAllMasterActivities(pageSize.skip, pageSize.limit, "");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const { current } = activityListRef;
      if (!current) return;

      const scrollPosition = current.scrollTop;

      if (
        current.scrollHeight - current.scrollTop === current.clientHeight &&
        !isFetching &&
        masterActivities.length < activityTotal
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
  }, [isFetching, masterActivities, activityTotal]);

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const getAllMasterActivities = async (
    skip: number,
    limit: number,
    search_term: string
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetMasterActivities(
        skip,
        limit,
        search_term,
        null,
        null
      );
      if (response?.result) {
        setMasterActivities(response.result);
        setActivityTotal(response.total);
      } else {
        console.error("Error fetching master activities");
      }
    } catch (err) {
      console.error("Error fetching master activities", err);
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
      const response = await TransmitterGetMasterActivities(
        pageSize.skip + pageSize.limit,
        pageSize.limit,
        searchValue,
        null,
        null
      );
      if (response?.result) {
        const newActivities = response.result;
        if (newActivities && newActivities.length > 0) {
          setMasterActivities((prevActivities) => [
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
      getAllMasterActivities(pageSize.skip, pageSize.limit, searchTerm);
    }, 500);
  };

  const handleMasterClick = (activity: MasterActivity) => {
    navigate(`/ai-studio/transmitter_ocr/activity-summary/${activity.id}`, {
      state: { activity },
    });
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
        <div className="flex justify-between items-center mt-1.5 mb-4 w-full">
          <div className="flex flex-col">
            <Text className="text-2xl -mt-1 font-bold" type="header2">
              Activity Summary
            </Text>
          </div>

          <div className="flex items-center">
            <Input
              prefixIcon={<img src={Search} alt="search" loading="lazy" />}
              placeholder="Search"
              fixed_size="large"
              onChange={onSearchChange}
              value={searchValue}
            />
          </div>
        </div>

        {/* Master Activities Section */}
        <div className="mt-6 mb-4">
          <Text className="text-xl font-semibold" type="header3">
            Master Activities
          </Text>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 border-b-2 border-gray-200 py-3 px-4 rounded-t-lg">
          <div className="grid grid-cols-2 gap-4">
            <Text
              type="small"
              className="font-semibold text-gray-600 uppercase"
            >
              MASTER ACTIVITY
            </Text>
            <Text
              type="small"
              className="font-semibold text-gray-600 uppercase text-right"
            >
              CREATED ON
            </Text>
          </div>
        </div>

        {/* Activities List */}
        <div
          ref={activityListRef}
          className="flex-1 h-[calc(100vh-300px)] overflow-y-auto border-l border-r border-b border-gray-200 rounded-b-lg"
        >
          {isLoading && masterActivities.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-danger"></div>
            </div>
          ) : masterActivities.length > 0 ? (
            masterActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={`py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  index !== masterActivities.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
                onClick={() => handleMasterClick(activity)}
              >
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center">
                    <div
                      title={activity?.user?.name}
                      className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-medium text-sm"
                    >
                      {getInitials(activity?.user?.name)}
                    </div>
                    <Text type="body" className="ml-3 font-medium">
                      {activity.title}
                    </Text>
                  </div>
                  <div className="text-right">
                    <Text type="body" className="text-gray-600">
                      {new Date(activity.created_on).toLocaleDateString(
                        "en-US",
                        {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </Text>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center h-full">
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

export default ActivitySummaryPage;