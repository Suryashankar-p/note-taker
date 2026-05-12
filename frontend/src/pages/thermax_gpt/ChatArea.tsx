import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaRobot, FaGlobe, FaFileAlt, FaCloudUploadAlt } from "react-icons/fa";
import { ChevronDownIcon, LightBulbIcon } from "@heroicons/react/24/outline";
import Plot from "react-plotly.js";
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
  CreateChatHistoryStream,
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
import { getFileType } from "../../utils/functions.ts";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import UploadStatusIndicator from "../../components/UploadStatusIndicator";
import { UploadFileModal } from "../../components/Modals/UploadFileModal.tsx";
import { useDocumentUploadWithStatus } from "../../services/hooks/useDocumentUploadWithStatus.ts";
import { iconMapping } from "../../utils/constants.ts";
import { FaLightbulb } from "react-icons/fa6";

const BACKEND_THERMAX_GPT_URL = import.meta.env.VITE_BACKEND_THERMAX_GPT_URL || window.env?.BACKEND_THERMAX_GPT_URL;
interface MediaRendererProps {
  source: { media_type: string; link?: string; chart_data?: any };
  messageIndex: string | number;
  chatId: string | null;
  mediaUrl: string | undefined;
  onFetchMedia: (index: string | number, mediaType: string, link: string) => void;
}

interface MultipleMediaRendererProps {
  sources: { media_type: string; link?: string; chart_data?: any }[];
  messageIndex: number;
  chatId: string | null;
  mediaUrlMap: Record<string, string>;
  onFetchMedia: (index: string | number, mediaType: string, link: string) => void;
}

