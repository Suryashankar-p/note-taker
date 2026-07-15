import React, { useEffect, useRef, useState } from "react";
import Text from "../../../components/Text";
import Cost from "./Cost";
import Activity from "./Activity";
import Tokens from "./Tokens";
import {
  ReadActivityUsage,
  ReadActivityUsageTopUsers,
  ReadCostUsage,
  ReadDistributionUsage,
  ReadTokenUsage,
  ReadTokenUsageTopUsers,
  ReadUsageLimit,
  UpdateUsageLimit,
  ReadTotalActiveUsers,
  UpdateAllUsersUsageLimit,
} from "../../../services/thermax_gpt";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import Toast from "../../../components/Toast";
import { months } from "../../../utils/constants";
import { getCurrentDate } from "../../../utils/functions";
import { years } from "../../../utils/constants";
import DropDownButton from "../../../components/DropDownButton";

const tabs = [
  { key: "cost", label: "Cost", icon: "💰" },
  { key: "activity", label: "Activity", icon: "📊" },
  { key: "tokens", label: "Tokens", icon: "🔢" },
];

const modelType = [
  { value: "GPT 5.4", name: "GPT 5.4" },
  { value: "Sonnet 4.6", name: "Sonnet 4.6" },
  { value: "All", name: "All" },
];

type Calender = { year: string | number; month: string | number };
type ModelValue = "All" | "GPT 5.4" | "Sonnet 4.6";
type ModelType = { value: ModelValue; name: ModelValue };
type Page = { skip: number; limit: number };

