import React, { ChangeEvent, useEffect, useRef, useState } from "react";
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
} from "../../services/troubleshooting.ts";
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

interface Props {
  onNewChatAddition: () => void;
  disabled?: boolean;
  onQuestionAsked?: any;
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
}) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch<Dispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatContent = useSelector(
    (state: RootState) => state.chatContent.chatContent
  );
  const [searchParams] = useSearchParams();
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
  const [visiblePillsIndex, setVisiblePillsIndex] = useState<number | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  useEffect(() => {
    if (chat_id) {
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
        setVisiblePillsIndex(chatContent.length - 1);
      } else {
        setVisiblePills(null);
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

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    // let customer_details = JSON.parse(data || []);
    dispatch.chatContent.addQuestion([{ human: inputValue}]);
    try {
      if (chat_id) {
        const chatResponse = await CreateChatHistory(inputValue, chat_id);
        if (chatResponse?.ai) {
          dispatch.chatContent.removeQuestion();
          dispatch.chatContent.addQuestion([chatResponse]);
          setLoading(false);
          setInputValue("");
          setPageError(false);
        } else {
          if (chatResponse?.detail) {
            dispatch.toast.openToast({
              status: true,
              message: chatResponse?.detail,
              type: "error",
            });
          }
          setPageError(true);
          getPageChat();
        }
      } else {
        const newSessionResponse = await CreateChat(inputValue);
        if (newSessionResponse?.id) {
          try {
            const chatResponse = await CreateChatHistory(
              inputValue,
              newSessionResponse.id
            );
            if (chatResponse?.ai) {
              navigate(
                `/ai-studio/troubleshooting?chat_id=${newSessionResponse?.id}`
              );
              setInputValue("");
              setLoading(false);
              setPageError(false);
              onNewChatAddition();
            } else {
              setCopySuccess(false);
              setLoading(false);
              if (chatResponse?.detail) {
                setPageError(true);
                dispatch.toast.openToast({
                  status: true,
                  message: chatResponse?.detail,
                  type: "error",
                });
              }
              navigate(
                `/ai-studio/troubleshooting?chat_id=${newSessionResponse?.id}`
              );
            }
          } catch (err) {
            console.log("evde", err);
            setLoading(false);
          }
        } else {
          setCopySuccess(false);
          dispatch.toast.openToast({
            status: true,
            message: newSessionResponse?.detail,
            type: "error",
          });
          setLoading(false);
          console.log("error");
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setLoading(false);
      setCopySuccess(false);
      dispatch.toast.openToast({
        status: true,
        message: "Failed",
        type: "error",
      });
    }
    setLoading(false);
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
      const chatResponse = await CreateChatHistory(item, chat_id);
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
      }
    } catch (error) {
      console.error("API error: ", error);
      setPageError(true);
    } finally {
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
    messageIndex: number;
    onPillClick: (index: number, pill: string) => void;
  }

  const PillWrapper: React.FC<PillWrapperProps> = ({
    markdown = [],
    messageIndex,
    onPillClick,
  }) => {
  //  const isPillSelected = selectedPills[messageIndex]?.size > 0;
    return (
      <div className="flex flex-wrap gap-1 mb-4">
        {markdown?.map((item, index) => (
          <Pill
            key={index}
            label={item}
            onClick={() => onPillClick(messageIndex, item)}
            size="large"
            selected={true}
          />
        ))}
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
                          messageIndex={index}
                          onPillClick={handlePill}
                        />
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
                  className="w-28 min-h-8 rounded-full ml-12 -mt-2 border border-grey"
                >
                  <div className="flex flex-row gap-2 mx-2 justify-between">
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
      <div className="top-[88vh] md:top-[84vh] left-84 px-4 self-center w-100 fixed bg-inherit flex ">
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
          }
          fixed_size="full"
        />
      </div>
    </div>
  );
};

export default ChatArea;
