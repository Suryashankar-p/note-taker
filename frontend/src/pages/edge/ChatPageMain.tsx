import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import SideBar from './SideBar';
import ChatArea from './ChatArea';
import RelatedQueries from './RelatedQueries';
import { DeleteChat, GetAllChatLists } from '../../services/edge';
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
    title: 'Edge Agent Playground',
    url: '/ai-studio/edge'
  }
]

const ChatPageMain = () => {

  const loading = useApiCheck('edgeagent-playground');
  const [historyList, SetHistoryList] = useState<any>([])
  const dispatch = useDispatch<Dispatch>()
  const navigate = useNavigate()
  const toast = useSelector((state: RootState) => state.toast)

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
      dispatch.toast.openToast({ message: err, status: true, type: 'error' })
    }
  }

  const onChatDeleteClick = async (item: any) => {
    if (item.id) {
      await DeleteChat(item.id)
      navigate(`/ai-studio/edge`);
      dispatch.chatContent.clearChat()
      getChatLists()
    }
  }

  if (loading) {
    return <PageLoading />;
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
      <div className={`flex flex-1 mt-[10.5vh] relative bg-background`}>
        <div className="w-1/6 bg-primary_text z-40">
          <SideBar getChatList={getChatLists} onChatDeleteClick={onChatDeleteClick} history={historyList} />
        </div>
        <div className={`flex-1 bg-'background' max-w-[63vw] overflow-y-hidden h-[73.5vh] relative z-0`}>
          <ChatArea onNewChatAddition={getChatLists} disabled={false} />
        </div>
        <div
          className={`absolute top-0 right-0 w-1/5 bg-primary_text z-0 h-full`}
        >
          <RelatedQueries />
        </div>
      </div>
    </div>
  );
};

export default ChatPageMain;
