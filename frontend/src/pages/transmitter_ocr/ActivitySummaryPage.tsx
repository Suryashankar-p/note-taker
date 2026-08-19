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
import PageLoading from "../../components/PageLoading.tsx";
import {
  TransmitterGetMasterActivities,
  TransmitterGetYearTagsCount,
  TransmitterGetProcessedYears
} from "../../services/transmitter_ocr.ts";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { months } from "../../utils/constants.ts";

interface MasterActivity {
  id: number;
  title: string;
  created_on: string;
  template?: string;
  template_name?: string;
  user: {
    name: string;
    user_id: string;
  };
}

interface ActivitySummaryPageProps {
  onSelectActivity?: (activity: MasterActivity) => void;
}

interface YearButtonProps {
  processedYears: number[];
  yearIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

const YearButton: React.FC<YearButtonProps> = ({ processedYears, yearIndex, onPrev, onNext }) => {
  return (
    <div className="flex items-center gap-4 bg-transparent">
      <button
        type="button"
        disabled={yearIndex === processedYears.length - 1}
        className={`w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded font-semibold text-lg transition duration-300 ${yearIndex === processedYears.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        onClick={onPrev}
      >
        &lt;
      </button>
      <span className="w-16 text-center font-bold text-lg text-gray-800">
        {processedYears[yearIndex]}
      </span>
      <button
        type="button"
        disabled={yearIndex === 0}
        className={`w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded font-semibold text-lg transition duration-300 ${yearIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        onClick={onNext}
      >
        &gt;
      </button>
    </div>
  );
};

const ActivitySummaryPage: React.FC<ActivitySummaryPageProps> = ({ onSelectActivity }) => {
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

  const [activeTab, setActiveTab] = useState<'master_activities' | 'analytics'>('master_activities');
  const [filterOptions, setFilterOptions] = useState<string[]>(['All']);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [tagsData, setTagsData] = useState<any>(null);
  const [processedYears, setProcessedYears] = useState<number[]>([new Date().getFullYear()]);
  const [yearIndex, setYearIndex] = useState<number>(0);
  const [isTagsLoading, setIsTagsLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await TransmitterGetProcessedYears();
        if (response && response.length > 0) {
          setProcessedYears(response);
          setYearIndex(0);
        } else {
          setProcessedYears([new Date().getFullYear()]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadYears();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && processedYears.length > 0) {
      fetchTags(processedYears[yearIndex]);
    }
  }, [activeTab, yearIndex, processedYears]);

  const fetchTags = async (year: number) => {
    setIsTagsLoading(true);
    try {
      const res = await TransmitterGetYearTagsCount(year);
      if (res) setTagsData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTagsLoading(false);
    }
  };

  const getFilteredActivities = () => {
    if (selectedFilter === 'All') return masterActivities;

    const target = selectedFilter.toLowerCase();
    return masterActivities.filter((activity) => {
      const title = (activity.title || '').toLowerCase();
      const template = (activity.template || '').toLowerCase();
      const templateName = (activity.template_name || '').toLowerCase();

      if (selectedFilter === 'Gauges Bourdon') {
        return (
          title.includes('gauges') ||
          title.includes('bourdon') ||
          template.includes('gauges') ||
          template.includes('bourdon') ||
          templateName.includes('gauges') ||
          templateName.includes('bourdon')
        );
      }

      if (target === 'general') {
        return (
          (!template && !templateName) ||
          template.includes('general') ||
          templateName.includes('general')
        );
      }

      return title.includes(target) || template.includes(target) || templateName.includes(target);
    });
  };

  const handlePrevYear = () => {
    if (yearIndex < processedYears.length - 1) {
      setYearIndex(yearIndex + 1);
    }
  };

  const handleNextYear = () => {
    if (yearIndex > 0) {
      setYearIndex(yearIndex - 1);
    }
  };

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
    search_term: string,
    filter: string = selectedFilter
  ) => {
    setIsLoading(true);
    try {
      const response = await TransmitterGetMasterActivities(
        skip,
        limit,
        search_term,
        null,
        null,
        filter
      );
      if (response?.result) {
        setMasterActivities(response.result);
        setActivityTotal(response.total);

        // Dynamically extract unique template names returned in the API response
        const apiTemplates: string[] = response.result
          .map((act: MasterActivity) => act.template || act.template_name || "General")
          .filter((t: string | undefined): t is string => Boolean(t) && typeof t === 'string');

        setFilterOptions(() => {
          const combined = new Set(['All', ...apiTemplates]);
          return Array.from(combined);
        });
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
        null,
        selectedFilter
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

          // Dynamically extract unique template names returned in the API response
          const apiTemplates: string[] = newActivities
            .map((act: MasterActivity) => act.template || act.template_name || "General")
            .filter((t: string | undefined): t is string => Boolean(t) && typeof t === 'string');

          if (apiTemplates.length > 0) {
            setFilterOptions((prev) => {
              const combined = new Set([...prev, ...apiTemplates]);
              return Array.from(combined);
            });
          }

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
    if (onSelectActivity) {
      onSelectActivity(activity);
    } else {
      // Fallback to old behavior if prop not provided (though in this context it should be)
      // navigate(`/ai-studio/transmitter_ocr/activity-summary/${activity.id}`, {
      //   state: { activity },
      // });
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
        <div className="flex justify-between items-center mt-1.5 mb-4 w-full">
          <div className="flex flex-col">
            <Text className="text-2xl -mt-1 font-bold" type="header2">
              Activity Summary
            </Text>
          </div>
        </div>

        <TabGroup onChange={(index) => setActiveTab(index === 0 ? 'master_activities' : 'analytics')}>
          <div className="flex justify-between items-center mt-2 mb-4 w-full">
            <TabList className="flex space-x-2">
              <Tab
                className={({ selected }) =>
                  `px-4 py-2 rounded-md transition-colors duration-300 ${selected ? 'bg-danger text-white font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium'
                  }`
                }
              >
                <Text type="body">Master Activities</Text>
              </Tab>
              <Tab
                className={({ selected }) =>
                  `px-4 py-2 rounded-md transition-colors duration-300 ${selected ? 'bg-danger text-white font-medium' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium'
                  }`
                }
              >
                <Text type="body">Analytics</Text>
              </Tab>
            </TabList>

            {activeTab === 'master_activities' ? (
              <div className="flex items-center">
                <Input
                  prefixIcon={<img src={Search} alt="search" loading="lazy" />}
                  placeholder="Search"
                  fixed_size="large"
                  onChange={onSearchChange}
                  value={searchValue}
                />
              </div>
            ) : (
              <YearButton
                processedYears={processedYears}
                yearIndex={yearIndex}
                onPrev={handlePrevYear}
                onNext={handleNextYear}
              />
            )}
          </div>

          {activeTab === 'master_activities' && (
            <div className="flex space-x-2 mt-2 mb-4 overflow-x-auto">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setSelectedFilter(filter);
                    getAllMasterActivities(0, pageSize.limit, searchValue, filter);
                  }}
                  className={`px-4 py-2 rounded-md transition-colors duration-300 capitalize ${selectedFilter === filter
                    ? 'bg-danger text-white font-medium'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium'
                    }`}
                >
                  <Text type="body">{filter}</Text>
                </button>
              ))}
            </div>
          )}

          <TabPanels className="h-full">
            <TabPanel className="h-full">
              {/* Master Activities Section */}
              <div className="mt-2 mb-3">
                <Text className="text-xl font-semibold" type="header3">
                  Master Activities
                </Text>
              </div>

              {/* Table Header */}
              <div className="bg-gray-50 border-t border-b border-gray-200 py-3 px-4">
                <div className="grid grid-cols-2 gap-4">
                  <Text
                    type="small"
                    className="text-gray-600 uppercase"
                  >
                    MASTER ACTIVITY
                  </Text>
                  <Text
                    type="small"
                    className="text-gray-600 uppercase pl-12"
                  >
                    CREATED ON
                  </Text>
                </div>
              </div>

              {/* Activities List */}
              <div
                ref={activityListRef}
                className="flex-1 h-[calc(100vh-300px)] overflow-y-auto"
              >
                {isLoading && masterActivities.length === 0 ? (
                  <PageLoading />
                ) : getFilteredActivities().length > 0 ? (
                  getFilteredActivities().map((activity, index, arr) => (
                    <div
                      key={activity.id}
                      className={`py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors ${index !== arr.length - 1
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
                          <Text type="body" className="ml-3 text-gray-800">
                            {activity.title}
                          </Text>
                        </div>
                        <div className="flex justify-start pl-12">
                          <Text type="body" className="text-gray-500">
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
            </TabPanel>

            <TabPanel className="h-[calc(100vh-245px)] flex flex-col overflow-hidden bg-white border border-gray-200 rounded-lg p-6">
              {isTagsLoading ? (
                <PageLoading />
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="mb-4 flex-shrink-0">
                    <Text className="text-xl font-semibold text-gray-800" type="header3">
                      Total Tags Processed in {processedYears[yearIndex]} (Total: {tagsData?.total ?? 0})
                    </Text>
                  </div>
                  <div className="flex-1 overflow-y-auto overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                            Month
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50">
                            Tags Count
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {months.map((monthName, idx) => {
                          const monthNum = idx + 1;
                          const countIndex = tagsData?.month?.indexOf(monthNum);
                          const rawCount = countIndex !== undefined && countIndex !== -1 ? tagsData?.activity?.[countIndex] : 0;
                          const displayCount = rawCount > 0 ? rawCount : "-";

                          return (
                            <tr key={monthName} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {monthName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {displayCount}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
};

export default ActivitySummaryPage;