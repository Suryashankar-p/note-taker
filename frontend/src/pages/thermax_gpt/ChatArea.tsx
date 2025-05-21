import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaRobot, FaGlobe  } from "react-icons/fa";
import Input from "../../components/Input.tsx";
import ThermaxIcon from "../../assets/thermax_icon.svg";
import Sent from "../../assets/sent.png";
import "./styles.css";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import Link from "../../assets/link.svg";
import Divide from "../../assets/divider.png";
import Attach from "../../assets/attachment.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import {
  CreateChat,
  CreateChatHistory,
  DeleteChatHistory,
  ReadChatHistories,
  CreateChatHistoryPerplexity,
} from "../../services/thermax_gpt.ts";
import Loading from "../../components/ChatLoading.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import DropDownMenu from "../../components/DropdownMenu";
import Trash from "../../assets/Trash.tsx";
import Dislike from "../../assets/Dislike.tsx";
import LikeIcon from "../../assets/Like.tsx";
import CopyIcon from "../../assets/Copy.tsx";
import DislikeReason from "../../components/Modals/DislikeReason.tsx";
import Dollar from "../../assets/Dollar.tsx";
import EmptyChat from "../../assets/EmptyChat.tsx";
import Toast from "../../components/Toast.tsx";
import copy from "clipboard-copy";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import FileViewModal from "../../components/Modals/FileViewModal.tsx";
import { getFileType } from "../../utils/functions.ts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const currentChatContent = useSelector(
    (state: any) => state.chatContent.chatContent
  );
  const [aiProvider, setAiProvider] = useState("Thermax-GPT");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (chat_id) {
      getPageChat();
    }
  }, [chat_id]);

  useEffect(() => {
    if (pageSize.skip === 0) {
      scrollToBottom();
    }
  }, [chatContent]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [inputValue]);

  useEffect(() => {
    setShowButton(false);
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

    if (currentChatContent.length < 0) {
      setShowButton(false);
    }

    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasReachedEnd]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const getPageChat = async () => {
    setShowButton(false);
    try {
      const response = await ReadChatHistories(
        pageSize?.skip,
        pageSize?.limit,
        chat_id
      );

      if (response?.result) {
        await dispatch.chatContent.clearChat();
        const processedChatHistory = response.result.flatMap((chat: any) => {
          const chats = [chat];
          if (chat.document && chat.document?.document_id) {
            chats.push({
              id: `${chat.id}-doc`,
              type: "document",
              document_id: chat.document.document_id,
              file_name: chat.document.file_name,
              file_size: chat.document.chunk_length,
              chat_id: chat.chat_id,
              created_on: chat.created_on,
            });
          }

          return chats;
        });
        dispatch.chatContent.addChat(processedChatHistory);
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

        navigate(`/ai-studio/thermax_gpt`);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    console.log("aiProvider", aiProvider);

    setLoading(true);

    const localFiles =
      uploadedFiles?.map((file) => ({
        tempId: `temp-${Date.now()}-${file.name}`,
        human: null,
        file_name: file.name,
        file_size: file.size,
        file,
        isPending: true,
      })) || [];

    localFiles.forEach((fileMessage) => {
      dispatch.chatContent.addQuestion([fileMessage]);
    });
    dispatch.chatContent.addQuestion([{ human: inputValue }]);

    const localMessages = [...localFiles, ...chatContent];

    try {
      if (chat_id) {
        let chatResponse;
        if (aiProvider === "Thermax-GPT") {
          chatResponse = await CreateChatHistory(
            inputValue,
            chat_id,
            uploadedFiles?.length > 0 && uploadedFiles[0]
          );
        } else if (aiProvider === "Deep Search") {
          chatResponse = await CreateChatHistoryPerplexity(inputValue, chat_id);
        }
        if (chatResponse?.ai) {
          const updatedChatHistory = [...localMessages, chatResponse];
          if (localFiles?.length > 0) {
            const existingUploads = JSON.parse(
              localStorage.getItem("uploadedFiles") || "{}"
            );
            const updatedUploads = {
              ...existingUploads,
              [chat_id]: [...(existingUploads[chat_id] || []), ...localFiles],
            };
            localStorage.setItem(
              "uploadedFiles",
              JSON.stringify(updatedUploads)
            );
          }
          // dispatch.chatContent.removeQuestion();
          // dispatch.chatContent.addQuestion([chatResponse]);
          dispatch.chatContent.replaceChatHistoryWithLocal({
            apiHistory: updatedChatHistory,
            localMessages: [],
          });
          setInputValue("");
          setLoading(false);
          setPageError(false);
          setUploadedFiles([]);
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
            let chatResponse;
            if (aiProvider === "Thermax-GPT") {
              chatResponse = await CreateChatHistory(
                inputValue,
                newSessionResponse.id,
                uploadedFiles?.length > 0 && uploadedFiles[0]
              );
            } else if (aiProvider === "Deep Search") {
              chatResponse = await CreateChatHistoryPerplexity(
                inputValue,
                newSessionResponse.id
              );
            }
            if (chatResponse?.ai) {
              setInputValue("");
              if (localFiles?.length > 0) {
                // Retrieve previously stored files
                const existingUploads = JSON.parse(
                  localStorage.getItem("uploadedFiles") || "{}"
                );
                const updatedUploads = {
                  ...existingUploads,
                  [newSessionResponse.id]: [
                    ...(existingUploads[newSessionResponse.id] || []),
                    ...localFiles,
                  ],
                };
                localStorage.setItem(
                  "uploadedFiles",
                  JSON.stringify(updatedUploads)
                );
              }
              navigate(
                `/ai-studio/thermax_gpt?chat_id=${newSessionResponse?.id}`
              );
              setUploadedFiles([]);
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
                `/ai-studio/thermax_gpt?chat_id=${newSessionResponse?.id}`
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const onChatDelete = async (item: any) => {
    try {
      await DeleteChatHistory(item.id, item.chat_id);
      getPageChat();
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  const UpdateChat_history = async (
    chat_history_id: number,
    chat_id: number,
    like: boolean
  ) => {
    // try {
    //   let resp = await updateChatHistory(chat_history_id, chat_id, like);
    //   if (resp?.id) {
    //     getPageChat();
    //   } else {
    //     setCopySuccess(false);
    //     dispatch.toast.openToast({
    //       message: resp?.detail,
    //       status: true,
    //       type: "error",
    //     });
    //   }
    // } catch (err) {
    //   console.log("err", err);
    // }
  };

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(" ");
    const initials = nameParts
      ?.slice(0, 2)
      .map((part) => part.charAt(0))
      .join("");
    return initials.toUpperCase();
  };

  const onDislikeClick = (e: any, message: any) => {
    setDefaultChatData(message);
    e.stopPropagation();
    if (message?.like === false) return;
    else {
      dispatch.modal.openDislikeReason("add");
    }
  };

  const onLikeClick = (e: any, message: any) => {
    e.stopPropagation();
    if (message?.like) return;
    else {
      UpdateChat_history(message?.id, message?.chat_id, true);
    }
  };

  // const handleRemoveFile = (index: number) => {
  //   setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  // };
  const handleRemoveFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const onDislikeSubmit = async (data: any) => {
    const dislikeReason =
      data?.dislikeReason === "Other"
        ? data?.customReason
        : data?.dislikeReason;
    // try {
    //   if (defaultChatData) {
    //     const resp = await updateChatHistory(
    //       defaultChatData.id,
    //       defaultChatData?.chat_id,
    //       false,
    //       dislikeReason,
    //       data?.suggestedAnswer
    //     );
    //     if (resp?.id) {
    //       getPageChat();
    //       dispatch.modal.CloseDislikeReason();
    //     } else {
    //       setCopySuccess(false);
    //       dispatch.toast.openToast({
    //         status: true,
    //         message: resp?.detail,
    //         type: "error",
    //       });
    //     }
    //   }
    // } catch (err) {
    //   console.log("err", err);
    // }
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

  const onFileClick = async (file: any) => {};

  const convertMarkdownToHtml = (markdown: string) => {
    const dirtyHtml = marked.parse(markdown, { gfm: true, breaks: true });
    return DOMPurify.sanitize(dirtyHtml);
  };

  const onFileAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFiles((prevFiles) => [...prevFiles, file]);
      const index = uploadedFiles.length;
      setLoadingIndex(index);
      setProgress(0);
      let progressValue = 0;
      const interval = setInterval(() => {
        progressValue += 5;
        setProgress(progressValue);
        if (progressValue >= 105) {
          clearInterval(interval);
          setLoadingIndex(null);
        }
      }, 150);
    }
    event.target.value = null;
  };

  const handleTabChange = (tab) => {
    setAiProvider(tab);
  };

  const renderFileIcon = (file_name: string) => {
    const type = getFileType(file_name);

    switch (type) {
      case "PDF":
        return (
          <span className=" text-red-500 font-bold text-sm self-center items-center flex justify-center items-center w-8 h-8 rounded-md border border-red-500">
            PDF
          </span>
        );
      case "xlsx":
      case "xls":
      case "Excel":
        return (
          <span className="px-6 text-green-500 font-bold text-sm self-center items-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-green-500">
            {file_name?.split(".").pop()?.toLocaleUpperCase()}
          </span>
        );
      case "doc":
      case "docx":
      case "DOC":
        return (
          <span className="px-4 text-blue-500 font-bold text-sm self-center items-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-blue-500">
            DOC
          </span>
        );
      case "CSV":
        return (
          <span className="px-4 text-green-500 font-bold text-sm self-center items-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-green-500">
            CSV
          </span>
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <span className="px-4 text-yellow-500 font-bold text-sm self-center items-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-yellow-500">
            IMG
          </span>
        );
      default:
        return (
          <span className="px-6 text-gray-500 font-bold text-sm self-center items-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-gray-500">
            {file_name?.split(".").pop()?.toLocaleUpperCase()}
          </span>
        );
    }
  };
  const tabs = [
    { label: "Thermax-GPT", icon: <FaRobot className="mr-1" /> },
    { label: "Deep Search", icon: <FaGlobe className="mr-1" /> },
  ];

  const activeIndex = tabs.findIndex(tab => tab.label === aiProvider);

  return (
    <div className="flex flex-col w-full pt-12 h-full bg-inherit">
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
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-scroll smooth-scroll px-12 pt-8 space-y-2 bg-inherit"
      >
        {chatContent?.length > 0 ? (
          chatContent.map((message: any, index: number) => (
            <div
              key={message.id || message.tempId || index}
              className="flex flex-col bg-inherit w-full gap-4"
            >
              <div
                key={message.id || message.tempId || index}
                className={`flex items-end space-x-2 px-2 overflow-hidden self-end justify-end w-[70%]`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message?.human
                      ? "bg-gray-200 text-small break-words"
                      : "bg-inherit text-small break-words"
                  }`}
                >
                  {message?.human && (
                    <Text className="text-primary_text" type="small">
                      {message?.human}
                    </Text>
                  )}
                  {message?.file_name && (
                    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                      {renderFileIcon(message.file_name)}
                      <div className="flex flex-col">
                        <Text
                          className="text-primary_text text-sm font-medium break-all"
                          type="small"
                        >
                          {message.file_name}
                        </Text>
                        <Text className="text-gray-500 text-xs" type="small">
                          {/* {(message.file_size / 1024).toFixed(2)} KB */}
                          {message?.file_size > 0
                            ? message?.file_size < 1024
                              ? `${message?.file_size.toFixed(2)} Bytes`
                              : message?.file_size < 1048576
                              ? `${(message?.file_size / 1024).toFixed(2)} KB`
                              : `${(message?.file_size / 1048576).toFixed(
                                  2
                                )} MB`
                            : ""}
                        </Text>
                      </div>
                      {/* <button
                        onClick={() => onFileClick(message.file)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Download
                      </button> */}
                    </div>
                  )}
                </div>
                {(message?.human || message?.uploadedFiles?.length > 0) && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">
                      {getInitials(userDetails?.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-row items-start justify-start w-full">
                {(message?.ai || loading) && !message.file_name && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">{"AI"}</span>
                  </div>
                )}
                {message?.ai ? (
                  <div
                    id={`message-${index}`}
                    className="max-w-[80%]  py-1 px-4 rounded-lg"
                  >
                    <ReactMarkdown
                      children={message.ai}
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="prose text-[14px] font-normal text-primary_text"
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {props.children}
                          </a>
                        ),
                      }}
                    />
                  </div>
                ) : (
                  !message.file_name &&
                  loading && (
                    <div className="-ml-12 w-full">
                      <Loading />
                    </div>
                  )
                )}
              </div>
              {message.ai && (
                <button
                  disabled={disabled}
                  className="w-20 min-h-8 rounded-full ml-12 -mt-2 border border-grey"
                >
                  <div className="flex flex-row mx-2 justify-between">
                    <CopyIcon
                      disabled={disabled}
                      onClick={() => copyToClipboard(index, message)}
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
        <div ref={messagesEndRef}></div>
      </div>
      <div className="relative">
        {showButton && (
          <button
            className="w-fit top-[-2.5rem] left-[45%] self-center h-7 bg-white absolute border border-grey rounded-lg px-2 hover:bg-[#0061F3] text-primary_text hover:text-white"
            onClick={scrollToBottom}
          >
            <Text className="text-[14px] font-medium ">Scroll to bottom</Text>
          </button>
        )}

        <div className="fixed bottom-4 left-[19%] right-0 px-4 flex items-center justify-start bg-inherit">
          <div className="relative w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-[60rem] min-h-4 mx-auto flex flex-col gap-2 border rounded-2xl p-3 bg-white shadow-lg">
            <div className="w-full flex items-center gap-2">
              <div className="flex flex-col w-full">
                <div className="flex flex-wrap gap-2 mb-1 relative">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex min-h-4 items-center max-w-xl gap-1 bg-gray-200 px-2 py-1 rounded-md text-lg relative"
                    >
                      <div className="relative">
                        {loadingIndex === index && (
                          <div className="absolute inset-0 flex justify-center items-center">
                            <svg
                              className="w-6 h-6 transform -rotate-90"
                              viewBox="0 0 36 36"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                stroke=""
                                strokeWidth="3"
                                fill="none"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="15"
                                stroke="rgb(177, 174, 174)"
                                strokeWidth="3"
                                fill="none"
                                strokeDasharray="94.24777960769379"
                                strokeDashoffset={
                                  progress !== null
                                    ? 94.24777960769379 * (1 - progress / 100)
                                    : 94.24777960769379
                                }
                                style={{
                                  transition:
                                    "stroke-dashoffset 0.1s ease-in-out",
                                }}
                              />
                            </svg>
                          </div>
                        )}
                        {renderFileIcon(file.name)}
                      </div>
                      <span
                        className="w-full truncate overflow-hidden whitespace-nowrap"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <button
                        onClick={() => handleRemoveFile(index)}
                        disabled={loading}
                        className="absolute top-0 right-0 -mr-2 -mt-2 text-red-500 text-xs font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <textarea
                  disabled={loading || disabled}
                  onKeyDown={onKeyDown}
                  maxLength={500}
                  onChange={(event) => setInputValue(event.target.value)}
                  value={inputValue}
                  placeholder={aiProvider === "Thermax-GPT" ? "Ask anything..." : "Search anything..."}
                  rows={1}
                  className={`w-full pl-2 max-h-[10rem] min-h-[3rem] resize-none overflow-y-auto p-2 text-md focus:outline-none ${
                    disabled ? "bg-[#0061F3] bg-opacity-10" : "bg-transparent"
                  }`}
                  style={{ lineHeight: "1.9rem" }}
                />
                <div className="flex items-start justify-start">
                  <div className="relative flex-shrink-0">
                    <div className="relative group cursor-pointer">
                      <img
                        src={Attach}
                        className={`w-8 h-8 ${
                          uploadedFiles.length > 0
                            ? "cursor-default"
                            : "cursor-pointer"
                        }`}
                        alt="Attach file"
                        loading="lazy"
                        onClick={onFileAttachClick}
                      />
                      <span
                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-sm text-white bg-black rounded shadow-md opacity-0 ${
                          uploadedFiles.length === 0
                            ? "group-hover:opacity-100"
                            : "group-hover:opacity-0"
                        } transition-opacity duration-200 w-24 text-center`}
                      >
                        Attach file
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple={false}
                        disabled={uploadedFiles.length > 0}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  <div className="flex justify-start mb-2 ml-4 px-1">
      <div className="relative inline-flex rounded-lg overflow-hidden bg-gray-200">
        {/* Sliding background indicator */}
        <div
          className="absolute top-0 bottom-0 left-0 w-1/2 bg-white rounded-lg border border-red-600 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(${activeIndex * 100}%)`,
            zIndex: 0,
          }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleTabChange(tab.label)}
            className={`relative z-10 flex items-center justify-center  px-4 py-1 text-sm font-medium transition-colors duration-300 rounded-lg
              ${
                aiProvider === tab.label
                  ? "text-red-600"
                  : "text-red-300 hover:text-red-600"
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
                </div>
              </div>
              <Button
                disabled={loading}
                onClick={handleSend}
                custom_type="secondary"
                className="flex-shrink-0 w-14 h-14 mt-1.5 flex items-center justify-center rounded-full bg-[#0061F3] text-white"
                size="very_small"
                rounded
              >
                <img src={Sent} alt="Send" loading="lazy" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
