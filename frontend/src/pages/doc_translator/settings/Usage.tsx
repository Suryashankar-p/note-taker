import React, { useEffect, useRef, useState } from 'react';
import Text from '../../../components/Text';
import Cost from './Cost';
import Activity from './Activity';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ReadActivityUsage, ReadActivityUsageTopUsers, ReadCostUsage, ReadActiveUsersTrend } from '../../../services/doc_translator';

// import { useDispatch, useSelector } from 'react-redux';
// import { Dispatch, RootState } from '../../../redux/store';
import Toast from '../../../components/Toast';
import { months } from '../../../utils/constants';
import { getCurrentDate } from '../../../utils/functions';

const tabs = [
  { key: 'cost', label: 'Cost' },
  { key: 'activity', label: 'Activity' }
];

type Calender = {
  year: string | number,
  month: string | number
}

const Usage = () => {
  const { year, month } = getCurrentDate()
  const [activeTab, setActiveTab] = useState<'cost' | 'activity'>('cost');
  const [calender, setCalender] = useState<Calender>({ year: year, month: month })
  const [usageData, setUsageData] = useState<any | null>()
  const [activityData, setActivityData] = useState<any | null>()
  const [limit, setLimit] = useState<number | null>()
  // const toastStatus = useSelector((state: RootState) => state.toast.status)
  // const dispatch = useDispatch<Dispatch>()
  const [topUsers, setTopUsers] = useState<any | null>()
  const [pageError, setPageError] = useState<boolean>(false)
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const loadingRef = useRef(false);
  const [trendData, setTrendData] = useState<any | null>(null);


  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [costRes, activityRes, topUsersRes, trendRes] = await Promise.all([
          ReadCostUsage(calender.year, calender.month),
          ReadActivityUsage(calender.year, calender.month),
          ReadActivityUsageTopUsers(calender.year, calender.month),
          ReadActiveUsersTrend(calender.year, calender.month)
        ]);
        setTrendData(trendRes?.result || trendRes);
        setUsageData(costRes?.result || costRes);
        setActivityData(activityRes?.result || activityRes);
        setTopUsers(topUsersRes?.result || topUsersRes);
      } catch (err) {
        setPageError(true);
      }
    };
    fetchData();
  }, [calender.year, calender.month]);

  const renderContent = () => {
    switch (activeTab) {
      case 'cost':
        return <Cost usageData={usageData} limit={limit} onLimitEdit={() => {}} month={calender.month} />;
      case 'activity':
        return <Activity activityData={activityData} month={calender.month} year={Number(calender.year)} topUsers={topUsers} trendData={trendData} />;
      default:
        return null;
    }
  };

  const onYearChange = (data: string) => {
    if (data !== calender?.year) {
      setCalender({ ...calender, year: data });
    }
  };

  const onMonthChange = (data: string) => {
    if (data !== calender?.month) {
      setCalender({ ...calender, month: data });
    }
  };

  return (
    <div className="flex flex-col md:mx-8 mt-4 lg:mx-10 mx-8 gap-4 xl:gap-4 relative">
      <div className="flex flex-col">
        <Text className="text-[#091E42] ml-1" type="header2">
          Usage
        </Text>
      </div>
  
      {/* Toast Notification */}
      {/* {toastStatus && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <Toast type="error" />
        </div>
      )} */}
  
      <TabGroup className="flex flex-col gap-2 ">
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

          <TabPanel>
            <Cost
              usageData={usageData}
              month={Number(calender.month)}
              year={Number(calender.year)}
            />
          </TabPanel>

          <TabPanel className="overflow-y-auto max-h-[calc(100vh-12rem)]">
            <Activity
              activityData={activityData}
              month={Number(calender.month)}
              year={Number(calender.year)}
              topUsers={topUsers}
              trendData={trendData}
            />
          </TabPanel>

        </TabPanels>
      </TabGroup>
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
  const currentYear = new Date().getFullYear();
  const years: string[] = Array.from(
    { length: 10 },
    (_, i) => String(currentYear - i)
  );
  const initialIndex = years.indexOf(String(year));
  const [yearIndex, setYearIndex] = useState<number>(initialIndex !== -1 ? initialIndex : 0);
  const handlePrevYear = () => {
    if (yearIndex < years.length - 1) {
      setYearIndex(yearIndex + 1);
      onSubmit(years[yearIndex + 1]);
    }
  };
  const handleNextYear = () => {
    if (yearIndex > 0) {
      setYearIndex(yearIndex - 1);
      onSubmit(years[yearIndex - 1]);
    }
  };
  return (
    <div className="relative flex items-center w-[140px] sm:w-[140px]">
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
