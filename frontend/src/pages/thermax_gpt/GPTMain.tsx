import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import SideBar from "./Sidebar";
import ChatArea from "./ChatArea";
import { DeleteChat, GetAllChatLists } from "../../services/thermax_gpt.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import useApiCheck from "../../hooks/useApiCheck";
import Toast from "../../components/Toast";
import PageLoading from "../../components/PageLoading";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Thermax GPT",
    url: "/ai-studio/thermax_gpt",
  },
];

const GPTMain = () => {
  const loading = useApiCheck("thermax_gpt");
  const [relatedExpanded, setRelatedExpanded] = useState<boolean>(false);
  const [historyList, SetHistoryList] = useState<any>([]);
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const toast = useSelector((state: RootState) => state.toast);
  const [realtedQuestions, setRelatedQuestions] = useState<any>();

  useEffect(() => {
    getChatLists();
  }, []);

  const getChatLists = async () => {
    try {
      const list = await GetAllChatLists();
      if (list?.result) {
        SetHistoryList(list?.result);
      } else {
        dispatch.toast.openToast({ message: list?.detail, status: true });
      }
    } catch (err: any) {
      dispatch.toast.openToast({ message: err, status: true, type: "error" });
    }
  };

  const onChatDeleteClick = async (item: any) => {
    if (item.id) {
      await DeleteChat(item.id);
      navigate(`/ai-studio/thermax_gpt`);
      dispatch.chatContent.clearChat();
      getChatLists();
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="fixed w-full z-50">
        <Header breadCrumbs={breadCrumbs} />
      </div>
      {toast?.status && toast?.type === "error" && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className={`flex flex-1  relative bg-background h-screen}`}>
        <div className="w-1/4 bg-primary_text z-40">
          <SideBar
            getChatList={getChatLists}
            onChatDeleteClick={onChatDeleteClick}
            history={historyList}
          />
        </div>
        <div
          className={` pl-2 flex-2 w-full bg-'background' overflow-y-hidden h-[80vh] relative z-0`}
        >
          <ChatArea
            onNewChatAddition={getChatLists}
            disabled={relatedExpanded}
          />
        </div>
      </div>
    </div>
  );
};

export default GPTMain;
