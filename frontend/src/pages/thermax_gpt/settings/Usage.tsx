import React, { useEffect, useRef, useState } from "react";
import Text from "../../../components/Text";
import Cost from "./Cost";
import Activity from "./Activity";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  ReadActivityUsage,
  ReadActivityUsageTopUsers,
  ReadCostUsage,
  ReadUsageLimit,
  UpdateUsageLimit,
} from "../../../services/thermax_gpt";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import Toast from "../../../components/Toast";
import { months } from "../../../utils/constants";
import { getCurrentDate } from "../../../utils/functions";
import { years } from "../../../utils/constants";
import DropDownButton from "../../../components/DropDownButton";

// Tabs configuration
const tabs = [
  { key: "cost", label: "Cost" },
  { key: "activity", label: "Activity" },
];
const modelType = [
  { value: "Thermax-GPT", name: "Thermax-GPT" },
  { value: "Deep Search", name: "Deep Search" },
  { value: "Document Analyser", name: "Document Analyser" },
  { value: "All", name: "All" },
];

type Calender = {
  year: string | number;
  month: string | number;
};

type ModelValue = "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All";

type ModelType = {
  value: ModelValue;
  name: ModelValue;
};

type Page = {
  skip: number;
  limit: number;
};

// Main Usage component
const Usage = () => {
  const { year, month } = getCurrentDate();
  const [activeTab, setActiveTab] = useState<"cost" | "activity">("cost");
  const [calender, setCalender] = useState<Calender>({
    year: year,
    month: month,
  });
  const [usageData, setUsageData] = useState<any | null>();
  const [activityData, setActivityData] = useState<any | null>();
  const [limit, setLimit] = useState<number | null>();
  const toastStatus = useSelector((state: RootState) => state.toast.status);
  const dispatch = useDispatch<Dispatch>();
  const [topUsers, setTopUsers] = useState<any | null>();
  const [pageError, setPageError] = useState<boolean>(false);
  const [modelTypeFilter, setModelTypeFilter] = useState<ModelType>({
    value: "All",
    name: "All",
  });
  const [page, setPage] = useState<Page>({ skip: 0, limit: 4 });
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    getCostUsage(calender.year, calender.month, modelTypeFilter.value);
    getUsageLimit();
    getActivityUsage(calender.year, calender.month, modelTypeFilter.value);
    getActivityTopUsers(calender.year, calender.month, page.skip, page.limit);
  }, []);

  // const getActivityTopUsers = async (
  //   year: string | number,
  //   month: string | number,
  //   n: number
  // ) => {
  //   try {
  //     const topUserResponse = await ReadActivityUsageTopUsers(year, month, n);
  //     if (topUserResponse?.result) {
  //       setTopUsers(topUserResponse?.result);
  //     } else {
  //       setPageError(true);
  //       setTopUsers(null);
  //       // if (topUserResponse?.detail) dispatch.toast.openToast({ status: true, message: topUserResponse?.detail });
  //     }
  //   } catch (err) {
  //     console.log("err", err);
  //   }
  // };

  const reachedBottom = async () => {
    if (loadingRef.current) return;
    if (!topUsers || topUsers.length >= totalUsers) return;

    loadingRef.current = true;
    const newSkip = topUsers.length;
    setPage((prev) => ({ ...prev, skip: newSkip }));

    await getActivityTopUsers(
      calender.year,
      calender.month,
      newSkip,
      page.limit
    );
    loadingRef.current = false;
  };

  const getActivityTopUsers = async (
    year: string | number,
    month: string | number,
    skip: number,
    limit: number,
    type: "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All" = "All"
  ) => {
    if (totalUsers !== 0 && skip >= totalUsers) return; // prevent unnecessary fetch
    try {
      const topUserResponse = await ReadActivityUsageTopUsers(
        year,
        month,
        skip,
        limit,
        type
      );

      if (topUserResponse?.result) {
        setTopUsers((prevData) =>
          skip === 0
            ? topUserResponse.result
            : [...prevData, ...topUserResponse.result]
        );
        setTotalUsers(topUserResponse.total);
      } else {
        setPageError(true);
        setTopUsers(null);
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const getActivityUsage = async (
    year: string | number,
    month: string | number,
    type: "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All" = "All"
  ) => {
    try {
      const activityResponse = await ReadActivityUsage(year, month, type);
      if (activityResponse?.question) {
        setActivityData(activityResponse);
      } else {
        setPageError(true);
        setActivityData(null);
        //if (activityResponse?.detail) dispatch.toast.openToast({ status: true, message: topUserResponse?.detail });
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const getUsageLimit = async () => {
    setLimit(200);
    try {
      const limitResponse = await ReadUsageLimit();
      if (limitResponse?.id) {
      } else {
        setPageError(true);
        //     dispatch.toast.openToast({ message: limitResponse?.detail, status: true })
      }
    } catch (err) {
      console.log(err, "er");
    }
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
            dispatch.toast.openToast({
              message: editLimitResponse?.detail,
              status: true,
              type: "error",
            });
        }
      } catch (err) {
        console.log(err, "erer");
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "cost":
        return (
          <Cost
            usageData={usageData}
            limit={limit}
            onLimitEdit={onLimitEdit}
            month={calender.month}
          />
        );
      case "activity":
        return (
          <Activity
            activityData={activityData}
            month={calender.month}
            topUsers={topUsers}
            reachedBottom={reachedBottom}
          />
        );
      default:
        return null;
    }
  };

  const getCostUsage = async (
    year: string | number,
    month: string | number,
    type: "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All" = "All"
  ) => {
    try {
      const usageResponse = await ReadCostUsage(year, month, type);
      if (usageResponse?.cost) {
        setUsageData(usageResponse);
      } else {
        setPageError(true);
        setUsageData(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onYearChange = (data: string) => {
    if (data !== calender?.year) {
      setCalender({ ...calender, year: data });
      getCostUsage(data, calender.month, modelTypeFilter.value);
      getActivityUsage(data, calender.month, modelTypeFilter.value);
      getActivityTopUsers(data, calender.month, 0, 4), modelTypeFilter.value;
    }
  };

  const onMonthChange = (data: string) => {
    if (data !== calender?.month) {
      setCalender({ ...calender, month: data });
      getCostUsage(calender.year, data, modelTypeFilter.value);
      getActivityUsage(calender.year, data, modelTypeFilter.value);
      getActivityTopUsers(calender.year,data, 0, 4, modelTypeFilter.value);
    }
  };

  return (
    <div className="flex flex-col h-full md:mx-8 mt-1 lg:mx-16 gap-8 relative">
      <div className="flex justify-start items-center gap-16">
        <Text type="header2">Usage</Text>
        <div className="relative flex items-center">
          <Text className="mr-2" type="small">
            Model Type:
          </Text>
          <DropDownButton
            className={`w-56`}
            listValues={modelType}
            value={modelTypeFilter || "All"}
            onChange={(value) => {
              getCostUsage(calender.year, calender.month, value?.value);
              getActivityUsage(calender.year, calender.month, value?.value);
              getActivityTopUsers(
                calender.year,
                calender.month,
                page.skip,
                page.limit,
                value?.value
              );
              setModelTypeFilter(value);
            }}
          />
        </div>
      </div>
      {toastStatus && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <TabGroup className="h-full flex flex-col">
        <div className="flex justify-between items-center mt-1 gap-3 border-gray-300 mb-4 relative">
          <TabList className="flex space-x-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  `px-4 py-2 rounded-md transition-colors duration-300 border-danger ${
                    selected
                      ? "bg-danger text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`
                }
                onClick={() => setActiveTab(tab.key as "cost" | "activity")}
              >
                <Text type="body">{tab.label}</Text>
              </Tab>
            ))}
          </TabList>
          <div className="flex gap-4 items-center">
            <YearButton onSubmit={onYearChange} />
            <MonthButton onSubmit={onMonthChange} month={month} />
          </div>
        </div>
        <TabPanels className="bg-white rounded-lg shadow-lg border border-gray-200 h-[16rem] sm:h-[32rem] md:h-[32rem] lg:h-[22rem]">
          {tabs.map((tab) => (
            <TabPanel key={tab.key} className="h-full">
              {renderContent()}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
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
    setMonthIndex((prevMonthIndex) =>
      prevMonthIndex === 0 ? 11 : prevMonthIndex - 1
    );
    onSubmit((monthIndex === 0 ? 11 : monthIndex - 1) + 1);
  };

  const handleNextMonth = () => {
    setMonthIndex((prevMonthIndex) =>
      prevMonthIndex === 11 ? 0 : prevMonthIndex + 1
    );
    onSubmit((monthIndex === 11 ? 0 : monthIndex + 1) + 1);
  };

  return (
    <div className="relative flex items-center">
      <button
        className="absolute left-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300"
        onClick={handlePrevMonth}
      >
        &lt;
      </button>
      <span className={`px-4 w-48 text-center overflow-hidden`}>
        <Text className="text-primary_text" type="body">
          {months[monthIndex]}
        </Text>
      </span>
      <button
        className="absolute right-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300"
        onClick={handleNextMonth}
      >
        &gt;
      </button>
    </div>
  );
};

const YearButton: React.FC<ButtonProps> = ({ onSubmit, year }) => {
  const [yearIndex, setYearIndex] = useState<number>(0);

  const handlePrevYear = () => {
    setYearIndex((prevYearIndex) =>
      prevYearIndex === 0 ? prevYearIndex : prevYearIndex - 1
    );
    onSubmit(years[yearIndex === 0 ? yearIndex : yearIndex - 1]);
  };

  const handleNextYear = () => {
    setYearIndex((prevYearIndex) =>
      prevYearIndex === 7 ? prevYearIndex : prevYearIndex + 1
    );
    onSubmit(years[yearIndex === 7 ? yearIndex : yearIndex + 1]);
  };

  return (
    <div className="relative flex items-center">
      <button
        className="absolute left-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300"
        onClick={handlePrevYear}
      >
        &lt;
      </button>
      <span className={`px-4 w-48 text-center overflow-hidden`}>
        <Text className="text-primary_text" type="body">
          {years[yearIndex]}
        </Text>
      </span>
      <button
        className="absolute right-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300"
        onClick={handleNextYear}
      >
        &gt;
      </button>
    </div>
  );
};
