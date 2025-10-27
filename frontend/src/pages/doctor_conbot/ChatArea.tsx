import React, { ChangeEvent, useEffect, useRef, useState } from "react";
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
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 100 });
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState();

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
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
        navigate(`/ai-studio/doctor_conbot`);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  };

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
            const chatResponse = await CreateAgentChatHistory(
              inputValue,
              newSessionResponse.id
            );
            if (chatResponse?.ai) {
              navigate(
                `/ai-studio/doctor_conbot?chat_id=${newSessionResponse?.id}`
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
                `/ai-studio/doctor_conbot?chat_id=${newSessionResponse?.id}`
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

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSend();
  };

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(" ");
    const initials = nameParts
      ?.slice(0, 2)
      .map((part) => part.charAt(0))
      .join("");
    return initials.toUpperCase();
  };

  const copyToClipboard = (index: number, message: any) => {
    const content: any = document.querySelector(`#message-${index}`); // Select the outer div by its id or another unique identifier
    if (!content) return;
    copy(content.innerText); // Use clipboard-copy to copy the innerText of the div
    setCopySuccess(true);
    dispatch.toast.openToast({
      status: true,
      message: "Copied to clipboard",
      type: "success",
    });
  };

  const onFileClick = async (file: any) => {
    console.log("PDF file clicked:", file);
    try {
      let fileInfo: any = {
        name: file.name,
        type: getFileType(file?.name),
        url: file?.link,
      };
      setFileData(fileInfo);
      setFileShow(true);
    } catch (err) {
      console.log("err", err);
    }
  };

  const onOtherFileClick = async (source: any, fileIndex: number) => {
    try {
      const otherFile = source.other_files[fileIndex];
      const sourceRequest = {
        name: source.name,
        document_kind: 'OTHER',
        images: null,
        videos: null,
        other_files: [otherFile],
        link: null,
      };

      const linkResp = await getChatHistoryFileUrl(sourceRequest);
      
      if (linkResp?.data) {
        if (linkResp.data.type === "base64") {
          let fileInfo: any = {
            name: linkResp.data.file_name || otherFile.file_name,
            type: getFileType(otherFile?.file_name),
            url: linkResp.data.link,
          };
          setFileData(fileInfo);
          setFileShow(true);
        } else {
          const blobResponse: any = await getChatHistoryFileBlobUrl(sourceRequest);
          const blobUrl = URL.createObjectURL(blobResponse.data);
          
          let fileInfo: any = {
            name: otherFile.file_name,
            type: getFileType(otherFile?.file_name),
            url: blobUrl,
          };
          setFileData(fileInfo);
          setFileShow(true);
        }
      } else {
        dispatch.toast.openToast({
          status: true,
          message: "File not found",
          type: "error",
        });
      }
    } catch (err) {
      console.log("Error loading file:", err);
      dispatch.toast.openToast({
        status: true,
        message: "Failed to load file",
        type: "error",
      });
    }
  };

  const onMediaClick = async (source: any, mediaIndex: number, isVideo: boolean) => {
    try {
      // Build the source request object with the specific media item
      const sourceRequest = {
        name: source.name,
        document_kind: isVideo ? 'VIDEO' : 'IMAGE',
        images: isVideo ? null : [source.images[mediaIndex]],
        videos: isVideo ? [source.videos[mediaIndex]] : null,
        other_files: null,
        link: null,
      };

      const linkResp = await getChatHistoryFileUrl(sourceRequest);
      
      if (linkResp?.data) {
        if (linkResp.data.type === "base64") {
          let fileInfo: any = {
            name: linkResp.data.file_name || source.name || `media_${Date.now()}`,
            type: isVideo ? 'video' : 'image',
            url: linkResp.data.link,
          };
          setFileData(fileInfo);
          setFileShow(true);
        } else {
          const blobResponse: any = await getChatHistoryFileBlobUrl(sourceRequest);
          const blobUrl = URL.createObjectURL(blobResponse.data);
          
          let fileInfo: any = {
            name: source.name || `media_${Date.now()}`,
            type: isVideo ? 'video' : 'image',
            url: blobUrl,
          };
          setFileData(fileInfo);
          setFileShow(true);
        }
      } else {
        dispatch.toast.openToast({
          status: true,
          message: "Media not found",
          type: "error",
        });
      }
    } catch (err) {
      console.log("Error loading media:", err);
      dispatch.toast.openToast({
        status: true,
        message: "Failed to load media",
        type: "error",
      });
    }
  };

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
      {fileShow && (
        <FileViewModal
          fileUrl={fileData}
          isOpen={fileShow}
          onClose={() => setFileShow(false)}
        />
      )}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-scroll smooth-scroll p-4 pb-2 space-y-8  bg-inherit"
      >
        {chatContent?.length > 0 ? (
          chatContent.map((message: any, index: number) => (
            <div key={index} className="flex flex-col bg-inherit w-full gap-2">
              <div
                key={index}
                className={`flex items-end space-x-2 overflow-hidden self-end justify-end w-[50%]`}
              >
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message?.human
                      ? "bg-gray-200 text-small break-words"
                      : "bg-inherit text-small pl-14 break-words"
                  }`}
                >
                  <Text className="text-primary_text" type="small">
                    {message?.human}
                  </Text>
                </div>
                {message?.human && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">
                      {getInitials(userDetails?.name)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-row items-start justify-start w-full">
                {(message?.ai || loading) && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">{"AI"}</span>
                  </div>
                )}
                {message?.ai ? (
                  <div
                    id={`message-${index}`}
                    className="w-full max-w-4xl  py-1 px-4 rounded-lg"
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
                    >
                      {message.ai}
                    </ReactMarkdown>
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
              <div className="flex flex-row flex-wrap gap-2">
                {message?.ai?.replace(/\\n/g, "\n") &&
                  message?.source?.sources?.map((file: any, index: number) =>
                    (file?.name && file?.document_kind === "FAQ" || file?.document_kind === 'MANUAL') ? (
                      <button
                        key={index}
                        className="rounded-full ml-[3.5vw] px-2 p-1 w-fit h-fit border border-grey items-center flex flex-row justify-between"
                        onClick={() => {
                          if (file?.document_kind === "OTHER") {
                            onFileClick(file);
                          }
                        }}
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
                    ) : null
                  )}
              </div>

              {message.source &&
                message.source.sources &&
                message.source.sources.some(
                  (source) =>
                    (source.images &&
                      Array.isArray(source.images) &&
                      source.images.length > 0) ||
                    (source.videos &&
                      Array.isArray(source.videos) &&
                      source.videos.length > 0) ||
                    (source.other_files &&
                      Array.isArray(source.other_files) &&
                      source.other_files.length > 0)
                ) && (
                  <div className="flex flex-col mt-0 ml-14">
                    {message.source.sources.map((source, idx) => {
                      const images = source.images || [];
                      const videos = source.videos || [];
                      const otherFiles = source.other_files || [];
                      const allMedia = [...images, ...videos];

                      const getMediaHeading = () => {
                        if (images.length > 0 && videos.length > 0)
                          return "Images and Videos:";
                        if (images.length > 0) return "Images:";
                        return "Videos:";
                      };

                      const preventContextMenu = (e: React.MouseEvent) => {
                        e.preventDefault();
                        return false;
                      };

                      const preventDragStart = (e: React.DragEvent) => {
                        e.preventDefault();
                      };

                      return (
                        <div key={`source-${idx}`} className="mb-4">
                          {/* Display Images and Videos */}
                          {allMedia.length > 0 && (
                            <>
                              <Text className="text-primary_text font-medium mb-1">
                                {getMediaHeading()}
                              </Text>
                              {allMedia.map((mediaString, mediaIdx) => {
                                const urlMatch = mediaString.match(/link='(.*?)'/);
                                const extractedUrl = urlMatch ? urlMatch[1] : null;
                                console.log("media string", urlMatch);
                                const isVideo = videos.includes(mediaString);
                                
                                // Determine the actual index in the images or videos array
                                const actualIndex = isVideo 
                                  ? videos.indexOf(mediaString)
                                  : images.indexOf(mediaString);
                                const processedUrl =
                                  !isVideo &&
                                  extractedUrl?.includes("blob.core.windows.net")
                                    ? extractedUrl
                                    : extractedUrl;

                                return mediaString ? (
                                  <div
                                    key={`${idx}-${mediaIdx}`}
                                    className="relative mt-2 flex justify-center items-center cursor-pointer"
                                    onContextMenu={preventContextMenu}
                                    onClick={() => onMediaClick(source, actualIndex, isVideo)}
                                  >
                                    <div className="max-w-[700px] max-h-[700px] overflow-hidden border border-gray-200 rounded-lg shadow-sm relative hover:border-gray-400 transition-colors">
                                      {isVideo ? (
                                        <div className="relative">
                                          <video
                                            controls
                                            className="w-full h-full object-contain"
                                            style={{
                                              maxWidth: "700px",
                                              maxHeight: "700px",
                                              WebkitUserSelect: "none",
                                              userSelect: "none",
                                            }}
                                            controlsList="nodownload"
                                            onContextMenu={preventContextMenu}
                                            draggable="false"
                                            onDragStart={preventDragStart}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <source src={mediaString} type="video/mp4" />
                                            Your browser does not support the video tag.
                                          </video>
                                        </div>
                                      ) : (
                                        <div className="relative">
                                          <img
                                            src={mediaString}
                                            alt={`Media content ${mediaIdx + 1}`}
                                            className="w-full h-full object-contain pointer-events-none"
                                            style={{
                                              maxWidth: "400px",
                                              maxHeight: "500px",
                                              WebkitUserSelect: "none",
                                              userSelect: "none",
                                            }}
                                            onContextMenu={preventContextMenu}
                                            draggable="false"
                                            onDragStart={preventDragStart}
                                          />
                                          <div className="absolute inset-0 bg-transparent" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : null;
                              })}
                            </>
                          )}
                          {/* Display Other Files as Buttons */}
                          {otherFiles.length > 0 && (
                            <div className="flex flex-row flex-wrap gap-2 mt-2">
                              {otherFiles.map((file, fileIdx) => (
                                <button
                                  key={fileIdx}
                                  className="rounded-full px-2 p-1 w-fit h-fit border border-grey items-center flex flex-row justify-between hover:bg-gray-50 transition-colors"
                                  onClick={() => onOtherFileClick(source, fileIdx)}
                                >
                                  <img className="pb-1" src={Link} alt="Link" />
                                  <div className="flex flex-col">
                                    <Text
                                      className="text-primary_text mx-1 whitespace-normal max-w-[45rem] break-all text-start"
                                      type="small"
                                    >
                                      {file.file_name}
                                    </Text>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              }

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
      {showButton && (
        <button
          className="w-fit bottom-2 self-center h-7 bg-white absolute border border-grey rounded-lg px-2 hover:bg-[#0061F3] text-primary_text hover:text-white"
          onClick={scrollToBottom}
        >
          <Text className="text-[14px] font-medium ">Scroll to bottom</Text>
        </button>
      )}
      <div className="top-[84vh] left-84 px-4 self-center w-100 fixed bg-inherit flex ">
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
          fixed_size="full"
        />
      </div>
    </div>
  );
};

export default ChatArea;
