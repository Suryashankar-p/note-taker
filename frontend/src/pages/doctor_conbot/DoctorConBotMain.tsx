import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import SideBar from "./Sidebar";
import ChatArea from "./ChatArea";
import { DeleteChat, GetAllChatLists } from "../../services/doctor_conbot.ts";
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
    title: "Dr. ConBot",
    url: "/ai-studio/doctor_conbot",
  },
];

const DoctorConbotMain = () => {
  const loading = useApiCheck("doctor_conbot");
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
      navigate(`/ai-studio/doctor_conbot`);
      dispatch.chatContent.clearChat();
      getChatLists();
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed Header */}
      <div className="fixed w-full z-50">
        <Header breadCrumbs={breadCrumbs} />
      </div>
  
      {/* Toast Notification */}
      {toast?.status && toast?.type === "error" && (
        <div className="fixed top-[4rem] sm:top-[5rem] md:top-[6rem] left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
  
      {/* Main Content */}
      <div className="flex flex-1  mt-[8vh] md:mt-[6.5vh] lg:mt-[6vh] xl:mt-[8vh] relative bg-background">
        {/* Sidebar (Hidden on Mobile, Opens on Toggle) */}
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-40 w-[80%] sm:w-[60%] md:w-[30%] lg:w-[25%] xl:w-[20%] bg-primary_text transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform md:relative md:translate-x-0 md:block`}
        >
          {/* Close Button for Mobile/Tablet */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-3 right-4 text-white text-2xl md:hidden"
          >
            ✖
          </button>
          <SideBar
            getChatList={getChatLists}
            onSideBarclose={() => setIsSidebarOpen(false)}
            onChatDeleteClick={onChatDeleteClick}
            history={historyList}
          />
        </div>
  
        {/* Chat Area */}
        <div className="flex-1 bg-background overflow-y-hidden h-[73.5vh] mt-2 mx-4 relative z-0">
          {/* Sidebar Toggle Button (Visible on Mobile & Tablet) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-4 z-50 text-3xl md:hidden"
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

export default DoctorConbotMain;
