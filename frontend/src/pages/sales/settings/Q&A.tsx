import React, { useState, useRef, useEffect } from 'react';
import Text from '../../../components/Text';
import Button from '../../../components/Button';
import AddIcon from '../../../assets/circle_plus.svg';
import Input from '../../../components/Input';
import SearchIcon from '../../../assets/search_icon.svg';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../../redux/store';
import AddQuestionModal, { DefaultValue } from '../../../components/Modals/AddNewQuestion';
import Menu from '../../../assets/more.svg';
import Edit from '../../../assets/edit.svg';
import Trash from '../../../assets/trash.svg';
import UserAvatar from '../../../assets/chat_user.png'; // Path to user avatar image
import NoData from '../../../assets/no_data';
import DropDownMenu from '../../../components/DropdownMenu';
import { CreateQaA, ReadProducts, ReadQaA, DeleteQaA, UpdateQaA } from '../../../services/sales';
import { statusMapper } from '../../../utils/functions';
import Toast from '../../../components/Toast';
import ConfirmationModal from '../../../components/Modals/ConfirmationModal';

type Expand = {
  status: boolean;
  value: number | undefined;
};

const MenuItems = [
  {
    title: 'Delete',
    component: <img src={Trash} alt="trash" loading="lazy" />
  }
];


type Count = {
  "inReview": number,
  "approved": number,
  "rejected": number,
  "total": number
}

