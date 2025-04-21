import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import SideBar from './SideBar';
import ChatArea from './ChatArea';
import RelatedQueries from './RelatedQueries';
import { DeleteChat, ReadRelatedQuestions, GetAllChatLists } from '../../services/sales';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import useApiCheck from '../../hooks/useApiCheck';
import Toast from '../../components/Toast';
import PageLoading from '../../components/PageLoading';

const breadCrumbs = [
  {
    title: 'AI Studio',
    url: '/ai-studio'
  },
  {
    title: 'Sales Enablement Tool',
    url: '/ai-studio/sales'
  }
]

const ChatPageMain = () => {

  const loading = useApiCheck('sales');
  const [relatedExpanded, setRelatedExpanded] = useState<boolean>(false);
  const [historyList, SetHistoryList] = useState<any>([])
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()
  const toast = useSelector((state: RootState) => state.toast)
  const [realtedQuestions, setRelatedQuestions] = useState<any>()

  useEffect(() => {
    getChatLists()
  }, [])


  const getChatLists = async () => {
    try {
      const list = await GetAllChatLists()
      if (list?.result) {
        SetHistoryList(list?.result)
      }
      else {
        dispatch.toast.openToast({ message: list?.detail, status: true })
      }
    }
    catch (err: any) {
      dispatch.toast.openToast({ message: err, status: true, type:'error'  })
    }
  }

  const onChatDeleteClick = async (item: any) => {
    if (item.id) {
      await DeleteChat(item.id)
      navigate(`/ai-studio/sales`);
      dispatch.chatContent.clearChat()
      getChatLists()
    }
  }

  if (loading) {
    return <PageLoading/>;
  }

  const onQuestionAsked = async (question?: string) => {
    if (question) {
      try {
        const resp = await ReadRelatedQuestions(question)
        setRelatedQuestions(resp?.result)
      }
      catch (err) {
        console.log("err", err);
      }
    }
    else {
      setRelatedQuestions([])
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed w-full z-50">
        <Header breadCrumbs={breadCrumbs} />
      </div>
      {toast?.status && toast?.type === 'error' && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type='error' />
        </div>
      )}
      <div className={`flex flex-1 mt-[10.5vh] relative bg-${relatedExpanded ? '[#0061F3] bg-opacity-10' : 'background'}`}>
        <div className="w-1/6 bg-primary_text z-40">
          <SideBar getChatList={getChatLists} onChatDeleteClick={onChatDeleteClick} history={historyList} />
        </div>
        <div className={`flex-1 bg-'background' max-w-[63vw] overflow-y-hidden h-[73.5vh] relative z-0`}>
          <ChatArea onNewChatAddition={getChatLists} disabled={relatedExpanded} onQuestionAsked={onQuestionAsked} />
        </div>
        <div
          className={`absolute top-0 right-0 transition-all duration-500 ease-in-out ${relatedExpanded ? 'w-1/2' : 'w-1/5'} bg-primary_text ${relatedExpanded ? 'z-40' : 'z-0'} h-full`}
        >
          <RelatedQueries relatedQuestions={realtedQuestions} onExpandClick={(value: boolean) => { setRelatedExpanded(value) }} />
        </div>
      </div>
    </div>
  );
};

export default ChatPageMain;