const Usage = () => {
  const { year, month } = getCurrentDate();
  const [activeTab, setActiveTab] = useState<"cost" | "activity" | "tokens">("cost");
  const [calender, setCalender] = useState<Calender>({ year, month });
  const [usageData, setUsageData] = useState<any | null>();
  const [activityData, setActivityData] = useState<any | null>();
  const [tokenData, setTokenData] = useState<any | null>();
  const [distributionData, setDistributionData] = useState<any | null>();
  const [limit, setLimit] = useState<number | null>();
  const toastStatus = useSelector((state: RootState) => state.toast.status);
  const dispatch = useDispatch<Dispatch>();
  const [topUsers, setTopUsers] = useState<any | null>();
  const [tokenTopUsers, setTokenTopUsers] = useState<any | null>();
  const [pageError, setPageError] = useState<boolean>(false);
  const [modelTypeFilter, setModelTypeFilter] = useState<ModelType>({ value: "All", name: "All" });
  const [page, setPage] = useState<Page>({ skip: 0, limit: 3 });
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalActiveUsers, setTotalActiveUsers] = useState<number>(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    getCostUsage(calender.year, calender.month, modelTypeFilter.value);
    getUsageLimit();
    getActivityUsage(calender.year, calender.month, modelTypeFilter.value);
    getTokenUsage(calender.year, calender.month, modelTypeFilter.value);
    getActivityTopUsers(calender.year, calender.month, page.skip, page.limit);
    getTokenTopUsers(calender.year, calender.month, page.skip, page.limit);
    getDistributionUsage(calender.year, calender.month);
    getTotalActiveUsers(calender.year, calender.month, modelTypeFilter.value);
  }, []);

  const getTotalActiveUsers = async (year, month, type: ModelValue = "All") => {
    try {
      const response = await ReadTotalActiveUsers(year, month, type);
      if (response?.total_users !== undefined) {
        setTotalActiveUsers(response.total_users);
      }
    } catch {
      console.error("Failed to fetch total active users");
    }
  };

  const reachedBottom = async () => {
    if (loadingRef.current) return;
    if (activeTab === "activity") {
      if (!topUsers || topUsers.length >= totalUsers) return;
      loadingRef.current = true;
      const newSkip = topUsers.length;
      setPage((prev) => ({ ...prev, skip: newSkip }));
      await getActivityTopUsers(calender.year, calender.month, newSkip, page.limit);
      loadingRef.current = false;
    } else if (activeTab === "tokens") {
      if (!tokenTopUsers || tokenTopUsers.length >= totalUsers) return;
      loadingRef.current = true;
      const newSkip = tokenTopUsers.length;
      setPage((prev) => ({ ...prev, skip: newSkip }));
      await getTokenTopUsers(calender.year, calender.month, newSkip, page.limit);
      loadingRef.current = false;
    }
  };


  const getActivityTopUsers = async (year, month, skip, limit, type: ModelValue = "All") => {
    if (totalUsers !== 0 && skip >= totalUsers) return;
    const topUserResponse = await ReadActivityUsageTopUsers(year, month, skip, limit, type);
    if (topUserResponse?.result) {
      setTopUsers((prevData) =>
        skip === 0 ? topUserResponse.result : [...prevData, ...topUserResponse.result]
      );
      setTotalUsers(topUserResponse.total);
    } else {
      setPageError(true);
      setTopUsers(null);
    }
  };

  const getTokenTopUsers = async (year, month, skip, limit, type: ModelValue = "All") => {
    if (totalUsers !== 0 && skip >= totalUsers) return;
    const topUserResponse = await ReadTokenUsageTopUsers(year, month, skip, limit, type);
    if (topUserResponse?.result) {
      setTokenTopUsers((prevData) =>
        skip === 0 ? topUserResponse.result : [...prevData, ...topUserResponse.result]
      );
      setTotalUsers(topUserResponse.total);
    } else {
      setPageError(true);
      setTokenTopUsers(null);
    }
  };

  const getActivityUsage = async (year, month, type: ModelValue = "All") => {
    try {
      const activityResponse = await ReadActivityUsage(year, month, type);
      if (activityResponse?.question) setActivityData(activityResponse);
      else { setPageError(true); setActivityData(null); }
    } catch { setPageError(true); }
  };

  const getTokenUsage = async (year, month, type: ModelValue = "All") => {
    try {
      const tokenResponse = await ReadTokenUsage(year, month, type);
      if (tokenResponse?.prompt_tokens) setTokenData(tokenResponse);
      else { setPageError(true); setTokenData(null); }
    } catch { setPageError(true); }
  };

  const getUsageLimit = async () => {
    try {
      const limitResponse = await ReadUsageLimit();
      if (limitResponse?.id) setLimit(limitResponse?.limit);
      else setPageError(true);
    } catch { setPageError(true); }
  };

  const getDistributionUsage = async (year, month) => {
    try {
      const distributionResponse = await ReadDistributionUsage(year, month);
      if (distributionResponse?.items) setDistributionData(distributionResponse.items);
    } catch (err) { console.error("Failed to fetch distribution usage", err); }
  };

  const onLimitEdit = async (data: any) => {
    if (data?.limit) {
      try {
        const editLimitResponse = await UpdateUsageLimit(data?.limit);
        if (editLimitResponse?.id) {
          setLimit(editLimitResponse?.limit);
          dispatch.modal.closeEditLimit();
        } else {
          setPageError(true);
          if (editLimitResponse?.detail)
            dispatch.toast.openToast({ message: editLimitResponse?.detail, status: true, type: "error" });
        }
      } catch { setPageError(true); }
    }
  };

  const onGlobalLimitEdit = async (data: any) => {
    if (data?.yearly_limit !== undefined) {
      try {
        const editGlobalLimitResponse = await UpdateAllUsersUsageLimit(data?.yearly_limit);
        if (editGlobalLimitResponse?.message || editGlobalLimitResponse?.status === 200) {
          dispatch.toast.openToast({ message: "Global limit updated successfully.", status: true, type: "success" });
        } else {
          setPageError(true);
          if (editGlobalLimitResponse?.detail)
            dispatch.toast.openToast({ message: editGlobalLimitResponse?.detail, status: true, type: "error" });
        }
      } catch { setPageError(true); }
    }
  };

  const handleTabChange = (tabKey: "cost" | "activity" | "tokens") => {
    setActiveTab(tabKey);
  };

  const refreshData = (year = calender.year, month = calender.month, modelValue = modelTypeFilter.value) => {
    getCostUsage(year, month, modelValue);
    getActivityUsage(year, month, modelValue);
    getTokenUsage(year, month, modelValue);
    getActivityTopUsers(year, month, 0, 3, modelValue);
    getTokenTopUsers(year, month, 0, 3, modelValue);
    getDistributionUsage(year, month);
    getTotalActiveUsers(year, month, modelValue);
  };

  const onYearChange = (data: string) => {
    if (data !== calender?.year) {
      setCalender({ ...calender, year: data });
      refreshData(data, calender.month, modelTypeFilter.value);
    }
  };

  const onMonthChange = (data: string) => {
    if (data !== calender?.month) {
      setCalender({ ...calender, month: data });
      refreshData(calender.year, data, modelTypeFilter.value);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "cost":
        return <Cost usageData={usageData} distributionData={distributionData} limit={limit} onLimitEdit={onLimitEdit} onGlobalLimitEdit={onGlobalLimitEdit} month={calender.month} />;
      case "activity":
        return <Activity activityData={activityData} distributionData={distributionData} month={calender.month} topUsers={topUsers} reachedBottom={reachedBottom} totalActiveUsers={totalActiveUsers} />;
      case "tokens":
        return (
          <Tokens
            tokenData={tokenData}
            tokenTopUsers={tokenTopUsers}
            month={calender.month}
            reachedBottom={reachedBottom}
          />
        );
      default:
        return null;
    }
  };

  const getCostUsage = async (year, month, type: ModelValue = "All") => {
    try {
      const usageResponse = await ReadCostUsage(year, month, type);
      if (usageResponse?.cost) setUsageData(usageResponse);
      else { setPageError(true); setUsageData(null); }
    } catch { setPageError(true); }
  };

  return (
    <div className="flex flex-col mx-4 md:mx-8 lg:mx-16 mt-6 gap-5 relative pb-6 h-[calc(100vh-130px)]">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Usage Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">{months[Number(calender.month) - 1]} {calender.year}</p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Model</span>
          <div className="w-px h-4 bg-gray-200" />
          <DropDownButton
            className="w-40 border-none shadow-none bg-transparent"
            listValues={modelType}
            value={modelTypeFilter || "All"}
            onChange={(value) => {
              getCostUsage(calender.year, calender.month, value?.value);
              getActivityUsage(calender.year, calender.month, value?.value);
              getTokenUsage(calender.year, calender.month, value?.value);
              getActivityTopUsers(calender.year, calender.month, 0, 3, value?.value);
              getTokenTopUsers(calender.year, calender.month, 0, 3, value?.value);
              getTotalActiveUsers(calender.year, calender.month, value?.value);
              setModelTypeFilter(value);
            }}
          />
        </div>
      </div>

      {/* Toast */}
      {toastStatus && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <Toast type="error" />
        </div>
      )}

      {/* Tabs + Date Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Tab Pills */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as any)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 outline-none ${activeTab === tab.key
                  ? "bg-white text-[#EE3124] shadow-sm ring-1 ring-black/[0.06]"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/60"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <YearButton onSubmit={onYearChange} year={calender.year} />
          <div className="w-px h-5 bg-gray-200" />
          <MonthButton onSubmit={onMonthChange} month={Number(calender.month)} />
        </div>
      </div>

      {/* Tab Content Panel */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="animate-in fade-in duration-300 flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Usage;

interface ButtonProps {
  onSubmit: any;
  month?: number;
  year?: string | number;
}

const MonthButton: React.FC<ButtonProps> = ({ onSubmit, month }) => {
  const [monthIndex, setMonthIndex] = useState<number>(month - 1);

  const handlePrevMonth = () => {
    const newIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    setMonthIndex(newIndex);
    onSubmit(newIndex + 1);
  };

  const handleNextMonth = () => {
    const newIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    setMonthIndex(newIndex);
    onSubmit(newIndex + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePrevMonth}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 text-xs font-bold"
      >
        ‹
      </button>
      <span className="w-24 text-center text-sm font-semibold text-gray-700 select-none">
        {months[monthIndex]}
      </span>
      <button
        onClick={handleNextMonth}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 text-xs font-bold"
      >
        ›
      </button>
    </div>
  );
};

const YearButton: React.FC<ButtonProps> = ({ onSubmit, year }) => {
  const [yearIndex, setYearIndex] = useState<number>(() => {
    const index = years.findIndex((item) => Number(item) === Number(year));
    return index >= 0 ? index : 0;
  });

  const handlePrevYear = () => {
    if (yearIndex === 0) return;
    setYearIndex(yearIndex - 1);
    onSubmit(years[yearIndex - 1]);
  };

  const handleNextYear = () => {
    if (yearIndex === years.length - 1) return;
    setYearIndex(yearIndex + 1);
    onSubmit(years[yearIndex + 1]);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePrevYear}
        disabled={yearIndex === 0}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
      >
        ‹
      </button>
      <span className="w-14 text-center text-sm font-semibold text-gray-700 select-none">
        {years[yearIndex]}
      </span>
      <button
        onClick={handleNextYear}
        disabled={yearIndex === years.length - 1}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
      >
        ›
      </button>
    </div>
  );
};