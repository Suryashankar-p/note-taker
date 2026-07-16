import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Input from "../../components/Input";
import ThermaxIcon from "../../assets/thermax_icon.svg";
import Sent from "../../assets/sent.png";
import "./styles.css";
import Button from "../../components/Button";
import Text from "../../components/Text";
import Link from "../../assets/link.svg";
import Divide from "../../assets/divider.png";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import {
  CreateChat,
  CreateChatHistory,
  DeleteChatHistory,
  ReadChatHistories,
  ReadFeedbackWithid,
  ReadProductDocumentUrl,
  ReadQAWithid,
  updateChatHistory,
} from "../../services/edge.ts";
import Loading from "../../components/ChatLoading";
import { useNavigate, useSearchParams } from "react-router-dom";
import Trash from "../../assets/Trash";
import CopyIcon from "../../assets/Copy";
import DislikeReason from "../../components/Modals/DislikeReason";
import Dollar from "../../assets/Dollar";
import EmptyChat from "../../assets/EmptyChat";
import Toast from "../../components/Toast";
import copy from "clipboard-copy";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import FileViewModal from "../../components/Modals/FileViewModal.tsx";
import { getFileType } from "../../utils/functions.ts";
import FeedbackQAViewer from "../../components/Modals/FeedbackQAViewer.tsx";

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
  const [defaultChatData, setDefaultChatData] = useState<any>();
  const [copySuccess, setCopySuccess] = useState(false);
  const [pageError, setPageError] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 100 });
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState();
  const [chatUpdated, setChatUpdated] = useState(0);

  const updateChat = () => {
    setChatUpdated((prev) => prev + 1); // Increment counter
  };

  useEffect(() => {
    scrollToBottom()
    return () => {
      setChatUpdated(0)
    }
  }, [chatUpdated])

  const [feedbackShow, setFeedbackShow] = useState(false);

  useEffect(() => {
    if (chat_id) {
      getPageChat();
    }
  }, [chat_id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

      setShowButton(scrollTop + clientHeight < scrollHeight);
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
  }, []); // chatContent dependency removed


  useEffect(() => {
    scrollToBottom(); // Ensures scroll happens when chatContent updates
  }, [chatContent]);

  // Scroll only on the first render
  useEffect(() => {
    scrollToBottom(); // Ensures scroll happens after the first render
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 5);
    }
  };

  const getPageChat = async () => {
    try {
      const response = await ReadChatHistories(
        pageSize?.skip,
        pageSize?.limit,
        chat_id
      );
      if (response?.result) {
        await dispatch.chatContent.clearChat();
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
        navigate(`/ai-studio/edge`);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    dispatch.chatContent.addQuestion([{ human: inputValue }]);
    updateChat()
    onQuestionAsked?.(inputValue);
    try {
      if (chat_id) {
        const chatResponse = await CreateChatHistory(inputValue, chat_id);
        if (chatResponse?.ai) {
          dispatch.chatContent.removeQuestion();
          dispatch.chatContent.addQuestion([chatResponse]);
          updateChat()
          // await getPageChat()
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
              navigate(`/ai-studio/edge?chat_id=${newSessionResponse?.id}`);
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
              navigate(`/ai-studio/edge?chat_id=${newSessionResponse?.id}`);
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

  const onDislikeSubmit = async (data: any) => {
    const dislikeReason =
      data?.dislikeReason === "Other"
        ? data?.customReason
        : data?.dislikeReason;
    try {
      if (defaultChatData) {
        const resp = await updateChatHistory(
          defaultChatData.id,
          defaultChatData?.chat_id,
          false,
          dislikeReason,
          data?.suggestedAnswer
        );
        if (resp?.id) {
          getPageChat();
          dispatch.modal.CloseDislikeReason();
        } else {
          setCopySuccess(false);
          dispatch.toast.openToast({
            status: true,
            message: resp?.detail,
            type: "error",
          });
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

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

  const onFileClick = async (file: any) => {
    try {
      if (file?.product_id) {
        const linkResp = await ReadProductDocumentUrl(file);
        const blobUrl = URL.createObjectURL(linkResp.data);
        if (blobUrl) {
          let fileInfo: any = {
            name: file.name,
            type: getFileType(file?.name),
            url: blobUrl,
          };
          setFileData(fileInfo);
          setFileShow(true);
        } else {
          setCopySuccess(false);
          dispatch.toast.openToast({
            status: true,
            message: "File not found",
            type: "error",
          });
        }
      } else if (file?.feedback_knowledge_id) {
        const feedback_response = await ReadFeedbackWithid(
          file?.feedback_knowledge_id
        );
        if (feedback_response?.updated_answer) {
          setFileData({ ...feedback_response, name: file.name, question: feedback_response.updated_question, answer: feedback_response.updated_answer });
          setFeedbackShow(true);
        } else {
          setCopySuccess(false);
          dispatch.toast.openToast({
            status: true,
            message: "File not found",
            type: "error",
          });
        }
      } else if (file?.qa_knowledge_id) {
        const qa_response = await ReadQAWithid(file?.qa_knowledge_id);
        if (qa_response?.answer) {
          setFileData({ ...qa_response, name: file.name });
          setFeedbackShow(true);
        } else {
          setCopySuccess(false);
          dispatch.toast.openToast({
            status: true,
            message: "File not found",
            type: "error",
          });
        }
      }
    } catch (err) {
      console.log("err", err);
    }
  };

  const convertMarkdownToHtml = async (markdown: string) => {
    try {
      const dirtyHtml: string = await marked.parse(markdown, {
        gfm: true,
        breaks: true,
      });
      return DOMPurify.sanitize(dirtyHtml);
    } catch (error) {
      console.error("Error parsing markdown:", error);
      return "Error processing content.";
    }
  };

  const MarkdownRenderer = ({ message }: { message: { ai: string } }) => {
    const [htmlContent, setHtmlContent] = useState<string>("");

    useEffect(() => {
      if (message?.ai) {
        convertMarkdownToHtml(message.ai).then(setHtmlContent);
      }
    }, [message?.ai]);

    return (
      <div
        className="prose text-[14px] font-normal text-primary_text bg-white"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  return (
    <div className="flex flex-col w-full position-fixed h-full bg-inherit ">
      {dislikeModalStatus && <DislikeReason onSubmit={onDislikeSubmit} />}
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
      {fileShow && (
        <FileViewModal
          fileUrl={fileData}
          isOpen={fileShow}
          onClose={() => setFileShow(false)}
        />
      )}
      {
        feedbackShow && (
          <FeedbackQAViewer
            data={fileData}
            isOpen={feedbackShow}
            onClose={() => setFeedbackShow(false)}
          />
        )
      }
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto smooth-scroll p-4 pb-8 space-y-8 max-w-[65vw] bg-inherit"
      >
        {chatContent?.length > 0 ? (
          chatContent.map((message: any, index: number) => (
            <div key={index} className="flex flex-col bg-inherit ">
              <div
                key={index}
                className={`flex items-start space-x-2 justify-start w-full bg-inherit overflow-hidden`}
              >
                {message?.human && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">
                      {getInitials(userDetails?.name)}
                    </span>
                  </div>
                )}
                <div
                  className={`inline-block p-2 rounded-lg bg-white overflow-hidden ${message?.human
                    ? "bg-inherit text-small break-words"
                    : "bg-inherit text-small pl-14 break-words"
                    }`}
                >
                  <Text className="text-primary_text" type="small">
                    {message?.human}
                  </Text>
                  <div
                    id={`message-${index}`}
                    className="markdown-body max-w-[58vw] overflow-hidden bg-white"
                    style={{
                      backgroundColor: "white",
                      border: "none",
                      outline: "none",
                    }}
                  >
                    <MarkdownRenderer message={message} />
                  </div>
                </div>
              </div>

              <div className="flex flex-row flex-wrap gap-2">
                {message?.ai?.replace(/\\n/g, "\n") &&
                  message?.source?.sources?.map((file: any, index: number) => (
                    <button
                      key={index}
                      className="rounded-full ml-[3.5vw] px-2 p-1 w-fit h-fit border border-grey items-center flex flex-row justify-between"
                      onClick={() => onFileClick(file)}
                    >
                      <img className="pb-1" src={Link} alt="Link" />
                      <div className="flex flex-col">
                        <Text
                          className="text-primary_text mx-1 whitespace-normal max-w-[45rem] break-all text-start"
                          type="small"
                        >
                          {file?.name}
                        </Text>
                      </div>
                    </button>
                  ))}
              </div>
              {message.ai ? (
                <button
                  disabled={disabled}
                  className="w-fit min-h-8 rounded-full ml-12 mt-4 border border-grey"
                >
                  <div className="flex flex-row mx-2 justify-between">
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
              ) : (
                loading && <Loading />
              )}
            </div>
          ))
        ) : (
          <EmptyChat />
        )}
        <div ref={messagesEndRef}></div>
      </div>
      {showButton && (
        <button
          className="w-fit bottom-2 left-[45%]  h-7 bg-white absolute border border-grey rounded-lg px-2 hover:bg-[#0061F3] text-primary_text hover:text-white"
          onClick={scrollToBottom}
        >
          <Text className="text-[14px] font-medium ">Scroll to bottom</Text>
        </button>
      )}
      <div className="top-[84vh] left-[17vw] px-4 self-center min-w-[83vw] fixed bg-inherit flex ">
        <Input
          disabled={loading || disabled}
          onKeyDown={onKeyDown}
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
          fixed_size="very_large"
        />
      </div>
    </div>
  );
};

export default ChatArea;
