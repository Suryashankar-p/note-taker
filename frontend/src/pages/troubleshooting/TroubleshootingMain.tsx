import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/Header";
import SideBar from "./TroubleshootingSideBar.tsx";
import ChatArea from "./TroubleshootingChatArea.tsx";
import { DeleteChat, GetAllChatLists } from "../../services/troubleshooting.ts";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useNavigate, useSearchParams } from "react-router-dom";
import useApiCheck from "../../hooks/useApiCheck";
import Toast from "../../components/Toast";
import PageLoading from "../../components/PageLoading";
import AssetNumberModal, { SelectedAsset } from "../../components/Modals/AssetNumberModal.tsx";

const breadCrumbs = [
  {
    title: "AI Studio",
    url: "/ai-studio",
  },
  {
    title: "Smart Troubleshooting App",
    url: "/ai-studio/troubleshooting",
  },
];

const TroubleshootingMain = () => {
  const loading = useApiCheck("troubleshooting");
  const [relatedExpanded, setRelatedExpanded] = useState<boolean>(false);
  const [historyList, SetHistoryList] = useState<any>([]);
  const dispatch = useDispatch<Dispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chat_id = searchParams.get("chat_id");
  const toast = useSelector((state: RootState) => state.toast);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [assetModalOpen, setAssetModalOpen] = useState<boolean>(false);
  const [pendingAsset, setPendingAsset] = useState<SelectedAsset | null>(null);
  const [pendingTicketId, setPendingTicketId] = useState<string | null>(null);

  const clearPending = () => {
    setPendingAsset(null);
    setPendingTicketId(null);
  };

  const openNewChatFlow = () => {
    dispatch.chatContent.clearChat();
    clearPending();
    navigate(`/ai-studio/troubleshooting`);
    setAssetModalOpen(true);
  };

  const onAssetSubmit = (asset: SelectedAsset, ticketId: string) => {
    setPendingAsset(asset);
    setPendingTicketId(ticketId);
    setAssetModalOpen(false);
  };

  useEffect(() => {
    getChatLists();
  }, []);

  // Drive the asset dialog off the active session (chat_id):
  //  - No chat_id  => new/empty chat: a new chat must have an asset number, so
  //    (re)prompt for one and clear any stale value. Covers initial load, the
  //    "New Chat" button, and clearing/deleting chats.
  //  - Has chat_id => an existing chat already has its asset number, so always
  //    close the dialog. This lets the user freely switch to recent chats and
  //    prevents the dialog from lingering (with a Cancel button) over them.
  useEffect(() => {
    if (!chat_id) {
      clearPending();
      setAssetModalOpen(true);
    } else {
      setAssetModalOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat_id]);

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
      navigate(`/ai-studio/troubleshooting`);
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
      <div className="flex flex-1 mt-[8vh] md:mt-[6.5vh] lg:mt-[6vh] xl:mt-[8vh] relative bg-background">
        <div
          ref={sidebarRef}
          className={`fixed inset-y-0 left-0 z-40 w-[80%] sm:w-[60%] md:w-[30%] lg:w-[25%] xl:w-[20%] bg-primary_text transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform md:relative md:translate-x-0 md:block`}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-[80px] right-4 text-white text-2xl lg:hidden"
          >
            ✖
          </button>
          <SideBar
            getChatList={getChatLists}
            onSideBarclose={() => setIsSidebarOpen(false)}
            onChatDeleteClick={onChatDeleteClick}
            history={historyList}
            onNewChatClick={openNewChatFlow}
          />
        </div>
  
        <div className="flex-1 bg-background overflow-y-hidden h-[73.5vh] mt-2 mx-4 relative z-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-4 z-50 text-3xl md:hidden"
          >
            ☰
          </button>
          <ChatArea
            onNewChatAddition={getChatLists}
            disabled={relatedExpanded}
            pendingAsset={pendingAsset}
            pendingTicketId={pendingTicketId}
            clearPendingAsset={clearPending}
          />
        </div>
      </div>
      <AssetNumberModal
        show={assetModalOpen}
        onSubmit={onAssetSubmit}
        onClose={() => setAssetModalOpen(false)}
        // The dialog only ever opens for a new chat, which must have an asset
        // number, so it is always mandatory (no Cancel/X/Esc/backdrop close).
        // The user can still leave by picking a recent chat in the sidebar,
        // which sets chat_id and closes the dialog via the effect above.
        mandatory
      />
    </div>
  );

};

export default TroubleshootingMain;
