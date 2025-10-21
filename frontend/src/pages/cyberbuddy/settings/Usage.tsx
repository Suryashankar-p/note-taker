import React, { useEffect, useRef, useState } from 'react';
import Text from '../../../components/Text';
import Cost from './Cost';
import Activity from './Activity';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ReadActivityUsage, ReadActivityUsageTopUsers, ReadCostUsage, ReadUsageLimit, UpdateUsageLimit } from '../../../services/cyberbuddy';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../../redux/store';
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
  const [topUsers, setTopUsers] = useState<any | null>()
  const [pageError, setPageError] = useState<boolean>(false)
  const [page, setPage] = useState<Page>({ skip: 0, limit: 4 });
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const loadingRef = useRef(false);

  useEffect(() => {
    getCostUsage(calender.year, calender.month)
    getUsageLimit()
    getActivityUsage(calender.year, calender.month)
    getActivityTopUsers(calender.year, calender.month, page.skip, page.limit);
  }, [])

const getActivityTopUsers = async (
      year: string | number,
      month: string | number,
      skip: number,
      limit: number
    ) => {
     if (totalUsers !== 0 && skip >= totalUsers) return; // prevent unnecessary fetch
      try {
        const topUserResponse = await ReadActivityUsageTopUsers(
          year,
          month,
          skip,
          limit
        );
  
        if (topUserResponse?.result) {
          setTopUsers((prevData: any) =>
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
        return <Activity activityData={activityData} month={calender.month} topUsers={topUsers} reachedBottom={reachedBottom}/>;
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
      getCostUsage(data, calender.month)
      getActivityUsage(data, calender.month)
      getActivityTopUsers(data, calender.month, 0, 4);
    }
  }

  const onMonthChange = (data: string) => {
    if (data !== calender?.month) {
      setCalender({ ...calender, month: data })
      getCostUsage(calender.year, data)
      getActivityUsage(calender.year, data)
      getActivityTopUsers(calender.year, data, 0, 4);
    }
  }

  return (
    <div className="flex flex-col md:mx-8 mt-4 lg:mx-10 mx-8 gap-4 xl:gap-4 relative">
      <div className="flex flex-col">
        <Text className="text-[#091E42] ml-1" type="header2">
          Usage
        </Text>
      </div>
  
      {/* Toast Notification */}
      {toastStatus && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <Toast type="error" />
        </div>
      )}
  
      <TabGroup className="h-full flex flex-col gap-2 ">
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
        <TabPanels className="bg-white h-auto min-h-[12rem] sm:min-h-[16rem] lg:min-h-[18rem] overflow-y-auto md:overflow-hidden xl:h-[25rem] max-h-[calc(100vh-8rem)] rounded-lg shadow-lg border border-gray-200">
          {tabs.map((tab) => (
            <TabPanel key={tab.key} className="h-full pb-56">
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
    "2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017"
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
