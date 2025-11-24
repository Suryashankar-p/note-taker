import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Input from "../../components/Input.tsx";
import ThermaxIcon from "../../assets/thermax_icon.svg";
import Sent from "../../assets/sent.png";
import "./styles.css";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import Link from "../../assets/link.svg";
import Divide from "../../assets/divider.png";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import {
  CreateAgentChatHistory,
  CreateChat,
  CreateChatHistory,
  DeleteChatHistory,
  ReadChatHistories,
  getChatHistoryFileUrl,
  getChatHistoryFileBlobUrl,
} from "../../services/doctor_conbot.ts";
import Loading from "../../components/ChatLoading.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import CopyIcon from "../../assets/Copy.tsx";
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

const ChatArea: React.FC<Props> = ({
  onNewChatAddition,
  disabled,
  onQuestionAsked,
}) => {
  const [inputValue, setInputValue] = useState("");
  const dispatch = useDispatch<Dispatch>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const chatContent = useSelector(
    (state: RootState) => state.chatContent.chatContent
  );
  const toast = useSelector((state: RootState) => state.toast);
  const dislikeModalStatus = useSelector(
    (state: RootState) => state.modal.dislikeReason.status
  );

  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [pageError, setPageError] = useState(false);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState<any>();
  const [showButton, setShowButton] = useState(false);
  const [videoUrls, setVideoUrls] = useState<{ [key: string]: string }>({});
  const [pendingVideos, setPendingVideos] = useState<{ [key: string]: string }>(
    {}
  );
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [pendingImages, setPendingImages] = useState<{ [key: string]: string }>(
    {}
  );

  const userDetails = JSON.parse(localStorage.getItem("user") || "{}");
  const token = userDetails?.access_token;
  const chat_id = searchParams.get("chat_id");

  const [pageSize] = useState({ skip: 0, limit: 100 });
  const [hasReachedEnd] = useState(false);

  useEffect(() => {
    // Handle pending videos
    Object.entries(pendingVideos).forEach(([key, url]) => {
      if (url && !videoUrls[key]) {
        loadVideoBlob(url, key);
      }
    });
    
    // Handle pending images
    Object.entries(pendingImages).forEach(([key, url]) => {
      if (url && !imageUrls[key]) {
        loadImageBlob(url, key);
      }
    });
  }, [pendingVideos, pendingImages]);

  useEffect(() => {
    return () => {
      Object.values(videoUrls).forEach((url) => URL.revokeObjectURL(url));
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // ───────────────────────────────
  // Chat Loading
  // ───────────────────────────────
  const getPageChat = useCallback(async () => {
    try {
      const response = await ReadChatHistories(
        pageSize.skip,
        pageSize.limit,
        chat_id
      );
      if (response?.result) {
        dispatch.chatContent.clearChat();
        dispatch.chatContent.addChat(response.result);
      } else {
        setPageError(true);
        dispatch.toast.openToast({
          status: true,
          message: response?.detail || "Failed to load chat",
          type: "error",
        });
        navigate(`/ai-studio/doctor_conbot`);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }, [chat_id, pageSize, dispatch, navigate]);

  useEffect(() => {
    if (chat_id) getPageChat();
  }, [chat_id]);

  useEffect(() => {
    if (pageSize.skip === 0) scrollToBottom();
  }, [chatContent]);

  // ───────────────────────────────
  // Scrolling Logic
  // ───────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current!;
      setShowButton(scrollTop + clientHeight < scrollHeight - 100);
    };
    const current = scrollRef.current;
    if (current) current.addEventListener("scroll", handleScroll);
    return () => current?.removeEventListener("scroll", handleScroll);
  }, []);

  // ───────────────────────────────
  // Message Sending
  // ───────────────────────────────
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    dispatch.chatContent.addQuestion([{ human: inputValue }]);

    try {
      if (chat_id) {
        const chatResponse = await CreateAgentChatHistory(inputValue, chat_id);
        if (chatResponse?.ai) {
          dispatch.chatContent.removeQuestion();
          dispatch.chatContent.addQuestion([chatResponse]);
          setInputValue("");
          setPageError(false);
        } else {
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: chatResponse?.detail || "Error sending message",
            type: "error",
          });
          getPageChat();
        }
      } else {
        const newChat = await CreateChat(inputValue);
        if (newChat?.id) {
          const chatResponse = await CreateAgentChatHistory(
            inputValue,
            newChat.id
          );
          if (chatResponse?.ai) {
            setInputValue("");
            navigate(`/ai-studio/doctor_conbot?chat_id=${newChat.id}`);
            dispatch.chatContent.addQuestion([chatResponse]);
            onNewChatAddition();
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch.toast.openToast({
        status: true,
        message: "Failed to send message",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSend();
  };

  // ───────────────────────────────
  // File Handling
  // ───────────────────────────────
  const onOtherFileClick = async (file: any) => {
    try {
      const linkResp = await getChatHistoryFileUrl(file);
      if (linkResp) {
        if (linkResp?.type === "base64") {
          setFileData({
            name: linkResp?.file_name,
            type: getFileType(linkResp?.file_name),
            url: linkResp?.link,
          });
        } else {
          const response = await getChatHistoryFileBlobUrl(file);
          const blobUrl = URL.createObjectURL(response.data);
          setFileData({
            name: file.name,
            type: getFileType(file?.name),
            url: blobUrl,
          });
        }
        setFileShow(true);
      } else {
        dispatch.toast.openToast({
          status: true,
          message: "File not found",
          type: "error",
        });
      }
    } catch (err) {
      console.error("File click error:", err);
    }
  };

  // ───────────────────────────────
  // Video Authorization Loader
  // ───────────────────────────────
  const loadVideoBlob = async (url: string, key: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch video");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);      
      setVideoUrls((prev) => ({ ...prev, [key]: blobUrl }));
    } catch (err) {
      console.error("Error loading video:", err);
    }
  };

  // ───────────────────────────────
  // Image Authorization Loader
  // ───────────────────────────────
  const loadImageBlob = async (url: string, key: string) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);      
      const contentType = response.headers.get('content-type');      
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();        
        if (jsonData.type === "base64" && jsonData.link) {
          setImageUrls((prev) => ({ ...prev, [key]: jsonData.link }));
        } else if (jsonData.link || jsonData.url || jsonData.image_url) {
          const actualImageUrl = jsonData.link || jsonData.url || jsonData.image_url;
          const imageResponse = await fetch(actualImageUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!imageResponse.ok) throw new Error("Failed to fetch actual image");
          const imageBlob = await imageResponse.blob();
          const blobUrl = URL.createObjectURL(imageBlob);
          setImageUrls((prev) => ({ ...prev, [key]: blobUrl }));
        }
      } else {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setImageUrls((prev) => ({ ...prev, [key]: blobUrl }));
      }
    } catch (err) {
      console.error("Error loading image:", err);
    }
  };

  // ───────────────────────────────
  // Utility Helpers
  // ───────────────────────────────
  const getInitials = (name: string) =>
    name
      ?.trim()
      ?.split(" ")
      ?.slice(0, 2)
      ?.map((part) => part[0])
      ?.join("")
      ?.toUpperCase() || "";

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

  const preventContextMenu = (e: React.MouseEvent) => e.preventDefault();
  const preventDragStart = (e: React.DragEvent) => e.preventDefault();

  // ───────────────────────────────
  // JSX
  // ───────────────────────────────
  return (
    <div className="flex flex-col w-full h-full bg-inherit">
      {/* Toasts */}
      {toast?.status && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      {/* File Preview Modal */}
      {fileShow && (
        <FileViewModal
          fileUrl={fileData}
          isOpen={fileShow}
          onClose={() => setFileShow(false)}
        />
      )}

      {/* Chat Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-scroll smooth-scroll p-4 pb-2 space-y-8 bg-inherit"
      >
        {chatContent?.length ? (
          chatContent.map((message: any, index: number) => (
            <div key={index} className="flex flex-col bg-inherit w-full gap-2">
              {/* Human Message */}
              {message?.human && (
                <div className="flex items-end justify-end w-[50%] self-end space-x-2">
                  <div className="bg-gray-200 p-2 rounded-lg break-words">
                    <Text className="text-primary_text" type="small">
                      {message?.human}
                    </Text>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">
                      {getInitials(userDetails?.name)}
                    </span>
                  </div>
                </div>
              )}

              {/* AI Message */}
              <div className="flex flex-row items-start justify-start w-full">
                {(message?.ai || loading) && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">AI</span>
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
                    >
                      {message.ai}
                    </ReactMarkdown>
                  </div>
                ) : (
                  loading && <Loading />
                )}
              </div>

              {/* Media Section */}
              {message.source?.sources?.length > 0 && (
                <div className="flex flex-col mt-0 ml-14">
                  {message.source.sources.map((source, idx) => {
                    const images = source.images || [];
                    const videos = source.videos || [];
                    const otherFiles = source.other_files || [];
                    const allMedia = [...images, ...videos];

                    const heading =
                      images.length && videos.length
                        ? "Images and Videos:"
                        : images.length
                        ? "Images:"
                        : "Videos:";

                    return (
                      <div key={`source-${idx}`} className="mb-4">
                        {allMedia.length > 0 && (
                          <>
                            <Text className="text-primary_text font-medium mb-1">
                              {heading}
                            </Text>
                            {allMedia.map((mediaString, mediaIdx) => {
                              const extractedUrl = mediaString?.startsWith("http")
                                ? mediaString
                                : null;
                              const isVideo =
                                Array.isArray(videos) &&
                                videos.includes(mediaString);
                              const isImage =
                                Array.isArray(images) &&
                                images.includes(mediaString);
                              const key = `${idx}-${mediaIdx}`;

                              // Queue video for loading
                              if (
                                isVideo &&
                                extractedUrl &&
                                !videoUrls[key] &&
                                !pendingVideos[key]
                              ) {
                                setPendingVideos((prev) => ({
                                  ...prev,
                                  [key]: extractedUrl,
                                }));
                              }

                              // Queue image for loading
                              if (
                                isImage &&
                                extractedUrl &&
                                !imageUrls[key] &&
                                !pendingImages[key]
                              ) {
                                setPendingImages((prev) => ({
                                  ...prev,
                                  [key]: extractedUrl,
                                }));
                              }

                              return (
                                <div
                                  key={key}
                                  className="relative mt-2 flex justify-center items-center"
                                >
                                  <div className="max-w-[700px] max-h-[700px] overflow-hidden border rounded-lg shadow-sm">
                                    {isVideo ? (
                                        <video
                                          controls
                                          className="w-full h-full object-contain"
                                          src={videoUrls[key] || ""}
                                        />
                                      ) : isImage ? (
                                        <img
                                          src={imageUrls[key] || ""}
                                          alt={`Image ${mediaIdx + 1}`}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : null
                                    }
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        )}

                        {/* Other Files */}
                        {otherFiles.length > 0 && (
                          <div className="flex flex-row flex-wrap gap-2 mt-2">
                            {otherFiles.map((file, fileIdx) => (
                              <button
                                key={fileIdx}
                                className="rounded-full px-2 p-1 border border-grey flex items-center hover:bg-gray-50"
                                onClick={() => onOtherFileClick(source)}
                              >
                                <img className="pb-1" src={Link} alt="Link" />
                                <Text
                                  className="text-primary_text mx-1 whitespace-normal break-all text-start"
                                  type="small"
                                >
                                  {file.file_name}
                                </Text>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Copy + Price */}
              {message.ai && (
                <button
                  disabled={disabled}
                  className="w-20 min-h-8 rounded-full ml-12 mt-1 border border-grey"
                >
                  <div className="flex flex-row mx-2 justify-between">
                    <CopyIcon
                      disabled={disabled}
                      onClick={() => copyToClipboard(index, message)}
                    />
                    <img src={Divide} alt="divide" />
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
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll-to-bottom Button */}
      {showButton && (
        <button
          className="w-fit bottom-2 self-center absolute h-7 bg-white border border-grey rounded-lg px-2 hover:bg-[#0061F3] text-primary_text hover:text-white"
          onClick={scrollToBottom}
        >
          <Text className="text-[14px] font-medium ">Scroll to bottom</Text>
        </button>
      )}

      {/* Input Bar */}
      <div className="fixed lg:bottom-10 lg:left-60 right-0 flex justify-center bg-inherit">
        <Input
          disabled={loading || disabled}
          onKeyDown={onKeyDown}
          onChange={(e: Event) => setInputValue(e.target.value)}
          value={inputValue}
          placeholder="Ask your query here..."
          prefixIcon={<img src={ThermaxIcon} className="pr-4" alt="thermax" />}
          suffixIcon={
            <Button
              disabled={loading}
              onClick={handleSend}
              custom_type="secondary"
              className="w-14"
              size="very_small"
              rounded
            >
              <img src={Sent} alt="Sent" />
            </Button>
          }
          fixed_size="full"
        />
      </div>
    </div>
  );
};

export default ChatArea;