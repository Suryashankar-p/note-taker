import React, { useEffect, useRef, useState } from 'react';
import Text from '../../../components/Text';
import Cost from './Cost';
import Activity from './Activity';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ReadActivityUsage, ReadActivityUsageTopUsers, ReadCostUsage, ReadUsageLimit, UpdateUsageLimit, DownloadUsageActivity } from '../../../services/troubleshooting';
import DownloadUsageDetails from "../../../components/Modals/DownloadUsageDetails.tsx";
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../../redux/store';
import Toast from '../../../components/Toast';
import { months } from '../../../utils/constants';
import { getCurrentDate } from '../../../utils/functions';
import { IoMdDownload } from "react-icons/io";
import { ReadActiveUsersTrend } from '../../../services/troubleshooting';

const tabs = [
  { key: 'cost', label: 'Cost' },
  { key: 'activity', label: 'Activity' }
];

type Calender = {
  year: string | number,
  month: string | number
}

type Page = {
  skip: number,
  limit: number
}

const Usage = () => {
  const { year, month } = getCurrentDate()
  const [activeTab, setActiveTab] = useState<'cost' | 'activity'>('cost');
  const [calender, setCalender] = useState<Calender>({ year: year, month: month })
  const [usageData, setUsageData] = useState<any | null>()
  const [activityData, setActivityData] = useState<any | null>()
  const [limit, setLimit] = useState<number | null>()
  const toastStatus = useSelector((state: RootState) => state.toast.status)
  const dispatch = useDispatch<Dispatch>()
  const [topUsers, setTopUsers] = useState<any | null>([])
  const [pageError, setPageError] = useState<boolean>(false)
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const loadingRef = useRef(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const member = useSelector((state: RootState) => state.memberRole);
  const TroubleshootingMemberDetails = member.service === "troubleshooting" ? member?.details : {};
  const [trendData, setTrendData] = useState<any | null>(null);

  useEffect(() => {
    getCostUsage(calender.year, calender.month)
    getUsageLimit()
    getActivityUsage(calender.year, calender.month)
    setTopUsers([]);
    setTotalUsers(0);
    // Load all users at once with a high limit
    getActivityTopUsers(calender.year, calender.month, 0, 1000);
    getActiveUsersTrend(calender.year, calender.month)
  }, [calender.year, calender.month])

  
  const getActiveUsersTrend = async (year: string | number, month: string | number) => {
    try {
      const res = await ReadActiveUsersTrend(year, month);
      setTrendData(res?.result || res);
    } catch (err) {
      console.log("trend err", err);
    }
  };

  const getActivityTopUsers = async (
      year: string | number,
      month: string | number,
      skip: number,
      limit: number
    ) => {
      try {
        const topUserResponse = await ReadActivityUsageTopUsers(
          year,
          month,
          skip,
          limit
        );
        if (topUserResponse?.result) {
          setTopUsers(topUserResponse.result);
          setTotalUsers(topUserResponse.total);
        } else {
          setPageError(true);
          setTopUsers(null);
        }
      } catch (err) {
        console.log("err", err);
      }
    };

  const getActivityUsage = async (year: string | number, month: string | number) => {
    try {
      const activityResponse = await ReadActivityUsage(year, month)
      if (activityResponse?.question) {
        setActivityData(activityResponse)
      }
      else {
        setPageError(true);
        setActivityData(null)
      }
    }
    catch (err) {
      console.log("err", err);
    }
  }

  const getUsageLimit = async () => {
    try {
      const limitResponse = await ReadUsageLimit()
      if (limitResponse?.id) {
        setLimit(limitResponse?.limit)
      }
      else {
        setPageError(true)
      }
    }
    catch (err) {
      console.log(err, "er");

    }
  }

  const onLimitEdit = async (data: any) => {

    if (data?.limit) {
      try {
        const editLimitResponse = await UpdateUsageLimit(data?.limit)
        if (editLimitResponse?.id) {
          setLimit(editLimitResponse?.limit)
          dispatch.modal.closeEditLimit()
        }
        else {
          setPageError(true)
          if (editLimitResponse?.detail) dispatch.toast.openToast({ message: editLimitResponse?.detail, status: true, type:'error' })
        }
      }
      catch (err) {
        console.log(err, "erer");
      }
    }
  }

  const reachedBottom = async () => {
    if (loadingRef.current) return;
    if (!topUsers || topUsers.length >= totalUsers) return;

    loadingRef.current = true;
    const newSkip = topUsers.length;
    setPage((prev) => ({ ...prev, skip: newSkip }));

    await getActivityTopUsers(calender.year, calender.month, newSkip, page.limit);
    loadingRef.current = false;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cost':
        return <Cost usageData={usageData} limit={limit} onLimitEdit={onLimitEdit} month={calender.month} />;
      case 'activity':
        return <Activity activityData={{...activityData, totalActiveUsers: totalUsers}} month={calender.month} topUsers={topUsers} reachedBottom={reachedBottom} trendData={trendData}/>;
      default:
        return null;
    }
  };

  const getCostUsage = async (year: string | number, month: string | number) => {
    try {
      const usageResponse = await ReadCostUsage(year, month)
      if (usageResponse?.cost) {
        setUsageData(usageResponse)
      }
      else {
        setPageError(true)
        setUsageData(null)
      }
    }
    catch (err) {
      console.log(err);
    }
  }


  const onYearChange = (data: string) => {
    if (data !== calender?.year) {
      setCalender({ ...calender, year: data })
      setTopUsers([]);
      setTotalUsers(0);
      setActivityData(null);
      setUsageData(null);
    }
  }

  const onMonthChange = (data: string) => {
    if (data !== calender?.month) {
      setCalender({ ...calender, month: data })
      setTopUsers([]);
      setTotalUsers(0);
      setActivityData(null);
      setUsageData(null);
    }
  }

  const handleModalSubmit = async (fromDate: string, toDate: string) => {
    try {
      const response = await DownloadUsageActivity(fromDate, toDate);      

      if (!response)
        return;

      // Generate filename from toDate
      let filename = "Smart_Troubleshooting_App_usage_details.xlsx";
      if (toDate) {
        const [year, month, day] = toDate.split("-");
        filename = `Smart_Troubleshooting_App_usage_details_${day}_${month}_${year.slice(2)}.xlsx`;
      }

      // Create blob from response data and download
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download Excel:", err);
    }
  };

  return (
    <div className="flex flex-col h-full md:mx-8 lg:mx-16 gap-8 relative">
      <div className="flex items-center justify-between">
        <Text type="header2">Usage</Text>
        {TroubleshootingMemberDetails?.role === 'OWNER' && 
          <button
            className="bg-danger rounded-lg p-2 m-2"
            onClick={() => setIsModalOpen(true)}
            title="Download Usage Details"
          >
            <IoMdDownload className="text-white w-5 h-5" />
          </button>
        }
      </div>
      {toastStatus && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <TabGroup className="h-full flex flex-col gap-2">
        {/* Tabs and Buttons */}
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center mt-1 gap-3 border-gray-300 mb-4 relative">
          <TabList className="flex flex-wrap space-x-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  `px-4 py-2 rounded-md transition-colors duration-300 border-danger ${
                    selected ? 'bg-danger text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`
                }
                onClick={() => setActiveTab(tab.key as 'cost' | 'activity')}
              >
                <Text type="body">{tab.label}</Text>
              </Tab>
            ))}
          </TabList>
  
          {/* Year & Month Buttons */}
          <div className="flex gap-2 sm:gap-4 items-center">
            <YearButton onSubmit={onYearChange} year={year} />
            <MonthButton onSubmit={onMonthChange} month={month} />
          </div>  
        </div>
  
        {/* Content Panel */}
        <TabPanels className="bg-white rounded-lg shadow-lg border border-gray-200">
          {tabs.map((tab) => (
            <TabPanel key={tab.key} className={tab.key === 'activity' ? 'overflow-y-auto max-h-[calc(100vh-12rem)]' : 'h-full'}>
            {renderContent()}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
      <DownloadUsageDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
  };
  
  export default Usage;
  

interface ButtonProps {
  onSubmit: any
  month?: number
  year?: string | number
}

const MonthButton: React.FC<ButtonProps> = ({ onSubmit, month }) => {

  const [monthIndex, setMonthIndex] = useState<number>(month-1);


  const handlePrevMonth = () => {
    setMonthIndex((prevMonthIndex) => (prevMonthIndex === 0 ? 11 : prevMonthIndex - 1));
    onSubmit((monthIndex === 0 ? 11 : monthIndex - 1) + 1)
  };

  const handleNextMonth = () => {
    setMonthIndex((prevMonthIndex) => (prevMonthIndex === 11 ? 0 : prevMonthIndex + 1));
    onSubmit((monthIndex === 11 ? 0 : monthIndex + 1) + 1)
  };

  return (
    <div className="relative flex items-center w-[170px] sm:w-[160px] lg:w-[195px]">
      <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handlePrevMonth}>
        &lt;
      </button>
      <span className="px-4 flex-1 text-center overflow-hidden">
        <Text className="text-primary_text" type="body">{months[monthIndex]}</Text>
      </span>
      <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handleNextMonth}>
        &gt;
      </button>
    </div>
  )
};

const YearButton: React.FC<ButtonProps> = ({ onSubmit, year }) => {
  const [yearIndex, setYearIndex] = useState<number>(0);
  const years: string[] = [
    "2026", "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"
  ];

  const handlePrevYear = () => {
    setYearIndex((prevYearIndex) => (prevYearIndex === 0 ? prevYearIndex : prevYearIndex - 1));
    onSubmit(years[yearIndex === 0 ? yearIndex : yearIndex - 1])
  };

  const handleNextYear = () => {
    setYearIndex((prevYearIndex) => (prevYearIndex === 7 ? prevYearIndex : prevYearIndex + 1));
    onSubmit(years[yearIndex === 7 ? yearIndex : yearIndex + 1])
  };

  return (
    <div className="relative flex items-center w-[120px] sm:w-[140px]">
      <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handlePrevYear}>
        &lt;
      </button>
      <span className="px-4 flex-1 text-center overflow-hidden">
        <Text className="text-primary_text" type="body">{years[yearIndex]}</Text>
      </span>
      <button className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handleNextYear}>
        &gt;
      </button>
    </div>
  );
};
