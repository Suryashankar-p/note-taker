import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header.tsx";
import SideBar from "./CyberBuddySidebar.tsx";
import ChatArea from "./CyberBuddyChatArea.tsx";
import { DeleteChat, GetAllChatLists } from "../../services/cyberbuddy.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import { useNavigate } from "react-router-dom";
import useApiCheck from "../../hooks/useApiCheck.ts";
import Toast from "../../components/Toast.tsx";
import PageLoading from "../../components/PageLoading.tsx";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "CyberBuddy",
    url: "/ai-studio/cyberbuddy",
  },
];

const CyberBuddyMain = () => {
  const loading = useApiCheck("cyberbuddy");
  const [relatedExpanded, setRelatedExpanded] = useState<boolean>(false);
  const [historyList, SetHistoryList] = useState<any>([]);
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const toast = useSelector((state: RootState) => state.toast);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatLists();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    }

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

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
      navigate(`/ai-studio/cyberbuddy`);
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
        <div className="fixed top-[4rem] sm:top-[5rem] md:top-[6rem] left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="flex flex-1 mt-[20vh] md:mt-[6.5vh] lg:mt-[6vh] xl:mt-[8vh] relative bg-background">
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-40 w-[80%] sm:w-[60%] md:w-[30%] lg:w-[25%] xl:w-[20%] bg-primary_text transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform md:relative md:translate-x-0 md:block`}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-[70px] right-4 bg-transparent text-white !important text-2xl lg:hidden"          >
            ✖
          </button>
          <SideBar
            getChatList={getChatLists}
            onSideBarclose={() => setIsSidebarOpen(false)}
            onChatDeleteClick={onChatDeleteClick}
            history={historyList}
          />
        </div>
  
        <div className="flex-1 bg-background overflow-y-hidden h-[73.5vh] mt-2 mx-4 relative z-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-2 -left-1 sm:left-4 sm:top-3 z-50 text-3xl md:hidden"
          >
            ☰
          </button>
          <ChatArea
            onNewChatAddition={getChatLists}
            disabled={relatedExpanded}
          />
        </div>
      </div>
    </div>
  );
  
};

export default CyberBuddyMain;
