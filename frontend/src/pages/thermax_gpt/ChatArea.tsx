import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { FaRobot, FaGlobe, FaFileAlt } from "react-icons/fa";
import Input from "../../components/Input.tsx";
import ThermaxIcon from "../../assets/thermax_icon.svg";
import Sent from "../../assets/sent.png";
import "./styles.css";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import Link from "../../assets/link.svg";
import Divide from "../../assets/divider.png";
import Attach from "../../assets/attachment.svg";
import ChevronDown from "../../assets/chevron_down.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import {
  CreateChat,
  CreateChatHistory,
  DeleteChatHistory,
  ReadChatHistories,
  CreateChatHistoryPerplexity,
  CreateDocumentAnalyserChatHistory,
  CreateChatHistoryStream,
  CreatePerplexityStream,
  ReadFile,
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
import { marked, use } from "marked";
import DOMPurify from "dompurify";
import "github-markdown-css/github-markdown.css";
import FileViewModal from "../../components/Modals/FileViewModal.tsx";
import { getFileType, selectEvensourceUrl } from "../../utils/functions.ts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import UploadStatusIndicator from "../../components/UploadStatusIndicator";
import { UploadFileModal } from "../../components/Modals/UploadFileModal.tsx";
// import { useDocumentUploadWebSocket } from "../../services/hooks/useDocumentUploadWebSocket.ts";
import { useDocumentUploadWithStatus } from "../../services/hooks/useDocumentUploadWithStatus.ts";
import { set } from "react-hook-form";
import { iconMapping } from "../../utils/constants.ts";

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
  const access_details = useSelector(
    (state: RootState) => state.memberRole.details
  ).thrmx_gpt_user_service_mapping;

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
  const [currentChatType, setCurrentChatType] = useState<string>("");
  const [progress, setProgress] = useState<number | null>(null);
  const [videoUrlMap, setVideoUrlMap] = useState<Record<number, string>>({});
  const currentChatContent = useSelector(
    (state: any) => state.chatContent.chatContent
  );
  const [isModalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streamedData, setStreamedData] = useState<string>("");
  const [streamingSource, setStreamingSource] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { upload, uploadState, fileId, status, statusState, isDone } =
    useDocumentUploadWithStatus();

  const [aiProvider, setAiProvider] = useState(() => {
    return currentChatType || "Thermax GPT";
  });

  useEffect(() => {
    if (
      currentChatType &&
      access_details.some(
        (d) => d.title.toLowerCase() === currentChatType.toLowerCase()
      )
    ) {
      setAiProvider(currentChatType);
    } else {
      setAiProvider(access_details?.[0]?.title);
    }
  }, [currentChatType, access_details]);

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
        // Handle load more if needed
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

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(videoUrlMap).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const getPageChat = async () => {
    setStreamedData("");
    setShowButton(false);
    try {
      const response = await ReadChatHistories(
        pageSize?.skip,
        pageSize?.limit,
        chat_id
      );
      if (response?.result) {
        await dispatch.chatContent.clearChat();
        setCurrentChatType(response.result[response.result.length - 1]?.type);
        const documentLastIndexMap = new Map<string, number>();

        response.result.forEach((chat: any, index: number) => {
          const doc = chat.document;
          if (doc?.document_id) {
            documentLastIndexMap.set(doc.document_id, index);
          }
        });

        const processedChatHistory: any[] = [];

        response.result.forEach((chat: any, index: number) => {
          processedChatHistory.push(chat);

          const doc = chat.document;
          const isLastAppearance =
            doc?.document_id &&
            documentLastIndexMap.get(doc.document_id) === index;

          if (isLastAppearance) {
            processedChatHistory.push({
              id: `${chat.id}-doc`,
              type: "document",
              document_id: doc.document_id,
              file_name: doc.file_name,
              file_size: doc.chunk_length,
              chat_id: chat.chat_id,
              created_on: chat.created_on,
            });
          }
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
  const handleFileAttachClick = () => {
    if (uploadedFiles.length === 0 && aiProvider !== "Deep Search") {
      setModalOpen(true);
    }
  };

  // New function to handle streaming logic
  const startStreaming = (
    chatId: string,
    chat_history_id: string,
    localFiles: any[],
    isNewChat = false
  ) => {
    let eventSource: EventSource;
    const evenSourceUrl = selectEvensourceUrl(
      aiProvider,
      chatId,
      chat_history_id
    );

    eventSource = new EventSource(evenSourceUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("EventSource connection opened");
    };

    eventSource.onmessage = (event) => {
      if (!event.data || event.data.trim() === "") {
        // Ignore heartbeats/empty events
        return;
      }
      try {
        const data = JSON.parse(event.data);
        if (data.type === "text" && data.content) {
          // Accumulate streaming content
          if (data.content !== "") setLoading(false);
          setStreamedData((prev) => prev + data.content);
        } else if (data.type === "tool") {
          // handleStreamEnd(data.content, chatId, localFiles, isNewChat)
          if (data.tool === "image") {
            // setStreamedData
          }
          // Handle tool usage if needed
        } else if (data.type === "end") {
          // Stream completed
          // Capture source field if present
          if (data.content?.source) {
            setStreamingSource(data.content.source);
          }
          handleStreamEnd(data.content, chatId, localFiles, isNewChat);
          eventSource.close();
          eventSourceRef.current = null;
        } else if (data.type === "error") {
          console.error("Streaming error:", data.content);
          handleStreamError();
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (parseError) {
        console.error("Error parsing event data:", parseError);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      handleStreamError();
      eventSource.close();
      eventSourceRef.current = null;
    };
  };
  // Handle successful stream completion
  const handleStreamEnd = (
    data: any,
    chatId: string,
    localFiles: any[],
    isNewChat: boolean
  ) => {
    setStreamedData(""); // Clear streamed data
    setStreamingSource(null); // Clear streaming source
    setInputValue("");
    setLoading(false);
    setPageError(false);
    setUploadedFiles([]);
    const updatedChatHistory = [...localFiles, data];
    // Store uploaded files if any
    if (localFiles?.length > 0) {
      const existingUploads = JSON.parse(
        localStorage.getItem("uploadedFiles") || "{}"
      );
      const updatedUploads = {
        ...existingUploads,
        [chatId]: [...(existingUploads[chatId] || []), ...localFiles],
      };
      localStorage.setItem("uploadedFiles", JSON.stringify(updatedUploads));
    }

    if (isNewChat) {
      dispatch.chatContent.replaceChatHistoryWithLocal({
        apiHistory: updatedChatHistory,
        localMessages: [],
      });
      navigate(`/ai-studio/thermax_gpt?chat_id=${chatId}`);
      onNewChatAddition();
    } else {
      // Refresh chat content for existing chat
      // getPageChat();
      dispatch.chatContent.replaceChatHistoryWithLocal({
        apiHistory: updatedChatHistory,
        localMessages: [],
      });
    }
  };

  // Handle stream errors
  const handleStreamError = () => {
    setStreamedData("");
    setStreamingSource(null);
    setLoading(false);
    setPageError(true);
    dispatch.toast.openToast({
      status: true,
      message: "Streaming failed. Please try again.",
      type: "error",
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !aiProvider) return;
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

    // Add local messages to chat
    localFiles.forEach((fileMessage) => {
      dispatch.chatContent.addQuestion([fileMessage]);
    });
    dispatch.chatContent.addQuestion([{ human: inputValue }]);

    const localMessages = [...localFiles, ...chatContent];

    try {
      if (chat_id && currentChatType === aiProvider) {
        let chatResponse;
        let streamResponse;

        if (aiProvider === "Thermax GPT") {
          streamResponse = await CreateChatHistoryStream(
            inputValue,
            chat_id,
            uploadedFiles?.length > 0 && uploadedFiles[0]
          );
          if (streamResponse) {
            startStreaming(chat_id, streamResponse?.id, localMessages, false);
            return; // Exit early for streaming
          }
        } else if (aiProvider === "Deep Search") {
          // chatResponse = await CreateChatHistoryPerplexity(inputValue, chat_id);
          const perplexityStreamResponse = await CreatePerplexityStream(
            inputValue,
            chat_id
          );
          if (perplexityStreamResponse) {
            startStreaming(
              chat_id,
              perplexityStreamResponse?.id,
              localMessages,
              false
            );
            return;
          }
        } else if (aiProvider === "Document Analyzer") {
          let body = {
            question: inputValue,
            document_ids: fileId ? [fileId] : undefined,
          };
          chatResponse = await CreateDocumentAnalyserChatHistory(body, chat_id);
        }

        // Handle non-streaming responses
        if (chatResponse?.ai) {
          setInputValue("");
          const updatedChatHistory = [...localFiles, chatResponse];
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
          dispatch.chatContent.replaceChatHistoryWithLocal({
            apiHistory: updatedChatHistory,
            localMessages: [],
          });
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
          setLoading(false);
          getPageChat();
        }
      } else {
        // Create new chat
        let payload = {
          title: inputValue,
          type: aiProvider,
        };
        const newSessionResponse = await CreateChat(payload);

        if (newSessionResponse?.id) {
          try {
            let chatResponse;
            let streamResponse;

            if (aiProvider === "Thermax GPT") {
              streamResponse = await CreateChatHistoryStream(
                inputValue,
                newSessionResponse.id,
                uploadedFiles?.length > 0 && uploadedFiles[0]
              );

              if (streamResponse) {
                startStreaming(
                  newSessionResponse.id,
                  streamResponse?.id,
                  localFiles,
                  true
                );
                return; // Exit early for streaming
              }
            } else if (aiProvider === "Deep Search") {
              const perplexityStreamResponse = await CreatePerplexityStream(
                inputValue,
                newSessionResponse.id
              );
              if (perplexityStreamResponse) {
                startStreaming(
                  newSessionResponse.id,
                  perplexityStreamResponse?.id,
                  localFiles,
                  true
                );
              }
            } else if (aiProvider === "Document Analyzer") {
              if (uploadedFiles?.length > 0) {
                let body = {
                  question: inputValue,
                  document_ids: fileId ? [fileId] : undefined,
                };
                chatResponse = await CreateDocumentAnalyserChatHistory(
                  body,
                  newSessionResponse.id
                );
              } else {
                setCopySuccess(false);
                setLoading(false);
                dispatch.toast.openToast({
                  status: true,
                  message: "Please attach a document to analyze.",
                  type: "error",
                });
                return;
              }
            }

            // Handle non-streaming responses for new chat
            if (chatResponse?.ai) {
              setInputValue("");
              if (localFiles?.length > 0) {
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
            console.log("Error in new chat creation:", err);
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
    // Implementation for updating chat history
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

  const handleRemoveFile = (index: number) => {
    if (aiProvider === "Document Analyzer") {
      // cancelUpload if needed
    }
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDislikeSubmit = async (data: any) => {
    const dislikeReason =
      data?.dislikeReason === "Other"
        ? data?.customReason
        : data?.dislikeReason;
    // Implementation for dislike submission
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

  const handleFileChange = async (file: any) => {
    if (!file) return;

    if (aiProvider === "Document Analyzer") {
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTypes.includes(file.type)) {
        alert(
          "Invalid file type. Please upload a PDF or Word document (.doc/.docx)."
        );
        return;
      }
      try {
        setLoadingIndex(uploadedFiles.length);
        setProgress(0);
        await upload(file);
        setLoadingIndex(null);
        setProgress(100);
      } catch (err) {
        console.error("Upload failed:", err);
      }
      setUploadedFiles((prevFiles) => [...prevFiles, file]);
    } else {
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
  };

  const handleTabChange = (tab) => {
    setUploadedFiles([]);
    setAiProvider(tab);
    localStorage.setItem("aiProvider", tab);
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

  const tabs =
  // Remove this to enable Deep Search(Preplexity)
    access_details?.filter((service) => service.title !== "Deep Search").map((service) => ({
      label: service.title,
      icon: iconMapping[service.title],
    })) ?? []; // fallback to []

  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.label === aiProvider),
    0
  );

  const renderAttachFile = () => {
    switch (aiProvider) {
      case "Thermax GPT":
        return "Attach File (Up to 10MB)";
      case "Deep Search":
        return null;
      case "Document Analyzer":
        return "Attach PDF Document (No size limit)";
      default:
        return "Attach File (Up to 10MB)";
    }
  };

  // Function to fetch and cache media
  const fetchMedia = async (index: number, mediaType: string, blobLink: string) => {
    try {
      // Avoid refetching the same media
      if (videoUrlMap[index]) return;
      const response = await ReadFile(Number(chat_id), mediaType, blobLink);
      const mediaBlob = new Blob([response.data], {
        type: response.headers["content-type"] || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
      });
      const objectUrl = URL.createObjectURL(mediaBlob);
      setVideoUrlMap((prev) => ({
        ...prev,
        [index]: objectUrl,
      }));
    } catch (err) {
      console.error("Failed to stream media:", err);
    }
  };

  // Component to render media based on source field
  const MediaRenderer = ({ source, messageIndex }: { source: any; messageIndex: number }) => {
    const { media_type, link } = source;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      // Start fetching media when component mounts
      fetchMedia(messageIndex, media_type, link);
    }, [messageIndex, media_type, link]);

    const mediaUrl = videoUrlMap[messageIndex];

    if (media_type === 'image') {
      return (
        <div className="my-4">
          <p className="mb-2 text-sm text-gray-600">
            Generated image:
          </p>
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Generated visual"
              className="w-[70%] rounded shadow"
              onError={(e) => {
                console.error('Failed to load generated image:', link);
                setError('Failed to load image');
              }}
            />
          ) : (
            <div className="w-[70%] h-32 bg-gray-200 rounded flex items-center justify-center">
              <p className="text-gray-500">Loading image...</p>
            </div>
          )}
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      );
    }

    if (media_type === 'video') {
      if (!mediaUrl) {
        return (
          <div className="my-4">
            <p className="mb-2 text-sm text-gray-600">
              Generated video:
            </p>
            <div className="w-[70%] h-32 bg-gray-200 rounded flex items-center justify-center">
              <p className="text-gray-500">Loading video...</p>
            </div>
          </div>
        );
      }
      return (
        <div className="my-4">
          <p className="mb-2 text-sm text-gray-600">
            Generated video:
          </p>
          <video
            controls
            src={mediaUrl}
            className="w-[70%] rounded shadow"
            onError={(e) => {
              console.error('Failed to load generated video:', link);
              setError('Failed to load video');
            }}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      );
    }

    if (media_type === 'file') {
      return (
        <div className="my-4">
          <p className="mb-2 text-sm text-gray-600">
            Generated file:
          </p>
          <button
            onClick={() => window.open(link, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Download File
          </button>
        </div>
      );
    }

    return null;
  };

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
        <div
          id={`message-`}
          className="w-full max-w-4xl  py-1 px-4 rounded-lg"
        ></div>
        {chatContent?.length > 0 || streamedData ? (
          <>
            {chatContent.map((message: any, index: number) => (
              <div
                key={message?.id || message?.tempId || index}
                className="flex flex-col bg-inherit w-full gap-4"
              >
                <div
                  key={message?.id || message?.tempId || index}
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
                      <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2">
                        {renderFileIcon(message.file_name)}
                        <div className="flex flex-col">
                          <Text
                            className="text-primary_text text-sm font-medium break-all"
                            type="small"
                          >
                            {message?.file_name}
                          </Text>
                          <Text className="text-gray-500 text-xs" type="small">
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

                <div className="flex flex-row items-start justify-start w-[100%]">
                  {(message?.ai || loading) && !message.file_name && (
                    <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">{"AI"}</span>
                    </div>
                  )}

                  {message?.ai ? (
                    <div
                      id={`message-${index}`}
                      className="w-full max-w-4xl py-1 px-4 rounded-lg"
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        className="prose prose-sm w-full max-w-none text-[14px] font-normal text-primary_text"
                        components={{
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto">
                              <table className="w-full table-auto border-collapse break-words">
                                {props.children}
                              </table>
                            </div>
                          ),
                          th: ({ node, ...props }) => (
                            <th className="border px-4 py-2 text-left font-semibold bg-gray-100">
                              {props.children}
                            </th>
                          ),
                          td: ({ node, ...props }) => (
                            <td className="border px-4 py-2 align-top">
                              {props.children}
                            </td>
                          ),
                          a: ({ node, href, children, ...props }) => {
                            const isVideo =
                              href?.endsWith(".mp4") ||
                              href?.includes("generated_videos");

                            const isImage =
                              href?.match(/\.(jpeg|jpg|png|webp|gif)$/i) &&
                              href?.includes("generated_videos");
                            if (isImage) {
                              return (
                                <div className="my-4">
                                  <p className="mb-2 text-sm text-gray-600">
                                    Here is the generated image:
                                  </p>
                                  <img
                                    src={href}
                                    alt="Generated visual"
                                    className="w-[70%] rounded shadow"
                                  />
                                </div>
                              );
                            }

                            return (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                {...props}
                                className="text-blue-600 underline"
                              >
                                {children}
                              </a>
                            );
                          },
                        }}
                      >
                        {message?.ai}
                      </ReactMarkdown>
                      {/* Handle source field for generated media */}
                      {message?.source && (
                        <MediaRenderer source={message.source} messageIndex={index} />
                      )}
                    </div>
                  ) : (
                    !message?.file_name &&
                    loading && (
                      <div className="-ml-12 w-full">
                        <Loading />
                      </div>
                    )
                  )}
                </div>

                {message?.ai && (
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
            ))}

            {/* Streaming AI bubble */}
            {streamedData && (
              <div className="flex flex-col bg-inherit w-full gap-4">
                <div className="flex flex-row items-start justify-start w-[100%]">
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">{"AI"}</span>
                  </div>
                  <div className="w-full max-w-4xl py-1 px-4 rounded-lg">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      className="prose prose-sm w-full max-w-none text-[14px] font-normal text-primary_text"
                      >
                      {streamedData}
                    </ReactMarkdown>
                    {/* Handle source field for streaming media */}
                    {streamingSource && (
                      <MediaRenderer source={streamingSource} messageIndex={-1} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyChat />
        )}
        <div className="mt-12 mb-12" ref={messagesEndRef}></div>
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
                      className="flex min-h-4 items-center max-w-xl gap-1 px-2 py-1 rounded-md text-lg relative"
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
                        className="w-32 text-sm truncate overflow-hidden whitespace-nowrap"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      {uploadState?.status !== "success" && (
                        <button
                          onClick={() => handleRemoveFile(index)}
                          disabled={loading}
                          className="absolute top-0 right-0 -mr-2 -mt-2 text-red-500 text-xs font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <UploadStatusIndicator uploadStatus={status} />
                </div>
                <textarea
                  disabled={loading || disabled}
                  onKeyDown={onKeyDown}
                  maxLength={5000}
                  onChange={(event) => setInputValue(event.target.value)}
                  value={inputValue}
                  placeholder={
                    aiProvider === "Thermax GPT"
                      ? "Ask anything ..."
                      : aiProvider === "Deep Search"
                      ? "Search anything..."
                      : "Ask questions related to the uploaded document..."
                  }
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
                          uploadedFiles.length > 0 ||
                          aiProvider === "Deep Search"
                            ? "cursor-default opacity-50"
                            : "cursor-pointer"
                        }`}
                        alt="Attach file"
                        loading="lazy"
                        onClick={handleFileAttachClick}
                      />

                      <span
                        className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-sm text-white bg-black rounded shadow-md transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-[280px] text-ellipsis overflow-hidden ${
                          uploadedFiles.length === 0 &&
                          aiProvider !== "Deep Search"
                            ? "opacity-0 group-hover:opacity-70"
                            : "hidden"
                        }`}
                      >
                        {renderAttachFile()}
                      </span>
                    </div>
                    <UploadFileModal
                      isOpen={isModalOpen}
                      onClose={() => setModalOpen(false)}
                      onFileUpload={(file) => handleFileChange(file)}
                      aiProvider={aiProvider}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex justify-start mb-2 ml-4 px-1">
                    <div className="relative inline-flex bg-gray-200 rounded-lg overflow-hidden min-w-[200px]">
                      {/* Sliding background indicator */}
                      <div
                        className="absolute top-0 bottom-0 bg-white border border-red-600 transition-transform duration-300 ease-in-out rounded-lg"
                        style={{
                          width: `${100 / tabs.length}%`,
                          transform: `translateX(${activeIndex * 100}%)`,
                          zIndex: 0,
                        }}
                      />

                      {/* Tab Buttons */}
                      {tabs.map((tab) => {
                        const isActive = aiProvider === tab.label;
                        return (
                          <button
                            key={tab.label}
                            onClick={() => handleTabChange(tab.label)}
                            className={`relative z-10 flex items-center justify-center gap-2 px-5 py-1 text-sm font-medium transition-colors duration-300 whitespace-nowrap
              ${isActive ? "text-red-600" : "text-red-300 hover:text-red-600"}`}
                            style={{ width: "200px" }}
                          >
                            {tab.icon}
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                disabled={loading || disabled}
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
