import React, { useEffect, useRef, useState } from 'react';
import Text from '../../components/Text';
import DropDownButton from '../../components/DropDownButton';
import Cost from './Cost';
import Activity from './ActivityPage';
import Topactivity from './Topactivity';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import {ReadOCRActivityStatus, ReadOCRActivityUsage, ReadOCRCostUsage, ReadOCRTopUsers, ReadOCRUsageLimit, UpdateOCRUsageLimit, ReadOCRYearActivityUsage, ReadOCRYearCostUsage } from '../../services/tbwes_ocr.ts';
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
  const currentMonth = (currentDate.getMonth() + 1).toString();

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
  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const loadingRef = useRef(false);

  useEffect(() => {
    if (periodType === 'monthly') {
      getCostUsage(currentYear, currentMonth);
      getUsageLimit();
      getActivityUsage(currentYear, currentMonth);
      getActivityTopUsers(calendar.year, calendar.month, page.skip, page.limit);
      getActivityStatus(currentYear, currentMonth)
    } else {
      getYearCostUsage(currentYear);
      getUsageLimit();
      getYearActivityUsage(currentYear);
      getActivityTopUsers(calendar.year, calendar.month, page.skip, page.limit);
    }
  }, [periodType]);

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
    if (totalUsers !== 0 && skip >= totalUsers) return;

    try {
      // Changed: Pass limit instead of skip to the API
      const topUserResponse = await ReadOCRTopUsers(year, month, limit);

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
        return <Cost usageData={usageData} limit={limit} onLimitEdit={onLimitEdit} month={calendar.month} periodType={periodType} />;
      case 'activity':
        return <Topactivity activityData={activityData} month={calendar.month} topUsers={topUsers} activityStatus={activityStatus} reachedBottom={reachedBottom} periodType={periodType} />;
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

  const getYearCostUsage = async (year: string) => {
    try {
      const usageResponse = await ReadOCRYearCostUsage(year)
      if (usageResponse?.cost) {
        setUsageData(usageResponse)
      }
      else {
        setPageError(true)
        setUsageData(null)
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

  const getYearActivityUsage = async (year: string) => {
    try {
      const activityResponse = await ReadOCRYearActivityUsage(year)
      if (activityResponse?.activity) {
        setActivityData(activityResponse)
      }
      else {
        setPageError(true);
        setActivityData(null)
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

  const onYearChange = (data: any) => {
    if (data?.value !== calendar?.year) {
      setCalendar({ ...calendar, year: data.value });
      setTopUsers(null); // Reset top users
      setPage({ skip: 0, limit: 4 }); // Reset pagination
      if (periodType === 'monthly') {
        getCostUsage(data.value, calendar.month);
        getActivityUsage(data.value, calendar.month);
        getActivityStatus(data.value, calendar.month);
        getActivityTopUsers(data.value, calendar.month, 0, page.limit);
      } else {
        getYearCostUsage(data.value);
        getYearActivityUsage(data.value);
        getActivityTopUsers(data.value, calendar.month, 0, page.limit);
      }
    }
  };

  const onMonthChange = (data: any) => {
    if (data?.value !== calendar?.month) {
      setCalendar({ ...calendar, month: data.value });
      setTopUsers(null); // Reset top users
      setPage({ skip: 0, limit: 4 }); // Reset pagination
      getCostUsage(calendar.year, data.value);
      getActivityUsage(calendar.year, data.value);
      getActivityStatus(calendar.year, data.value);
      getActivityTopUsers(calendar.year, data.value, 0, page.limit);
    }
  };

  const onPeriodTypeChange = (data: any) => {
    setPeriodType(data.value as 'monthly' | 'yearly');
  };

  // Prepare dropdown data
  const periodTypeOptions = [
    { name: 'Monthly', value: 'monthly' },
    { name: 'Yearly', value: 'yearly' }
  ];

  const monthOptions = months.map((month, index) => ({
    name: month,
    value: (index + 1).toString()
  }));

  const yearOptions = years.map(year => ({
    name: year,
    value: year
  }));

  // Get selected values for dropdowns
  const selectedPeriodType = periodTypeOptions.find(opt => opt.value === periodType) || periodTypeOptions[0];
  const selectedMonth = monthOptions.find(opt => opt.value === calendar.month) || monthOptions[0];
  const selectedYear = yearOptions.find(opt => opt.value === calendar.year) || yearOptions[0];

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
            <DropDownButton
              listValues={periodTypeOptions}
              value={selectedPeriodType}
              onChange={onPeriodTypeChange}
              className="w-40"
            />
            <DropDownButton
              listValues={yearOptions}
              value={selectedYear}
              onChange={onYearChange}
              className="w-40"
            />
            {periodType === 'monthly' && (
              <DropDownButton
                listValues={monthOptions}
                value={selectedMonth}
                onChange={onMonthChange}
                className="w-40"
              />
            )}
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