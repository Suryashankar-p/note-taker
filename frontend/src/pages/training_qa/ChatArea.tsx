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
  ChatTrainingQA,
} from "../../services/training_qa.ts";
import Loading from "../../components/ChatLoading.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { useMutation } from "@tanstack/react-query";

interface Props {
  onNewChatAddition?: () => void;
  disabled?: boolean;
  onQuestionAsked?: any;
  video?: boolean;
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
  const [pageSize, setPageSize] = useState({ skip: 0, limit: 100 });
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [fileShow, setFileShow] = useState(false);
  const [fileData, setFileData] = useState();

  const mutation = useMutation({
    mutationKey: ["training_qa_chat"],
    mutationFn: () => ChatTrainingQA(inputValue),
    onSuccess: (data) => {
      dispatch.chatContent.removeQuestion();
      // Dispatch AI response to the chatContent state
      setInputValue('')
      dispatch.chatContent.addQuestion([data]);
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  useEffect(() => {
    if (pageSize.skip === 0) {
      scrollToBottom();
    }
  }, [chatContent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const handleSend = async () => {
    if (!inputValue) return;
    dispatch.chatContent.addQuestion([{ human: inputValue }]);
    setLoading(true);
    mutation.mutate();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleSend();
  };

  const onChatDelete = async (item: any) => {};

  const getInitials = (name: string) => {
    const nameParts = name.trim().split(" ");
    const initials = nameParts
      ?.slice(0, 2)
      .map((part) => part.charAt(0))
      .join("");
    return initials.toUpperCase();
  };

  const onDislikeClick = (e: any, message: any) => {
    e.stopPropagation();
  };

  const onLikeClick = (e: any, message: any) => {
    e.stopPropagation();
  };

  const onDislikeSubmit = async (data: any) => {};

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

    // Optionally provide feedback to the user
  };

  const onFileClick = async (file: any) => {};

  const convertMarkdownToHtml = (markdown: string) => {
    const dirtyHtml = marked.parse(markdown, { gfm: true, breaks: true });
    return DOMPurify.sanitize(dirtyHtml);
  };

  return (
    <div className="flex flex-col w-full position-fixed h-full bg-inherit">
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
        className="flex-1 overflow-y-scroll smooth-scroll p-4 pb-8 space-y-8 max-w-[75vw] bg-inherit"
      >
        {chatContent?.length > 0 ? (
          chatContent.map((message: any, index: number) => (
            <div key={index} className="flex flex-col bg-inherit">
              <div
                key={index}
                className={`flex items-start space-x-2 justify-start w-full bg-inherit`}
              >
                {message?.human && (
                  <div className="w-8 h-8 bg-gray-200 px-4 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">
                      {getInitials(userDetails?.name)}
                    </span>
                  </div>
                )}
                <div
                  className={`inline-block p-2 rounded-lg ${
                    message?.human
                      ? "bg-inherit text-small"
                      : "bg-inherit text-small pl-14"
                  }`}
                >
                  <Text className="text-primary_text" type="small">
                    {message?.human}
                  </Text>
                  <div
                    id={`message-${index}`}
                    className="markdown-body max-w-[58vw] overflow-auto p-4 bg-white"
                  >
                    <div
                      className="prose text-[14px] font-normal text-primary_text"
                      dangerouslySetInnerHTML={{
                        __html:
                          message?.ai && convertMarkdownToHtml(message?.ai),
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-row flex-wrap gap-2">
                {message?.ai &&
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
              {message?.ai ? (
                <button
                  disabled={disabled}
                  className="w-40 min-h-8 rounded-full ml-12 mt-4 border border-grey"
                >
                  <div className="flex flex-row mx-2 justify-between">
                    <LikeIcon
                      disabled={disabled}
                      selected={message?.like}
                      onClick={(e: any) => onLikeClick(e, message)}
                    />
                    <img src={Divide} alt="divide" loading="lazy" />
                    <Dislike
                      color="blue"
                      disabled={disabled}
                      selected={message?.like === false}
                      onClick={(e: any) => onDislikeClick(e, message)}
                    />
                    <img src={Divide} alt="divide" loading="lazy" />
                    <CopyIcon
                      disabled={disabled}
                      onClick={() => copyToClipboard(index, message)}
                    />
                    <img src={Divide} alt="divide" loading="lazy" />
                    {/* <img src={Delete} onClick={() => onChatDelete(message)} className='h-5' alt='delete' loading='lazy' /> */}
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
          className="w-fit bottom-2 left-80  h-7 bg-white absolute border border-grey rounded-lg px-2 hover:bg-[#0061F3] text-primary_text hover:text-white"
          onClick={scrollToBottom}
        >
          <Text className="text-[14px] font-medium ">Scroll to bottom</Text>
        </button>
      )}
      <div className="top-[84vh] left-[20vw] px-4 self-center min-w-[83vw] fixed bg-inherit flex ">
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
          fixed_size={"full"}
        />
      </div>
    </div>
  );
};

export default ChatArea;
