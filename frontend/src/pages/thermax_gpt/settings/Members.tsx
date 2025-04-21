import React, { useEffect, useState, useRef } from 'react';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import AddIcon from '../../../assets/circle_plus.svg';
import Input from '../../../components/Input';
import SearchIcon from '../../../assets/search_icon.svg';
import UserTable from '../../../components/Table';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../../redux/store';
import { CreateMember, DeleteMember, ReadMembers, UpdateMember } from '../../../services/thermax_gpt';
import NoData from '../../../assets/no_data';
import Toast from '../../../components/Toast';

export const getKeyByValue = (object: any, value: any) => {
  return Object.entries(object).find(([key, val]) => val === value)?.[0];
};

const Members = () => {
  useEffect(() => {
    getAllMembers(0, 30, '');
  }, []);

  const [data, setData] = useState<any[]>([]);
  const [memberTotal, setMemberTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false); // Track loading state
  const [hasMore, setHasMore] = useState(true); // Track if more members are available to load
  let timeoutId: NodeJS.Timeout | null = null;
  const member = useSelector((state: RootState) => state.memberRole);
  const salesMemberDetails = member.service === 'thermax_gpt' ? member?.details : {};
  const dispatch = useDispatch<Dispatch>();
  const memberType = useSelector((state: RootState) => state.modal.addMember.type);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [pageError, setPageError] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null); // Ref for scroll container

  const getAllMembers = async (skip: number, limit: number, search_term?: string) => {
    try {
      setLoading(true);
      const response = await ReadMembers(skip, limit, search_term);
      if (response?.result) {
        setData(prevData => (skip === 0 ? response?.result : [...prevData, ...response?.result]));
        setMemberTotal(response?.total);
        setHasMore(response?.result.length >= limit); // Determine if more data is available
      } else {
        setPageError(true);
        if (response?.detail) dispatch.toast.openToast({ status: true, message: response?.detail, type: 'error' });
      }
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const onMemberCreate = async (data: any) => {
    if (data) {
      try {
        const response = await CreateMember(data?.role, data?.email, data?.name);
        if (response?.id) {
          dispatch.modal.closeAddMember();
          getAllMembers(0, 30, ''); // Reset to initial state
         // getSalesRole();
        } else {
          setPageError(true);
          if (response?.detail) dispatch.toast.openToast({ status: true, message: response?.detail, type: 'error' });
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log('error');
    }
  };

  const onMemberEdit = async (data: any) => {
    if (data) {
      try {
        const response = await UpdateMember(data?.role, data?.name, data?.memberId);
        if (response?.id) {
          dispatch.modal.closeAddMember();
          getAllMembers(0, 30, ''); // Reset to initial state
          //getSalesRole();
        } else {
          setPageError(true);
          if (response?.detail) dispatch.toast.openToast({ status: true, message: response?.detail, type: 'error' });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const onSubmit = (data: any) => {
    if (memberType === 'edit') {
      onMemberEdit(data);
    } else if (memberType === 'add') {
      onMemberCreate(data);
    }
  };

  const onDeleteSubmit = async (user: any) => {
    try {
      await DeleteMember(user?.id);
      getAllMembers(0, 30, ''); // Reset to initial state
    } catch (err) {
      console.log(err);
    }
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchValue(searchTerm);
      getAllMembers(0, 30, searchTerm);
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      if (scrollTop + clientHeight >= scrollHeight && !loading && hasMore) {
        getAllMembers(data.length, 30, searchValue); // Load next page of members
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-30 overflow-y-hidden">
      {toastStatus.status && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="mx-16 mt-1 flex flex-row justify-between">
        <div className="flex flex-col">
          <Text className="text-[#091E42]" type="header2">Owners</Text>
          {data && (
            <Text type="small" className="text-faint_text ml-1">
              {`(${data?.length > 1 ? data?.length + ' Results' : data?.length + ' Result'} of ${memberTotal})`}
            </Text>
          )}
        </div>
        <div className="flex flex-row items-center gap-5">
          {salesMemberDetails?.role === 'OWNER' && (
            <Button onClick={() => dispatch.modal.openAddMember('add')} custom_type="danger" className="bg-danger w-20 h-10 p-2 gap-2 rounded-lg" size="custom">
              <img src={AddIcon} alt="add" loading="lazy" />
              <Text type="small">Add</Text>
            </Button>
          )}
          <Input onChange={onSearchChange} prefixIcon={<img src={SearchIcon} alt="search" loading="lazy" />} placeholder="Search" fixed_size="large" />
        </div>
      </div>
      <div className="mx-16 mt-8 overflow-y-scroll" ref={scrollContainerRef} onScroll={handleScroll}>
        {data?.length > 0 ? (
          <UserTable data={data} type='thermax_gpt' onSubmit={onSubmit} onDeleteSubmit={onDeleteSubmit} />
        ) : (
          <div className="flex justify-center items-center">
            <NoData />
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
