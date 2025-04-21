import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import SideBar from './SideBar';
import ChatArea from './ChatArea';
import RelatedQueries from '../sales/RelatedQueries';
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
    title: 'Training QA',
    url: '/ai-studio/training_qa'
  }
]

const TrainingQAMain = () => {
  const loading = useApiCheck('training_qa');
  const [relatedExpanded, setRelatedExpanded] = useState<boolean>(false);
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const toast = useSelector((state: RootState) => state.toast);
  const [relatedQuestions, setRelatedQuestions] = useState<any>();

  useEffect(() => {
    getChatLists();
  }, []);

  const getChatLists = async () => {
    // Fetch chat list logic here
  };

  const onChatDeleteClick = async (item: any) => {
    // Chat delete logic here
  };

  if (loading) {
    return <PageLoading />;
  }

  const onQuestionAsked = async (question: string) => {
    // Handle question logic here
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Header */}
      <div className="fixed w-full z-50">
        <Header breadCrumbs={breadCrumbs} />
      </div>

      {/* Toast for error messages */}
      {toast?.status && toast?.type === 'error' && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type='error' />
        </div>
      )}

      {/* Main content section */}
      <div className={`flex flex-1 mt-[10.5vh] relative bg-${relatedExpanded ? '[#0061F3] bg-opacity-10' : 'background'}`}>
        {/* Sidebar section */}
        <div className="w-1/6 bg-primary_text z-40 h-full overflow-y-auto">
          <SideBar  getChatList={getChatLists} onChatDeleteClick={onChatDeleteClick} history={[]} />
        </div>

        {/* Chat area section */}
        <div className="flex-1 bg-background h-[79.5vh] relative z-0 overflow-y-auto">
          <ChatArea />
        </div>
      </div>
    </div>
  );
};

export default TrainingQAMain;
