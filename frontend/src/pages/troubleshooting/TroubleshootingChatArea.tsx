import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaGlobe } from "react-icons/fa";
import Input from "../../components/Input.tsx";
import ThermaxIcon from "../../assets/thermax_icon.svg";
import Sent from "../../assets/sent.png";
import "./styles.css";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import Divide from "../../assets/divider.png";
import Trash from "../../assets/Trash";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import {
  CreateChat,
  CreateChatHistory,
  DeleteChatHistory,
  ReadChatHistories,
  ReadProducts,
  TroubleshootingChatMode,
  updateChatHistory,
} from "../../services/troubleshooting.ts";
import LikeIcon from "../../assets/Like.tsx";
import Dislike from "../../assets/Dislike.tsx";
import DislikeReason from "../../components/Modals/DislikeReason.tsx";
import Loading from "../../components/ChatLoading.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import CopyIcon from "../../assets/Copy.tsx";
import copy from "clipboard-copy";
import Dollar from "../../assets/Dollar.tsx";
import EmptyChat from "../../assets/EmptyChat.tsx";
import Toast from "../../components/Toast.tsx";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import Pill from "../../components/Pills.tsx";
import CustomerInfoModal from "../../components/Modals/CustomerInfoModal.tsx";
import KbCitationViewerModal from "../../components/Modals/KbCitationViewerModal.tsx";
import type { SelectedAsset } from "../../components/Modals/AssetNumberModal.tsx";

interface Props {
  onNewChatAddition: () => void;
  disabled?: boolean;
  onQuestionAsked?: any;
  pendingAsset?: SelectedAsset | null;
  clearPendingAsset?: () => void;
}

type Event = ChangeEvent<HTMLInputElement>;
type Message = {
  sender: string;
  text: string;
};