const QandA = () => {
  const dispatch = useDispatch<Dispatch>();
  const QandAOpen = useSelector((state: RootState) => state.modal.qandaOpen);
  const [expand, setExpand] = useState<Expand>({ status: false, value: undefined });
  const [defaultQA, setDefaultQA] = useState<DefaultValue>();
  const [activeTab, setActiveTab] = useState('inReview');
  const userDetails = useSelector((state: RootState) => state.userDetails) || JSON.parse((localStorage.getItem('user') || '{}'));
  const member = useSelector((state: RootState) => state.memberRole);
  const salesMemberDetails = member.service === 'sales' ? member?.details : {};
  const [qaData, setQAData] = useState<any>({ inReview: [], approved: [], rejected: [] })
  const toastStatus = useSelector((state: RootState) => state.toast.status)
  const [products, setProducts] = useState()
  const confirmationStatus = useSelector((state: RootState) => state.modal.confirmation)
  const [count, setCount] = useState<Count>({ inReview: 0, approved: 0, rejected: 0, total: 0 })
  const [pageError, setPageError] = useState<boolean>(false)
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 20 })
  const [searchTerm, setSearchTerm] = useState<string>('')
  let timeoutId: NodeJS.Timeout | null = null;

  useEffect(() => {
    if (activeTab) {
      getActiveTabQaA(pageSize?.skip, pageSize?.limit, activeTab, '')
    }
  }, [activeTab])

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight && !loading) {
        setHasReachedEnd(true);
        setLoading(true);
        setPageSize(prevPageSize => {
          const newSkip = prevPageSize.limit + prevPageSize.skip;
          loadMore(newSkip, prevPageSize.limit);
          return { ...prevPageSize, skip: newSkip };
        });
      } else {
        setHasReachedEnd(false);
      }
    };

    const refCurrent = scrollRef.current;

    if (refCurrent) {
      refCurrent.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading]);

  useEffect(() => {
    getAllProductData(0, 100, '')
  }, [])

  const loadMore = async (skip: number, limit: number) => {
    const updatedStatus = statusMapper(activeTab)
    try {
      const feedbackResponse = await ReadQaA(skip, limit, updatedStatus, searchTerm);
      if (feedbackResponse?.result) {
        setQAData(prevData => ({
          ...prevData,
          [activeTab]: [...prevData[activeTab], ...feedbackResponse.result]
        }));
        setLoading(false);
      }
      else {
        setPageError(true);
        if (feedbackResponse?.detail) dispatch.toast.openToast({ status: true, message: feedbackResponse?.detail });
        setLoading(false);
      }
    }
    catch (err) {
      setLoading(false);
    }
  };

  const getAllProductData = async (skip: number, limit: number, search_term: string) => {
    try {
      const productResponse = await ReadProducts(skip, limit, search_term)
      if (productResponse?.result) {
        setProducts(productResponse?.result)
      }
      else {
        setPageError(true);
        if (productResponse?.detail) dispatch.toast.openToast({ status: true, message: productResponse?.detail });
      }
    }
    catch (err) {
      setPageError(true);
    }
  }

  const getActiveTabQaA = async (skip: number, limit: number, status: string, search_term: string) => {
    try {
      const updatedStatus = statusMapper(status)
      const QaAResponse = await ReadQaA(skip, limit, updatedStatus, search_term)
      if (QaAResponse?.result) {
        setQAData({ ...qaData, [activeTab]: QaAResponse?.result })
        setCount({ inReview: QaAResponse?.total_in_review, approved: QaAResponse?.total_approved, rejected: QaAResponse?.total_rejected, total: QaAResponse?.total })
      }
      else {
        setPageError(true);
        if (QaAResponse?.detail) dispatch.toast.openToast({ status: true, message: QaAResponse?.detail });
      }
    }
    catch (err) {
      setPageError(true);
    }
  }


  const onExpandIconClick = (item: any) => {
    setDefaultQA(item)
    dispatch.modal.openQandA('edit');
  };

  const deleteQaAItem = async (item: any) => {
    if (item?.id) {
      try {
        await DeleteQaA(item?.id)
        getActiveTabQaA(0, 20, activeTab, '')
      }
      catch (err) {
        setPageError(true);
      }
    }
  }

  const onDropDownChange = (title: string, item: any) => {
    setDefaultQA(item);
    if (title === 'Edit') {
      dispatch.modal.openQandA('edit');
    } else if (title === 'Delete') {
      dispatch.modal.openConfirmation()
      // Add delete functionality if needed
    }
  };

  const getInitials = (name: string) => {
    const nameParts = name?.trim().split(' ');
    const initials = nameParts?.map(part => part?.charAt(0)).join('');
    return initials?.toUpperCase();
  };


  const onQaAAdd = async (data: any) => {
    let body = {
      products: data?.products,
      models: data?.models
    }
    let status = salesMemberDetails?.role === 'OWNER' ? 'APPROVED' : 'IN_REVIEW';

    if (body) {
      try {
        const response = await CreateQaA(data?.question, data?.answer, status, body)
        if (response?.id) {
          getActiveTabQaA(0, 20, activeTab, '')
          dispatch.modal.closeQandA()
        }
        else {
          setPageError(true);
          if (response?.detail) dispatch.toast.openToast({ status: true, message: response?.detail });
        }
      }
      catch (err) {
        setPageError(true);
      }
    }
  }

  const onEditQaA = async (data: any) => {
    let body = {
      products: data?.products,
      models: data?.models
    }
    // let status = salesMemberDetails?.role === 'OWNER' ? 'APPROVED' : 'IN_REVIEW';
    const status = data?.status
    if (body && defaultQA?.id) {
      try {
        const response = await UpdateQaA(defaultQA.id, data?.question, data?.answer, status, body)
        if (response?.id) {
          getActiveTabQaA(0, 20, activeTab, '')
          dispatch.modal.closeQandA()
        }
        else {
          setPageError(true);
          if (response?.detail) dispatch.toast.openToast({ status: true, message: response?.detail });
        }
      }
      catch (err) {
        setPageError(true);
      }
    }
  }

  const onSubmit = (data: any) => {
    if (QandAOpen.type === 'add') {
      onQaAAdd(data)
    }
    else if (QandAOpen.type === 'edit') {
      onEditQaA(data)
    }

  }

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm: string = e.target.value;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      setSearchTerm(searchTerm)
      getActiveTabQaA(0, pageSize?.skip, activeTab, searchTerm)
    }, 500); // Adjust the delay time (in milliseconds) as needed
  };


  const renderQADataItems = (items: any[]) => {
    return items.length > 0 ? items.map((item, index) => (
      <div
        key={index}
        className={`w-full sm:w-[73vw] h-20 text-center justify-center self-center rounded-lg shadow-custom flex flex-col border p-4 transition-all duration-300 cursor-pointer`}
        onClick={() => onExpandIconClick(item)}
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
            <div title={item?.created_by_user?.name} className="w-8 h-8 bg-gray-200 px-4  rounded-full flex items-center self-center justify-center">
              <span className="text-gray-600">{getInitials(item?.created_by_user?.name)}</span>
            </div>
            <Text title={item?.question} type="body" className="truncate text-primary_text">{item.question}</Text>
          </div>
          {(salesMemberDetails?.role === 'OWNER' || salesMemberDetails?.role === 'REVIEWER') && <DropDownMenu
            onChange={(title: string) => onDropDownChange(title, item)}
            content={<img className="h-7 w-7 mb-2" src={Menu} alt="Menu" loading="lazy" />}
            menuItems={MenuItems}
          />}
        </div>
      </div>
    )) : (
      <div className="flex justify-center h-screen items-center">
        <NoData />
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col gap-3 overflow-y-hidden ">
      {toastStatus && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type='error' />
        </div>
      )}
      <div className="mx-16 mt-1 flex flex-col sm:flex-row sm:justify-between">
        <div className='flex flex-col'>
          <Text className="text-[#091E42]" type="header2">
            Knowledge
          </Text>
          {qaData[activeTab] && <Text type="small" className="text-faint_text ml-1">{`(${count?.total > 1 ? count?.total + ' Results' : count?.total + ' Result'})`}</Text>}
        </div>
        <div className="flex flex-row items-center gap-5">
          {(salesMemberDetails?.role === 'OWNER' || salesMemberDetails?.role === 'REVIEWER') && <Button
            onClick={() => {
              setDefaultQA(undefined);
              dispatch.modal.openQandA('add');
            }}
            custom_type="danger"
            className="bg-danger w-20 h-10 p-2 gap-2 rounded-lg"
            size="custom"
          >
            <img src={AddIcon} alt="Add" loading="lazy" />
            <Text type="small">Add</Text>
          </Button>}
          <Input
            prefixIcon={<img src={SearchIcon} alt="Search" loading="lazy" />}
            placeholder="Search"
            fixed_size="large"
            onChange={onSearchChange}
          />
        </div>
      </div>

      <div className="flex justify-start gap-5 mx-16">
        <button onClick={() => setActiveTab('inReview')} className={`p-2 text-primary_text ${activeTab === 'inReview' ? 'border-b-2 border-primary' : ''}`}>
          <Text type='body' className={`${activeTab === 'inReview' ? 'text-danger' : ''}`}>
            In Review
            <span className='bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold'>{count['inReview']}</span>
          </Text>
        </button>
        <button onClick={() => setActiveTab('approved')} className={`p-2 text-primary_text ${activeTab === 'approved' ? 'border-b-2 border-primary' : ''}`}>
          <Text type='body' className={`${activeTab === 'approved' ? 'text-primary' : ''}`}>
            Approved
            <span className='bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold'>{count['approved']}</span>
          </Text>
        </button>
        <button onClick={() => setActiveTab('rejected')} className={`p-2 text-primary_text ${activeTab === 'rejected' ? 'border-b-2 border-primary' : ''}`}>
          <Text type='body' className={`${activeTab === 'rejected' ? 'text-primary' : ''}`}>
            Rejected
            <span className='bg-[#F3F1FF] ml-1 rounded-full px-2 py-1 text-primary_text font-bold'>{count['rejected']}</span>
          </Text>
        </button>
      </div>
      <div ref={scrollRef} className="self-center h-full overflow-y-scroll w-full flex flex-col gap-4 mb-24">
        {renderQADataItems(qaData[activeTab])}
      </div>
      {confirmationStatus && <ConfirmationModal onSubmit={() => deleteQaAItem(defaultQA)} title='Remove Knowledge' content='Are you sure you want to remove this knowledge?' />}
      {QandAOpen.status && <AddQuestionModal defaultValue={defaultQA} productsList={products} onSubmit={onSubmit} />}
    </div>
  );
};

export default QandA;