const MemoizedMarkdown = React.memo(({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className="markdown-content text-[14px] font-normal text-primary_text leading-relaxed"
      components={{
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-2 border-b-2 border-gray-200" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-gray-800 mb-3 mt-5 pb-1 border-b border-gray-300" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-50 italic text-gray-700 rounded-r-md" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-2" {...props} />,
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4 shadow-sm rounded-lg border border-gray-200">
            <table className="w-full table-auto border-collapse" {...props} />
          </div>
        ),
        th: ({ node, ...props }) => <th className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-left font-semibold text-gray-700 text-sm" {...props} />,
        td: ({ node, ...props }) => <td className="border-b border-gray-100 px-4 py-3 text-gray-600 text-sm align-top" {...props} />,
        code: ({ node, className, children, ...props }: any) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !className || !match;
          return !isInline ? (
            <div className="relative group my-4">
              <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => copy(String(children).replace(/\n$/, ''))}
                  className="p-1.5 bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 rounded-lg text-gray-300 transition-all border border-gray-700"
                  title="Copy code"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>
              <pre className="bg-[#0d1117] text-gray-300 p-5 rounded-2xl overflow-x-auto font-mono text-[13px] leading-6 shadow-xl border border-gray-800">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            </div>
          ) : (
            <code className="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-gray-200" {...props}>
              {children}
            </code>
          );
        },
        // Avoid double pre wrapping
        pre: ({ node, children, ...props }) => <>{children}</>,
        a: ({ node, href, children, ...props }) => {
          const isVideo = href?.endsWith(".mp4") || href?.includes("generated_videos");
          const isImage = href?.match(/\.(jpeg|jpg|png|webp|gif)$/i) && href?.includes("generated_videos");
          if (isImage) {
            return (
              <div className="my-6">
                <p className="mb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Generated visualization</p>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-2">
                  <img src={href} alt="Generated visual" className="w-full rounded-xl" />
                </div>
              </div>
            );
          }
          if (isVideo) {
            return (
              <div className="my-6">
                <p className="mb-3 text-xs text-gray-400 font-semibold uppercase tracking-wider">Generated video</p>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-black">
                  <video controls className="w-full">
                    <source src={href} type="video/mp4" />
                  </video>
                </div>
              </div>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 underline-offset-4 font-medium transition-colors" {...props}>
              {children}
            </a>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
});

const MediaRenderer: React.FC<MediaRendererProps> = ({
  source,
  messageIndex,
  chatId,
  mediaUrl,
  onFetchMedia,
}) => {
  const { media_type, link } = source;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (media_type !== "excel" && media_type !== "docx" && media_type !== "ppt" && media_type !== "chart" && !mediaUrl) {
      if (link) {
        onFetchMedia(String(messageIndex), media_type, link);
      }
    }
  }, [messageIndex, mediaUrl, media_type, link, onFetchMedia]);

  const handleDownloadFile = async (mediaType: string, fileLink: string) => {
    try {
      if (!chatId) return;
      const url = new URL(fileLink);
      const filenameParam = url.searchParams.get("filename");
      let defaultExtension = ".xlsx";
      let defaultMimeType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      if (mediaType === "docx") {
        defaultExtension = ".docx";
        defaultMimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (mediaType === "ppt") {
        defaultExtension = ".pptx";
        defaultMimeType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      }
      const fileName =
        filenameParam || `generated_file_${Date.now()}${defaultExtension}`;
      const response = await ReadFile(Number(chatId), mediaType, fileLink);
      const mediaBlob = new Blob([response.data], {
        type: response.headers["content-type"] || defaultMimeType,
      });
      const downloadUrl = URL.createObjectURL(mediaBlob);
      const linkEl = document.createElement("a");
      linkEl.href = downloadUrl;
      linkEl.download = fileName;
      document.body.appendChild(linkEl);
      linkEl.click();
      document.body.removeChild(linkEl);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  if (media_type === "image") {
    return (
      <div className="my-4">
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt="Generated visual"
            className="w-[70%] rounded shadow"
            onError={() => setError("Failed to load image")}
          />
        ) : (
          <div className="w-[70%] h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-50" />
            
            <div className="relative">
              {/* Spinning ring */}
              <div className="absolute inset-[-8px] rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <div className="p-5 bg-white rounded-full shadow-xl relative z-10">
                <svg className="w-10 h-10 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  if (media_type === "video") {
    return (
      <div className="my-4">
        {mediaUrl ? (
          <video
            controls
            src={mediaUrl}
            className="w-[70%] rounded shadow"
            onError={() => setError("Failed to load video")}
          />
        ) : (
          <div className="w-[70%] h-32 bg-gray-200 rounded flex items-center justify-center">
            <p className="text-gray-500">Loading video...</p>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    );
  }

  if (media_type === "excel" || media_type === "docx" || media_type === "ppt") {
    const labels = {
      excel: { text: "Excel Spreadsheet", color: "bg-green-600", hover: "hover:bg-green-700" },
      docx: { text: "Word Document", color: "bg-blue-600", hover: "hover:bg-blue-700" },
      ppt: { text: "PowerPoint Presentation", color: "bg-red-600", hover: "hover:bg-red-700" }
    };
    const config = labels[media_type as keyof typeof labels] || labels.excel;

    return (
      <div className="my-4">
        <button
          onClick={() => handleDownloadFile(media_type, link)}
          className={`${config.color} ${config.hover} text-white px-5 py-2.5 rounded-xl flex items-center gap-3 shadow-md transition-all hover:shadow-lg active:scale-95`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-sm font-semibold">
            Download {config.text}
          </span>
        </button>
      </div>
    );
  }

  if (media_type === "chart" || source.chart_data) {
    return (
      <div className="my-6 w-full h-[420px] bg-white rounded-xl shadow-sm border border-gray-100 p-2 overflow-hidden hover:shadow-md transition-shadow duration-300">
        {source.chart_data ? (
          <Plot
            data={source.chart_data.data}
            layout={{
              ...source.chart_data.layout,
              autosize: true,
            }}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            config={{ responsive: true, displayModeBar: "hover", displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] }}
          />
        ) : (
          <div className="w-full h-full rounded-xl flex items-center justify-center bg-gray-50 animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium font-sans tracking-wide">Generating visual...</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

const MultipleMediaRenderer: React.FC<MultipleMediaRendererProps> = ({
  sources,
  messageIndex,
  chatId,
  mediaUrlMap,
  onFetchMedia,
}) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="my-4 space-y-4">
      {sources.map((source, mediaIndex) => {
        // Create a unique index for each media item
        const uniqueIndex = `${messageIndex}-${mediaIndex}`;
        const mediaUrl = mediaUrlMap[uniqueIndex] || mediaUrlMap[messageIndex];
        
        return (
          <div key={mediaIndex} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="text-sm font-medium text-gray-600 mb-2">
              {source.media_type === 'image' && 'Generated Image'}
              {source.media_type === 'video' && 'Generated Video'}
              {source.media_type === 'excel' && 'Excel File'}
              {source.media_type === 'docx' && 'Word Document'}
              {source.media_type === 'ppt' && 'PowerPoint Presentation'}
              {source.media_type === 'chart' && 'Generated Chart'}
              {source.media_type === 'unknown' && 'Generated File'}
            </div>
            <MediaRenderer 
              source={source} 
              messageIndex={uniqueIndex}
              chatId={chatId} 
              mediaUrl={mediaUrl} 
              onFetchMedia={onFetchMedia} 
            />
          </div>
        );
      })}
    </div>
  );
};

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
  const onNewChatAdditionRef = useRef(onNewChatAddition);
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
  const [videoUrlMap, setVideoUrlMap] = useState<Record<string, string>>({});
  const fetchingRef = useRef<Set<string>>(new Set());
  const [isModalOpen, setModalOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [streamedData, setStreamedData] = useState<string>("");
  const [streamingSource, setStreamingSource] = useState<any>(null);
  const [streamingStatus, setStreamingStatus] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const { upload, uploadState, fileId, status, statusState, isDone } =
    useDocumentUploadWithStatus();

  const [aiProvider, setAiProvider] = useState("GPT 5.4");
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (currentChatType) {
      setAiProvider(currentChatType);
      setIsThinking(currentChatType === "Sonnet 4.6");
    } else {
      setAiProvider("GPT 5.4");
      setIsThinking(false);
    }
  }, [currentChatType]);

  useEffect(() => {
    onNewChatAdditionRef.current = onNewChatAddition;
  }, [onNewChatAddition]);

  useEffect(() => {
    if (chat_id) {
      getPageChat();
    }
  }, [chat_id]);

  // Clear media cache when chat_id changes (navigating between chats)
  useEffect(() => {
    setVideoUrlMap((prev) => {
      Object.values(prev).forEach((url) => URL.revokeObjectURL(url));
      return {};
    });
    fetchingRef.current.clear();
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

    if (chatContent.length === 0) {
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
    if (uploadedFiles.length === 0) {
      setModalOpen(true);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => handleFileChange(file));
      e.dataTransfer.clearData();
    }
  };

  // New function to handle streaming logic
  const startStreaming = (
    chatId: string,
    chat_history_id: string,
    localFiles: any[],
    isNewChat = false,
    thinkingOverride?: boolean,
    isFile?: boolean
  ) => {
    let eventSource: EventSource;
    const evenSourceUrl = BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat/${chatId}/chat_history/stream?chat_history_id=${chat_history_id}&thinking=${thinkingOverride !== undefined ? thinkingOverride : isThinking}&is_file=${isFile}`

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
          if (data.content !== "") {
            setLoading(false);
            setStreamingStatus("text");
          }
          setStreamedData((prev) => prev + data.content);
        } else if (data.type === "tool") {
          setLoading(false);
          setStreamingStatus(data.tool);
          // handleStreamEnd(data.content, chatId, localFiles, isNewChat)
          if (data.tool === "image") {
            // setStreamedData
          }
          // Handle tool usage if needed
        } else if (data.type === "end") {
          // Stream completed
          setStreamingStatus(null);
          // Capture source field if present
          if (data.content?.source) {
            setStreamingSource(data.content.source);
          }
          handleStreamEnd(data.content, chatId, localFiles, isNewChat);
          eventSource.close();
          eventSourceRef.current = null;
        } else if (data.type === "error") {
          console.error("Streaming error:", data.content);
          setStreamingStatus(null);
          handleStreamError(isNewChat ? String(chatId) : undefined);
          eventSource.close();
          eventSourceRef.current = null;
        }
      } catch (parseError) {
        console.error("Error parsing event data:", parseError);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      handleStreamError(isNewChat ? String(chatId) : undefined);
      eventSource.close();
      eventSourceRef.current = null;
    };
  };
  // Handle successful stream completion
  const handleStreamEnd = async (
    data: any,
    chatId: string,
    localFiles: any[],
    isNewChat: boolean
  ) => {
    setStreamedData("");
    setStreamingSource(null);
    // Only evict the streaming slot (-1) so history images stay cached
    setVideoUrlMap((prev) => { const next = { ...prev }; delete next["-1"]; return next; });
    fetchingRef.current.delete("-1");
    setInputValue("");
    setPageError(false);
    setUploadedFiles([]);
    if (data?.type) {
      setCurrentChatType(data.type);
    }
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
      navigate(`/ai-studio/thermax_gpt?chat_id=${chatId}`);
      onNewChatAdditionRef.current();
      setLoading(false);
    } else {
      await getPageChat();
      setLoading(false);
    }
  };

  // Handle stream errors
  const handleStreamError = (newChatId?: string) => {
    setStreamedData("");
    setStreamingSource(null);
    setStreamingStatus(null);
    setPageError(true);
    if (newChatId) {
      navigate(`/ai-studio/thermax_gpt?chat_id=${newChatId}`);
      onNewChatAdditionRef.current();
    } else {
      getPageChat();
    }
    setLoading(false);
    dispatch.toast.openToast({
      status: true,
      message: "Streaming failed. Please try again.",
      type: "error",
    });
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !aiProvider) return;
    setLoading(true);
    setStreamingStatus("thinking");
    const isFile = uploadedFiles?.length > 0;

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

    const localMessages = [...chatContent, ...localFiles];

    try {
      if (chat_id) {
        let chatResponse;
        let streamResponse;

        if (aiProvider === "Sonnet 4.6" || aiProvider === "GPT 5.4") {
          const effectiveThinking = aiProvider === "Sonnet 4.6" ? true : false;
          streamResponse = await CreateChatHistoryStream(
            inputValue,
            chat_id,
            uploadedFiles,
            aiProvider,
            effectiveThinking
          );
          if (streamResponse) {
            startStreaming(chat_id, streamResponse?.id, localMessages, false, effectiveThinking, isFile);
            return; // Exit early for streaming
          }
        }

        // Handle non-streaming responses
        if (chatResponse?.ai) {
          setInputValue("");
          setCurrentChatType(aiProvider);
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
          setPageError(false);
          setUploadedFiles([]);
          await getPageChat();
          setLoading(false);
        } else {
          if (chatResponse?.detail) {
            dispatch.toast.openToast({
              status: true,
              message: chatResponse?.detail,
              type: "error",
            });
          }
          setPageError(true);
          await getPageChat();
          setLoading(false);
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

            if (aiProvider === "Sonnet 4.6" || aiProvider === "GPT 5.4") {
              const effectiveThinking = aiProvider === "Sonnet 4.6" ? true : false;
              streamResponse = await CreateChatHistoryStream(
                inputValue,
                newSessionResponse.id,
                uploadedFiles,
                aiProvider,
                effectiveThinking
              );

              if (streamResponse) {
                startStreaming(
                  newSessionResponse.id,
                  streamResponse?.id,
                  localFiles,
                  true,
                  effectiveThinking,
                  isFile
                );
                return; // Exit early for streaming
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

  const handleRemoveFile = (index: number) => {
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
          <span className=" text-red-500 font-bold text-sm self-center flex justify-center items-center w-8 h-8 rounded-md border border-red-500">
            PDF
          </span>
        );
      case "xlsx":
      case "xls":
      case "Excel":
        return (
          <span className="px-6 text-green-500 font-bold text-sm self-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-green-500">
            {file_name?.split(".").pop()?.toLocaleUpperCase()}
          </span>
        );
      case "doc":
      case "docx":
      case "DOC":
        return (
          <span className="px-4 text-blue-500 font-bold text-sm self-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-blue-500">
            DOC
          </span>
        );
      case "CSV":
        return (
          <span className="px-4 text-green-500 font-bold text-sm self-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-green-500">
            CSV
          </span>
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <span className="px-4 text-yellow-500 font-bold text-sm self-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-yellow-500">
            IMG
          </span>
        );
      default:
        return (
          <span className="px-6 text-gray-500 font-bold text-sm self-center flex justify-center items-center w-8 h-8 rounded-md border-2 border-gray-500">
            {file_name?.split(".").pop()?.toLocaleUpperCase()}
          </span>
        );
    }
  };

  const renderAttachFile = () => {
    return "Attach File (Up to 100MB)";
  };

  const getStreamingStatusText = (status: string | null) => {
    if (!status) return "";
    switch (status) {
      case 'text': return 'Generating response...';
      case 'thinking': return 'Thinking...';
      case 'image': return 'Generating visualization...';
      case 'chart': return 'Creating chart...';
      case 'excel': return 'Preparing spreadsheet...';
      case 'docx': return 'Drafting document...';
      case 'ppt': return 'Building presentation...';
      default: return `Processing ${status}...`;
    }
  };

  // Function to fetch and cache media

  const fetchMedia = useCallback(async (index: string | number, mediaType: string, blobLink: string) => {
    const indexKey = String(index);
    if (fetchingRef.current.has(indexKey)) return;
    fetchingRef.current.add(indexKey);
    try {
      if (!chat_id) {
        fetchingRef.current.delete(indexKey);
        return;
      }
      const response = await ReadFile(Number(chat_id), mediaType, blobLink);
      const mediaBlob = new Blob([response.data], {
        type: response.headers["content-type"] || (mediaType === "video" ? "video/mp4" : "image/jpeg"),
      });
      const objectUrl = URL.createObjectURL(mediaBlob);
      setVideoUrlMap((prev) => ({ ...prev, [indexKey]: objectUrl }));
    } catch (err) {
      console.error("Failed to stream media:", err);
      fetchingRef.current.delete(indexKey);
    }
  }, [chat_id]);

  return (
    <div
      className="flex flex-col w-full pt-12 h-full bg-inherit relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0061F3]/10 backdrop-blur-md pointer-events-none transition-all duration-300">
          <FaCloudUploadAlt className="w-24 h-24 text-primary mb-6" />
          <Text className="text-2xl font-bold">
            Drop files to upload
          </Text>
          <Text className="mt-2" type="small">
            Attach files to your conversation
          </Text>
        </div>,
        document.body
      )}
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
        className="flex-1 overflow-y-auto smooth-scroll px-12 pt-8 pb-60 space-y-2 bg-inherit"
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
                className="flex flex-col bg-inherit w-full gap-4 group"
              >
                <div
                  key={message?.id || message?.tempId || index}
                  className={`flex items-end space-x-2 px-2 overflow-hidden self-end justify-end w-[70%]`}
                >
                  <div
                    className={`inline-block p-4 rounded-2xl shadow-sm ${message?.human
                      ? "bg-gray-100 text-gray-800 border border-gray-200"
                      : "bg-white text-gray-800 border border-gray-100"
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
                  {(message?.ai || message?.source) && !message.file_name && (
                    <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                      <span className="text-gray-600">{"AI"}</span>
                    </div>
                  )}
                  {/* AI Content and Media */}
                  {(message?.ai || message?.source) ? (
                    <div
                      id={`message-${index}`}
                      className="w-full max-w-4xl py-1 px-4 rounded-lg"
                    >
                      {message.ai && <MemoizedMarkdown content={message.ai} />}
                      
                      {message.source && (
                        <div className="mt-4">
                          {message.source.generated_media ? (
                            <MultipleMediaRenderer 
                              sources={message.source.generated_media} 
                              messageIndex={index} 
                              chatId={chat_id} 
                              mediaUrlMap={videoUrlMap} 
                              onFetchMedia={fetchMedia} 
                            />
                          ) : (
                            <MediaRenderer 
                              source={message.source} 
                              messageIndex={index} 
                              chatId={chat_id} 
                              mediaUrl={videoUrlMap[index]} 
                              onFetchMedia={fetchMedia} 
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    !message?.file_name && (loading || streamingStatus) && index === chatContent.length - 1 && !streamedData && (
                      <div className="-ml-12 w-full">
                        <Loading text={getStreamingStatusText(streamingStatus)} />
                      </div>
                    )
                  )}
                </div>

                {(message?.ai || message?.source) && (
                  <div className="flex items-center gap-3 ml-12 -mt-1">
                    <div className="flex items-center bg-white border border-gray-300 rounded-xl shadow-md px-2 py-1 gap-1 hover:border-gray-400 hover:shadow-lg transition-all duration-300">
                      <button 
                        onClick={() => copyToClipboard(index, message)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
                        title="Copy message"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                      <div className="w-[1px] h-4 bg-gray-300 mx-0.5" />
                      <div className="flex items-center px-1.5 gap-1.5 text-gray-600">
                        <Dollar
                          className="h-4 w-4"
                          disabled={disabled}
                          data={message?.price}
                        />
                      </div>
                    </div>
                  </div>
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
                    <MemoizedMarkdown content={streamedData} />
                    
                    {streamingStatus && (
                      <div className="flex items-center gap-2 mt-4 px-1 py-2 bg-gray-50/50 rounded-xl w-fit border border-gray-100/50">
                        <div className="flex gap-1.5 px-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">
                          {getStreamingStatusText(streamingStatus)}
                        </span>
                      </div>
                    )}

                    {/* Handle source field for streaming media */}
                    {streamingSource && (
                      <>
                        {streamingSource?.generated_media ? (
                          <MultipleMediaRenderer 
                            sources={streamingSource.generated_media} 
                            messageIndex={-1} 
                            chatId={chat_id} 
                            mediaUrlMap={videoUrlMap} 
                            onFetchMedia={fetchMedia} 
                          />
                        ) : (
                          <MediaRenderer 
                            source={streamingSource} 
                            messageIndex={-1} 
                            chatId={chat_id} 
                            mediaUrl={videoUrlMap[-1]} 
                            onFetchMedia={fetchMedia} 
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 text-center max-w-5xl mx-auto py-8 animate-in fade-in duration-700">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-14 tracking-tight">How can I assist you today?</h1>
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-fit">
              {[
                { title: "File Summarization", desc: "Extract key insights from documents", prompt: "Summarize the key points from the document I just uploaded." },
                { title: "Word Generation", desc: "Create professional documents", prompt: "Draft a professional Word document based on my requirements." },
                { title: "Excel Generation", desc: "Turn data into spreadsheets", prompt: "Convert this data into a formatted Excel spreadsheet." },
                { title: "PPT Generation", desc: "Build stunning presentations", prompt: "Create a 5-slide PowerPoint presentation about energy trends." },
                { title: "Image Generation", desc: "Visualize ideas instantly", prompt: "Generate a high-quality image of a modern industrial plant." },
                { title: "Chart Generation", desc: "Create interactive visualizations", prompt: "Create a bar chart comparing performance metrics from my data." },
              ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInputValue(item.prompt)}
                  className="flex flex-col items-start p-5 bg-white border border-gray-200 rounded-2xl hover:border-red-500 hover:shadow-xl hover:-translate-y-1 transition-all text-left group"
                >
                  <span className="font-bold text-gray-900 group-hover:text-red-600 mb-1 flex items-center gap-2">
                    {item.title}
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                  <span className="text-sm text-gray-500">{item.desc}</span>
                </button>
              ))}
            </div> */}
          </div>
        )}
        {chatContent?.length > 0 && (
          <div className="mt-12 mb-12" ref={messagesEndRef}></div>
        )}
        {!chatContent?.length && <div ref={messagesEndRef}></div>}
      </div>
      <div className="fixed bottom-6 left-[19%] right-0 px-4 flex flex-col items-center pointer-events-none z-30">
        {showButton && (
          <button
            className="pointer-events-auto mb-4 flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-full px-4 py-2 hover:bg-gray-50 text-gray-700 transition-all active:scale-95 border-b-2 active:border-b-0 translate-y-0 active:translate-y-[2px]"
            onClick={scrollToBottom}
          >
            <svg className="w-4 h-4 text-primary animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-[13px] font-bold">New messages below</span>
          </button>
        )}
        <div className="pointer-events-auto relative w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-[60rem] min-h-4 mx-auto flex flex-col gap-2 border border-gray-200 rounded-[24px] p-4 bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_50px_-12px_rgba(0,0,0,0.12)] transition-shadow duration-300">
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
                  placeholder="Ask anything ..."
                  rows={1}
                  className={`w-full pl-2 max-h-[10rem] min-h-[3rem] resize-none overflow-y-auto p-2 text-md focus:outline-none ${disabled ? "bg-[#0061F3] bg-opacity-10" : "bg-transparent"}`}
                  style={{ lineHeight: "1.9rem" }}
                />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="relative group cursor-pointer">
                        <img
                          src={Attach}
                          className={`w-8 h-8 ${uploadedFiles.length > 0
                            ? "cursor-default opacity-50"
                            : "cursor-pointer"
                            }`}
                          alt="Attach file"
                          loading="lazy"
                          onClick={handleFileAttachClick}
                        />

                        <span
                          className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-sm text-white bg-black rounded shadow-md transition-opacity duration-200 pointer-events-none whitespace-nowrap max-w-[280px] text-ellipsis overflow-hidden ${uploadedFiles.length === 0
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
                        onFileUpload={(files) => files.forEach((file) => handleFileChange(file))}
                        aiProvider={aiProvider}
                        disabled={loading}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        const nextThinking = !isThinking;
                        setIsThinking(nextThinking);
                        if (nextThinking) {
                          setAiProvider("Sonnet 4.6");
                        }
                      }}
                      custom_type="secondary"
                      className={`flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200 rounded-lg ${isThinking
                        ? "!text-primary"
                        : "!text-input_text"
                        }`}
                      size="custom"
                      rounded
                    >
                      {isThinking ?
                        <FaLightbulb className="size-4 text-primary" /> :
                        <LightBulbIcon className="size-4" />
                      }
                      <span className="font-medium text-sm">Deep Search</span>
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <DropDownMenu
                      disabled={isThinking}
                      content={
                        <div className={`w-30 flex justify-between items-center gap-2 px-3 py-2 rounded-full transition bg-primary/10 group ${isThinking ? "opacity-50" : ""}`}>
                          <span className="text-sm font-semibold text-primary">{aiProvider}</span>
                          <ChevronDownIcon className="w-4 h-4 text-primary" />
                        </div>
                      }
                      menuItems={[
                        { title: "Sonnet 4.6", value: "Sonnet 4.6" },
                        { title: "GPT 5.4", value: "GPT 5.4" }
                      ]}
                      onChange={(val) => {
                        setAiProvider(val);
                        if (val === "Sonnet 4.6") {
                          setIsThinking(true);
                        } else if (val === "GPT 5.4") {
                          setIsThinking(false);
                        }
                      }}
                    />
                    <Button
                      disabled={loading || disabled}
                      onClick={handleSend}
                      custom_type="secondary"
                      className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-[#0061F3] text-white"
                      size="very_small"
                    >
                      <img src={Sent} alt="Send" className="mt-1.5" loading="lazy" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ChatArea;