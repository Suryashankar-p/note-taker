import React, { useEffect, useRef, useState } from 'react';
import Text from '../../components/Text';
import Cost from './Cost';
import Activity from './ActivityPage';
import Topactivity from './Topactivity';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import {ReadOCRActivityStatus, ReadOCRActivityUsage, ReadOCRCostUsage, ReadOCRTopUsers, ReadOCRUsageLimit, UpdateOCRUsageLimit } from '../../services/heating_ocr.ts';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import Toast from '../../components/Toast';
import { months } from '../../utils/constants';
import { years } from '../../utils/constants';

const tabs = [
  { key: 'cost', label: 'Cost' },
  { key: 'activity', label: 'Activity' }
];

type Calendar = {
  year: string;
  month: string;
}

type Page = {
  skip: number;
  limit: number;
};


const Usage = () => {
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString();
  const currentMonth = (currentDate.getMonth() + 1).toString(); // getMonth is zero-indexed, so add 1

  const [activeTab, setActiveTab] = useState<'cost' | 'activity'>('cost');
  const [calendar, setCalendar] = useState<Calendar>({ year: currentYear, month: currentMonth });
  const [usageData, setUsageData] = useState<any | null>(null);
  const [activityData, setActivityData] = useState<any | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const toastStatus = useSelector((state: RootState) => state.toast.status);
  const dispatch = useDispatch<Dispatch>();
  const [topUsers, setTopUsers] = useState<any | null>(null);
  const [pageError, setPageError] = useState<boolean>(false)
  const [activityStatus, setActivityStatus] = useState<any | null>(null);
  const [page, setPage] = useState<Page>({ skip: 0, limit: 4 });
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const loadingRef = useRef(false);

  useEffect(() => {

    getCostUsage(currentYear, currentMonth);
    getUsageLimit();
    getActivityUsage(currentYear, currentMonth);
    getActivityTopUsers(calendar.year, calendar.month, page.skip, page.limit);
    getActivityStatus(currentYear, currentMonth)
  }, []);

  const getActivityStatus = async (year: string | number, month: string | number,) => {
    try {
      const response = await ReadOCRActivityStatus(year, month)
      if (response.result) {
        setActivityStatus(response.result)
      }
    }
    catch (err) {
      console.log("err", err);
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
        type: "error",
      });
    }
  }

  const getActivityTopUsers = async (
    year: string | number,
    month: string | number,
    skip: number,
    limit: number
  ) => {
    if (totalUsers !== 0 && skip >= totalUsers) return; // Prevent unnecessary fetch

    try {
      const topUserResponse = await ReadOCRTopUsers(year, month, skip, limit);

      if (topUserResponse?.result) {
        setTopUsers((prevData: any) =>
          skip === 0
            ? topUserResponse.result
            : [...(prevData || []), ...topUserResponse.result]
        );
        setTotalUsers(topUserResponse.total || 0);
      } else {
        setPageError(true);
        setTopUsers(null);
        // Optionally show detail in a toast
        // if (topUserResponse?.detail) {
        //   dispatch.toast.openToast({ status: true, message: topUserResponse.detail });
        // }
      }
    } catch (err) {
      setPageError(true);
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
        type: "error",
      });
    }
  };

  const getActivityUsage = async (year: string | number, month: string | number) => {
    try {
      const activityResponse = await ReadOCRActivityUsage(year, month)
      if (activityResponse?.activity) {
        setActivityData(activityResponse)
      }
      else {
        setPageError(true);
        setActivityData(null)
     //   if (activityResponse?.detail) dispatch.toast.openToast({ status: true, message: activityResponse?.detail });
      }
    }
    catch (err) {
      setPageError(true)
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
        type: "error",
      });
    }
  }

  const getUsageLimit = async () => {
    try {
      const limitResponse = await ReadOCRUsageLimit()
      if (limitResponse?.id) {
        setLimit(limitResponse?.limit)
      }
      else {
        setPageError(true)
    //    if(limitResponse?.detail) dispatch.toast.openToast({ message: limitResponse?.detail, status: true })
      }
    }
    catch (err) {
      setPageError(true)
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
        type: "error",
      });
    }
  }

  const onLimitEdit = async (data: any) => {

    if (data?.limit) {
      try {
        const response = await UpdateOCRUsageLimit(data?.limit)
        if (response?.id) {
          setLimit(response?.limit)
          dispatch.modal.closeEditLimit()
        }
        else {
          setPageError(true)
      //    if (response?.detail) dispatch.toast.openToast({ message: response?.detail, status: true, type:'error' })
        }
      }
      catch (err) {
        setPageError(true)
        dispatch.toast.openToast({
          status: true,
          message: "Error updating limit",
          type: "error",
        });
      }
    }
  }

  const reachedBottom = async () => {
    if (loadingRef.current) return;
    if (!topUsers || topUsers.length >= totalUsers) return;

    loadingRef.current = true;
    const newSkip = topUsers.length;
    setPage((prev) => ({ ...prev, skip: newSkip }));

    await getActivityTopUsers(calendar.year, calendar.month, newSkip, page.limit);
    loadingRef.current = false;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'cost':
        return <Cost usageData={usageData} limit={limit} onLimitEdit={onLimitEdit} month={calendar.month} />;
      case 'activity':
        return <Topactivity activityData={activityData} month={calendar.month} topUsers={topUsers} activityStatus={activityStatus} reachedBottom={reachedBottom}/>;
      default:
        return null;
    }
  };

  const getCostUsage = async (year: string, month: string) => {
    try {
      const usageResponse = await ReadOCRCostUsage(year, month)
      if (usageResponse?.cost) {
        setUsageData(usageResponse)
      }
      else {
        setPageError(true)
        setUsageData(null)
      //  if(usageResponse?.detail) dispatch.toast.openToast({message: usageResponse?.detail, status: true, type: 'error'})
      }
    }
    catch (err) {
      setPageError(true)
      dispatch.toast.openToast({
        status: true,
        message: "Error fetching data",
        type: "error",
      });
    }
  }

  const onYearChange = (data: string) => {
    if (data !== calendar?.year) {
      setCalendar({ ...calendar, year: data });
      getCostUsage(data, calendar.month);
      getActivityUsage(data, calendar.month);
      getActivityStatus(data, calendar.month);
      getActivityTopUsers(data, calendar.month, 0, 4);
    }
  };

  const onMonthChange = (data: string) => {
    if (data !== calendar?.month) {
      setCalendar({ ...calendar, month: data });
      getCostUsage(calendar.year, data);
      getActivityUsage(calendar.year, data);
      getActivityStatus(calendar.year, data);
      getActivityTopUsers(calendar.year, data, 0, 4);
    }
  };

  return (
    <div className="flex flex-col relative -p-1 mt-6 ml-3 mx-0 md:mx-3 lg:mx-7 gap-4">
      <Text className="" type='header2'>Usage</Text>
      {toastStatus && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type='error' />
        </div>
      )}
      <TabGroup>
        <div className="flex relative justify-between items-center mt-5 mb-6 xl:gap-12">
          <TabList className="flex space-x-2">
            {tabs.map(tab => (
              <Tab
                key={tab.key}
                className={({ selected }) =>
                  `px-4 py-2 rounded-md transition-colors duration-300 ${
                    selected ? 'bg-danger text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`
                }
                onClick={() => setActiveTab(tab.key as 'cost' | 'activity')}
              >
                <Text type='body'>{tab.label}</Text>
              </Tab>
            ))}
          </TabList>
          <div className='flex gap-4 items-center'>
            <YearButton onSubmit={onYearChange} />
            <MonthButton onSubmit={onMonthChange} />
          </div>
        </div>
        <TabPanels className="bg-white h-[22rem] xl:h-[24rem] rounded-lg shadow-lg border border-gray-200">
          {tabs.map(tab => (
            <TabPanel key={tab.key} className='h-full'>
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
}

const MonthButton: React.FC<ButtonProps> = ({ onSubmit }) => {

  const currentMonth = new Date().getMonth(); // Get current month (0-indexed)
  const [monthIndex, setMonthIndex] = useState<number>(currentMonth);

  const handlePrevMonth = () => {

    const newIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    setMonthIndex(newIndex);
    onSubmit((newIndex + 1).toString());
  };

  const handleNextMonth = () => {

    const newIndex = monthIndex === 11 ? 0 : monthIndex + 1;
    setMonthIndex(newIndex);
    onSubmit((newIndex + 1).toString());
  };

  return (
    <div className="relative flex items-center">
      <button className="absolute left-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handlePrevMonth}>&lt;</button>
      <span className="px-4 w-48 text-center overflow-hidden">
        <Text className='text-primary_text' type='body'>{months[monthIndex]}</Text>
      </span>
      <button className="absolute right-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handleNextMonth}>&gt;</button>
    </div>
  );
};

const YearButton: React.FC<ButtonProps> = ({ onSubmit }) => {

  const currentYearIndex = years.indexOf(new Date().getFullYear().toString());
  const [yearIndex, setYearIndex] = useState<number>(currentYearIndex);

  const handlePrevYear = () => {

    const newIndex = yearIndex === 0 ? yearIndex : yearIndex - 1;
    setYearIndex(newIndex);
    onSubmit(years[newIndex]);
  };

  const handleNextYear = () => {

    const newIndex = yearIndex === years.length - 1 ? yearIndex : yearIndex + 1;
    setYearIndex(newIndex);
    onSubmit(years[newIndex]);
  };

  return (
    <div className="relative flex items-center">
      <button className="absolute left-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handlePrevYear}>&lt;</button>
      <span className="px-4 w-48 text-center overflow-hidden">
        <Text className='text-primary_text' type='body'>{years[yearIndex]}</Text>
      </span>
      <button className="absolute right-0 flex items-center justify-center w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded transition duration-300" onClick={handleNextYear}>&gt;</button>
    </div>
  );
};