const ChatArea: React.FC<Props> = ({
  onNewChatAddition,
  disabled,
  onQuestionAsked,
  pendingAsset,
  clearPendingAsset,
}) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch<Dispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Set when handleSend creates a new chat session itself. The chat_id-change
  // effect must then NOT reload history (which would clear the optimistic
  // question bubble we just added); the in-flight POST appends the real pair.
  const justCreatedChatRef = useRef(false);
  const chatContent = useSelector(
    (state: RootState) => state.chatContent.chatContent
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const chat_id = searchParams.get("chat_id");
  const dislikeModalStatus = useSelector(
    (state: RootState) => state.modal.dislikeReason.status
  );
  const toast = useSelector((state: RootState) => state.toast);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pageError, setPageError] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 100 });
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [selectedPills, setSelectedPills] = useState<
    Record<number, Set<string>>
  >({});
  const [visiblePills, setVisiblePills] = useState<string[] | null>(null);
  const [visiblePillDescriptions, setVisiblePillDescriptions] = useState<Record<string, string> | null>(null);
  const [visiblePillsIndex, setVisiblePillsIndex] = useState<number | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [activeCitation, setActiveCitation] = useState<{
    documentId: number;
    filename: string;
    page: number;
  } | null>(null);
  const mode: TroubleshootingChatMode =
    searchParams.get("mode")?.toUpperCase() === "KB" ? "KB" : "TROUBLESHOOTING";

  // Active product titles, shown as pills on the first turn so the user picks a
  // product before the normal flow (TROUBLESHOOTING) / KB retrieval (KB) begins.
  const [productTitles, setProductTitles] = useState<string[]>([]);
  const productPromptText =
    mode === "KB"
      ? "**Which product do you need help with?**"
      : "**On which product are you facing an issue?**";

  // Optimistic per-message like/dislike state. The persisted value lives on
  // the chat history row; this overlay keeps the UI responsive while we wait
  // for the refetch to confirm.
  const [localLikes, setLocalLikes] = useState<{ [id: number]: boolean | null }>({});
  const [defaultChatData, setDefaultChatData] = useState<any>(null);

  const onLikeClick = async (e: any, message: any) => {
    e.stopPropagation();
    if (localLikes[message.id] === true || message?.like === true) return;
    try {
      setLocalLikes((prev) => ({ ...prev, [message.id]: true }));
      await updateChatHistory(message.id, message.chat_id, true);
      setTimeout(() => getPageChat(), 500);
    } catch {
      setLocalLikes((prev) => ({ ...prev, [message.id]: message?.like ?? null }));
      dispatch.toast.openToast({ status: true, message: "Failed to submit like", type: "error" });
    }
  };

  const onDislikeClick = (e: any, message: any) => {
    e.stopPropagation();
    if (localLikes[message.id] === false || message?.like === false) return;
    setDefaultChatData(message);
    dispatch.modal.openDislikeReason("add");
  };

  // DislikeReason returns either a preset radio choice or a custom string;
  // optional suggestedAnswer is forwarded as the curated answer on the feedback row.
  const onDislikeSubmit = async (data: any) => {
    if (!defaultChatData) return;
    const reason =
      data?.dislikeReason === "Other" ? data?.customReason : data?.dislikeReason;
    try {
      setLocalLikes((prev) => ({ ...prev, [defaultChatData.id]: false }));
      await updateChatHistory(
        defaultChatData.id,
        defaultChatData.chat_id,
        false,
        reason,
        data?.suggestedAnswer,
      );
      dispatch.modal.CloseDislikeReason();
      setTimeout(() => getPageChat(), 500);
    } catch {
      setLocalLikes((prev) => ({
        ...prev,
        [defaultChatData.id]: defaultChatData?.like ?? null,
      }));
      dispatch.toast.openToast({ status: true, message: "Failed to submit feedback", type: "error" });
    }
  };

  const setMode = (next: TroubleshootingChatMode) => {
    const params = new URLSearchParams(searchParams);
    if (next === "KB") {
      params.set("mode", "kb");
    } else {
      params.delete("mode");
    }
    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    (async () => {
      try {
        const resp = await ReadProducts(0, 100, "");
        if (resp?.result)
          setProductTitles(resp.result.map((p: any) => p.product_title));
      } catch {
        // Non-fatal: no product pills shown, user can still type.
      }
    })();
  }, []);

  useEffect(() => {
    if (chat_id) {
      // Skip the reload for a chat we just created in handleSend — the optimistic
      // question is already in the store and the in-flight answer will be appended.
      if (justCreatedChatRef.current) {
        justCreatedChatRef.current = false;
        setShowInfoModal(false);
        return;
      }
      getPageChat();
      setShowInfoModal(false)
    }
    else {
      // setShowInfoModal(true)
    }
  }, [chat_id]);

  useEffect(() => {
    if (pageSize.skip === 0) {
      scrollToBottom();
    }
    if (chatContent.length > 0) {
      const lastMessage = chatContent[chatContent.length - 1];
      if (lastMessage.pills && lastMessage.pills.length > 0) {
        setVisiblePills(lastMessage.pills);
        setVisiblePillDescriptions(lastMessage.pill_descriptions ?? null);
        setVisiblePillsIndex(chatContent.length - 1);
      } else {
        setVisiblePills(null);
        setVisiblePillDescriptions(null);
        setVisiblePillsIndex(null);
      }
    }
  }, [chatContent]);

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      if (scrollTop === 0 && !loading && !hasReachedEnd) {
        // setPageSize(prevPageSize => {
        //   const newSkip = prevPageSize.limit + prevPageSize.skip;
        //   //loadMore(newSkip, prevPageSize.limit);
        //   return { ...prevPageSize, skip: newSkip };
        // });
      } else if (scrollTop + clientHeight < scrollHeight - 100) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    const refCurrent = scrollRef.current;

    if (refCurrent) {
      refCurrent.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasReachedEnd]);

  const copyToClipboard = (index: number, message: any) => {
    const content: any = document.querySelector(`#message-${index}`);
    if (!content) return;
    copy(content.innerText);
    setCopySuccess(true);
    dispatch.toast.openToast({
      status: true,
      message: "Copied to clipboard",
      type: "success",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest"
    });
  };

  const getPageChat = async () => {
    try {
      const response = await ReadChatHistories(
        pageSize?.skip,
        pageSize?.limit,
        chat_id
      );
      if (response?.result) {
        dispatch.chatContent.clearChat();
        dispatch.chatContent.addChat(response.result);
      } else {
        setCopySuccess(false);
        setPageError(true);
        if (response?.detail) {
          dispatch.toast.openToast({
            status: true,
            message: response?.detail,
            type: "error",
          });
        }
        navigate(`/ai-studio/troubleshooting`);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  // Shared send path used by the text input, problem/why pills, and the
  // first-turn product pills. Creates the chat session on the first message.
  const submitMessage = async (text: string) => {
    if (!text.trim()) return;
    // A new chat (no active session) must have an asset selected before it
    // can be started. The asset dialog enforces this, but guard here too.
    if (!chat_id && !pendingAsset) {
      dispatch.toast.openToast({
        status: true,
        message: "Please select an asset to start a new chat.",
        type: "error",
      });
      return;
    }
    setLoading(true);
    dispatch.chatContent.addQuestion([{ human: text }]);
    try {
      const activeChatId = chat_id ?? (await (async () => {
        const newSession = await CreateChat(text, pendingAsset?.asset_name, pendingAsset?.sf_asset_id);
        if (!newSession?.id) {
          dispatch.toast.openToast({ status: true, message: newSession?.detail, type: "error" });
          setLoading(false);
          return null;
        }
        clearPendingAsset?.();
        // Tell the chat_id effect not to wipe the optimistic question on this navigation.
        justCreatedChatRef.current = true;
        navigate(`/ai-studio/troubleshooting?chat_id=${newSession.id}${mode === "KB" ? "&mode=kb" : ""}`);
        onNewChatAddition();
        return String(newSession.id);
      })());

      if (!activeChatId) return;

      const chatResponse = await CreateChatHistory(text, activeChatId, mode);

      if (chatResponse?.ai) {
        dispatch.chatContent.removeQuestion();
        dispatch.chatContent.addQuestion([chatResponse]);
        setLoading(false);
        setInputValue("");
        setPageError(false);
      } else {
        if (chatResponse?.detail) {
          dispatch.toast.openToast({ status: true, message: chatResponse.detail, type: "error" });
        }
        setPageError(true);
        getPageChat();
        setLoading(false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      setCopySuccess(false);
      dispatch.toast.openToast({ status: true, message: "Failed", type: "error" });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    await submitMessage(inputValue);
  };

  // First-turn product pill: sends the product title (creating the chat if needed).
  const handleProductPill = async (item: string) => {
    setVisiblePills(null);
    setVisiblePillsIndex(null);
    await submitMessage(item);
  };

  const handlePill = async (messageIndex: number, item: string) => {
    if (!item.trim()) return;
    setSelectedPills((prevState) => {
      const updatedPills = new Set(prevState[messageIndex] || []);
      updatedPills.add(item);
      return { ...prevState, [messageIndex]: updatedPills };
    });
    setVisiblePills(null);
    setVisiblePillsIndex(null);
    setLoading(true);
    dispatch.chatContent.addQuestion([{ human: item }]);
    try {
      const chatResponse = await CreateChatHistory(item, chat_id, mode);
      if (chatResponse?.ai) {
        dispatch.chatContent.removeQuestion();
        dispatch.chatContent.addQuestion([chatResponse]);
        setLoading(false);
        setInputValue("");
        setPageError(false);
      } else {
        if (chatResponse?.detail) {
          console.error(chatResponse?.detail);
        }
        setPageError(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("API error: ", error);
      setPageError(true);
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSend();
  };

  const onChatDelete = async (item: any) => {
    try {
      await DeleteChatHistory(item.id, item.chat_id);
      getPageChat();
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(" ");
    const initials = nameParts
      ?.slice(0, 2)
      .map((part) => part.charAt(0))
      .join("");
    return initials.toUpperCase();
  };

  interface PillWrapperProps {
    markdown?: string[];
    descriptions?: Record<string, string> | null;
    messageIndex: number;
    onPillClick: (index: number, pill: string) => void;
  }

  const PillWrapper: React.FC<PillWrapperProps> = ({
    markdown = [],
    descriptions,
    messageIndex,
    onPillClick,
  }) => {
    const [tooltipPill, setTooltipPill] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

    return (
      <div className="flex flex-col gap-1 mb-4">
        {markdown?.map((item, index) => {
          const desc = descriptions?.[item];
          return (
            <div key={index} className="flex items-center gap-1">
              <Pill
                label={item}
                onClick={() => onPillClick(messageIndex, item)}
                size="large"
                selected={true}
              />
              {desc && (
                <button
                  type="button"
                  onMouseEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ top: r.bottom + 6, left: r.left });
                    setTooltipPill(item);
                  }}
                  onMouseLeave={() => { setTooltipPill(null); setTooltipPos(null); }}
                  onFocus={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setTooltipPos({ top: r.bottom + 6, left: r.left });
                    setTooltipPill(item);
                  }}
                  onBlur={() => { setTooltipPill(null); setTooltipPos(null); }}
                  className="shrink-0 text-[11px] w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center leading-none text-gray-500 hover:text-gray-800 hover:border-gray-600 transition-colors"
                  aria-label={`Definition for ${item}`}
                >
                  ℹ
                </button>
              )}
              {tooltipPill === item && tooltipPos && (
                <div
                  style={{ position: "fixed", top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999 }}
                  className="w-72 rounded-lg border bg-white shadow-lg p-3 text-xs text-gray-700 whitespace-pre-wrap pointer-events-none"
                >
                  <span className="block font-semibold text-[10px] uppercase mb-1 text-gray-400">
                    Definition
                  </span>
                  {desc}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const convertMarkdownToHtml = (markdown: string) => {
    const dirtyHtml = marked.parse(markdown, { gfm: true, breaks: true });
    return DOMPurify.sanitize(dirtyHtml);
  };

  // const onCustomerDetailsSubmit = ({customerName, ocNumber}) => {
  //   let customerDetails = {
  //     name: customerName,
  //     oc_number: ocNumber,
  //   }
  //   setInputValue(() => {
  //     const newValue = JSON.stringify(customerDetails);
  //     handleSend(newValue);
  //     return newValue;
  //   });
  // }

  return (
    <div className="flex flex-col w-full position-fixed h-full bg-inherit">
      {toast?.status && toast?.type === "error" && pageError && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      {toast?.status && toast?.type === "success" && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="success" />
        </div>
      )}
      {/* {showInfoModal && (
        <CustomerInfoModal
          onSubmit={onCustomerDetailsSubmit}
          show={showInfoModal}
          onClose={() => setShowInfoModal(false)}
        />
      )} */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-scroll smooth-scroll p-4 pb-2 space-y-8 bg-inherit"
      >
        {chatContent?.length > 0 ? (
          chatContent.map((message: any, index: number) => (
            <div key={index} className="flex flex-col gap-4 bg-inherit w-full">
              <div
                key={index}
                className={`flex w-full bg-inherit ${
                  message?.human ? "justify-end" : "justify-start"
                }`}
              >
                {/* Human message on the right */}
                {message?.human && (
                  <div className="flex items-center space-x-2">
                    <div
                      className={`inline-block p-2 max-w-[54vw] rounded-lg  text-small bg-gray-200 ${
                        message?.human
                          ? "text-primary_text"
                          : "text-small pl-14"
                      }`}
                    >
                      <Text className="text-primary_text" type="small">
                        {message?.human}
                      </Text>
                    </div>
                    <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">
                        {getInitials(userDetails?.name)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI message on the left with 'AI' label */}

              <div className="flex items-start space-x-2">
                {(message?.ai || loading) && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">AI</span>
                  </div>
                )}
                {message?.ai ? (
                  <div
                    className={`inline-block p-2 rounded-lg text-small bg-inherit text-primary_text`}
                  >
                    <div
                      id={`message-${index}`}
                      className="markdown-body max-w-[58vw] overflow-hidden bg-white"
                      style={{
                        backgroundColor: "white",
                        border: "none",
                        outline: "none",
                      }}
                    >
                      <div
                        className="prose text-[14px] font-normal text-primary_text bg-inherit"
                        dangerouslySetInnerHTML={{
                          __html:
                            message?.ai && convertMarkdownToHtml(message?.ai),
                        }}
                      />
                    </div>
                    {visiblePills?.length > 0 &&
                      visiblePillsIndex === index && (
                        <PillWrapper
                          markdown={visiblePills}
                          descriptions={visiblePillDescriptions}
                          messageIndex={index}
                          onPillClick={handlePill}
                        />
                      )}
                    {message?.citations?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.citations.map((c: any, ci: number) => (
                          <button
                            key={`cit-${index}-${ci}`}
                            type="button"
                            onClick={() =>
                              setActiveCitation({
                                documentId: c.document_id,
                                filename: c.filename,
                                page: c.page,
                              })
                            }
                            className="text-[12px] px-2 py-0.5 rounded-full border border-[#0061F3] text-[#0061F3] hover:bg-[#0061F3] hover:text-white transition-colors"
                            title={c.snippet || ""}
                          >
                            {c.filename} · p.{c.page}
                          </button>
                        ))}
                      </div>
                    )}
                    {message?.images?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.images.map((img: any, ii: number) => (
                          <a
                            key={`img-${index}-${ii}`}
                            href={img.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={img.caption || img.filename || "image"}
                          >
                            <img
                              src={img.url}
                              alt={img.caption || img.filename || "issue image"}
                              className="h-28 w-28 object-cover rounded-lg border bg-white"
                              loading="lazy"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    {message?.web_sources?.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-gray-500">
                          <FaGlobe className="w-3 h-3" />
                          <span className="text-[11px] font-medium">Web sources</span>
                        </div>
                        {message.web_sources.map((src: any, si: number) => (
                          <a
                            key={`web-${index}-${si}`}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-blue-600 underline truncate max-w-[52vw]"
                            title={src.snippet || ""}
                          >
                            {src.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-full relative"
                    style={{ transform: "translateX(-3rem)" }}
                  >
                    <Loading />
                  </div>
                )}
              </div>

              {/* Actions for AI message */}
              {message.ai && (
                <button
                  disabled={disabled}
                  className="w-52 min-h-8 rounded-full ml-12 -mt-2 border border-grey"
                >
                  <div className="flex flex-row gap-2 mx-2 justify-between items-center">
                    {/* Thumbs feedback is KB-mode only; troubleshooting mode has no feedback flow. */}
                    {message?.mode === "KB" && (
                      <>
                        <LikeIcon
                          disabled={disabled}
                          selected={
                            localLikes[message.id] !== undefined
                              ? localLikes[message.id] === true
                              : message?.like === true
                          }
                          onClick={(e: any) => onLikeClick(e, message)}
                        />
                        <img src={Divide} alt="divide" loading="lazy" />
                        <Dislike
                          disabled={disabled}
                          selected={
                            localLikes[message.id] !== undefined
                              ? localLikes[message.id] === false
                              : message?.like === false
                          }
                          onClick={(e: any) => onDislikeClick(e, message)}
                        />
                        <img src={Divide} alt="divide" loading="lazy" />
                      </>
                    )}
                    <CopyIcon
                      disabled={disabled}
                      onClick={() => copyToClipboard(index, message)}
                    />
                    <img src={Divide} alt="divide" loading="lazy" />
                    <Trash
                      disabled={disabled}
                      className="h-5"
                      onClick={() => onChatDelete(message)}
                    />
                    <img src={Divide} alt="divide" loading="lazy" />
                    <Dollar
                      className="h-5"
                      disabled={disabled}
                      data={message?.price}
                    />
                  </div>
                </button>
              )}
            </div>
          ))
        ) : !loading && productTitles.length > 0 ? (
          // First turn: ask the user to pick a product via pills before the
          // normal flow (TROUBLESHOOTING) / KB retrieval (KB) begins.
          <div className="flex items-start space-x-2">
            <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
              <span className="text-gray-600">AI</span>
            </div>
            <div className="inline-block p-2 rounded-lg text-small bg-inherit text-primary_text">
              <div
                className="prose text-[14px] font-normal text-primary_text bg-inherit mb-2"
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHtml(productPromptText),
                }}
              />
              <PillWrapper
                markdown={productTitles}
                messageIndex={-1}
                onPillClick={(_, pill) => handleProductPill(pill)}
              />
            </div>
          </div>
        ) : (
          <EmptyChat />
        )}
        <div className="my-24" ref={messagesEndRef}></div>
      </div>

      {showButton && (
        <button
          className="w-fit bottom-2 self-center h-7 bg-white absolute border border-grey rounded-lg px-2 hover:bg-[#0061F3] text-primary_text hover:text-white"
          onClick={scrollToBottom}
        >
          <Text className="text-[14px] font-medium ">Scroll to bottom</Text>
        </button>
      )}
      <div className="top-[88vh] md:top-[84vh] left-84 px-4 self-center w-100 fixed bg-inherit flex flex-col gap-2">
        <div className="flex items-center gap-1 self-start bg-white border border-grey rounded-full p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setMode("TROUBLESHOOTING")}
            className={`text-[12px] px-3 py-1 rounded-full transition-colors ${
              mode === "TROUBLESHOOTING"
                ? "bg-[#0061F3] text-white"
                : "text-primary_text hover:bg-gray-100"
            }`}
          >
            Troubleshooting
          </button>
          <button
            type="button"
            onClick={() => setMode("KB")}
            className={`text-[12px] px-3 py-1 rounded-full transition-colors ${
              mode === "KB"
                ? "bg-[#0061F3] text-white"
                : "text-primary_text hover:bg-gray-100"
            }`}
          >
            Knowledgebase
          </button>
        </div>
        <Input
          disabled={loading || disabled}
          onKeyDown={onKeyDown}
        //  onFocus={() => !chat_id && setShowInfoModal(true)}
          inputClasssName={`${disabled && "bg-[#0061F3] bg-opacity-10"}`}
          onChange={(event: Event) => setInputValue(event.target.value)}
          value={inputValue}
          placeholder="Ask your query here..."
          prefixIcon={
            <img
              src={ThermaxIcon}
              className="pr-4"
              alt="thermax"
              loading="lazy"
            />
          }
          suffixIcon={
            <div className="flex items-center gap-2">
              <Button
                disabled={loading}
                onClick={handleSend}
                custom_type="secondary"
                className="w-14"
                size="very_small"
                rounded
              >
                <img src={Sent} alt="Sent" loading="lazy" />
              </Button>
            </div>
          }
          fixed_size="full"
        />
      </div>
      {activeCitation && (
        <KbCitationViewerModal
          isOpen={true}
          onClose={() => setActiveCitation(null)}
          documentId={activeCitation.documentId}
          filename={activeCitation.filename}
          page={activeCitation.page}
        />
      )}
      {dislikeModalStatus && <DislikeReason onSubmit={onDislikeSubmit} />}
    </div>
  );
};

export default ChatArea;
