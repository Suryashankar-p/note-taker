import React, { useState, useRef } from "react";
import {
  Maximize2,
  ArrowUpRight,
  Settings,
  RotateCcw,
  X,
  Paperclip,
  Send,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useSendLLMChat } from "../services/query/query";

interface CopilotWidgetProps {
  onClose: () => void;
}

interface MessageItem {
  id: number;
  sender: string;
  content: string;
  title?: string;
  fix?: string;
}

const CopilotWidget: React.FC<CopilotWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 1,
      sender: "system",
      content: "Welcome to GIA co-pilot, how can I help you today?",
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatMutation = useSendLLMChat();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!inputVal.trim() || isLoading) return;
    const userQuery = inputVal.trim();
    setInputVal("");
    setIsLoading(true);

    const attachmentPrefix = selectedFile ? `[Attached: ${selectedFile.name}] ` : "";
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", content: `${attachmentPrefix}${userQuery}` },
    ]);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const data = await chatMutation.mutateAsync({
        query: userQuery,
        mode: "ceo_cfo",
        session_id: 16,
      });

      let replyText = "";
      if (typeof data === "string") {
        replyText = data;
      } else if (data && typeof data === "object") {
        replyText = data.scribeSummary || data.response || data.content || data.message || JSON.stringify(data);
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), sender: "system", content: replyText },
      ]);
    } catch (error: any) {
      console.error("Error communicating with chat API:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "error",
          title: "Could not reach the model.",
          content: error?.response?.data?.detail || error?.message || "Could not reach the LLM API.",
          fix: "Fix: Check if the backend chat server is running and accessible.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-2 right-6 w-[420px] h-[550px] bg-[#131517] text-white rounded-xl shadow-2xl border border-[#202226] flex flex-col overflow-hidden z-50 animate-fade-in font-sans">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#1a1c1e] border-b border-[#202226]">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#ED3438]" size={16} />
          <span className="text-sm font-bold tracking-tight">GIA LLM Co-pilot</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          {/* Comment out other head icons except close
          <button className="hover:text-white transition-colors">
            <Maximize2 size={13} />
          </button>
          <button className="hover:text-white transition-colors">
            <ArrowUpRight size={13} />
          </button>
          <button className="hover:text-white transition-colors">
            <Settings size={13} />
          </button>
          <button className="hover:text-white transition-colors">
            <RotateCcw size={13} />
          </button>
          */}
          <button onClick={onClose} className="hover:text-white transition-colors pl-1">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 2. Subheader key warning (Commented out) */}
      {/*
      <div className="bg-[#2a1b1b] text-rose-350 text-[10px] py-1.5 px-4 text-left border-b border-[#3b1d1d] font-semibold tracking-wide">
        API key expired — paste a new JWT in Settings → Save
      </div>
      */}

      {/* 3. Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0d0e0f]">
        {messages.map((msg) => {
          if (msg.sender === "system") {
            const scribeSummary = msg.content;
            return (
              <div key={msg.id} className="max-w-[85%] bg-[#1c1f22] border border-[#2d3135] text-gray-200 text-xs py-3 px-4 rounded-xl leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    img: ({ node, ...props }) => (
                      <img {...props} className="h-auto max-w-full rounded-md" />
                    ),
 
                    p: ({ node, ...props }) => (
                      <p
                        className="my-2 text-sm leading-relaxed text-gray-200"
                        {...props}
                      />
                    ),
 
                    ol: ({ node, ...props }) => (
                      <ol
                        className="my-2 list-decimal space-y-1 pl-5 text-sm text-gray-200"
                        {...props}
                      />
                    ),
 
                    ul: ({ node, ...props }) => (
                      <ul
                        className="my-2 list-disc space-y-1 pl-5 text-sm text-gray-200"
                        {...props}
                      />
                    ),
 
                    li: ({ node, ...props }) => (
                      <li className="text-sm text-gray-200" {...props} />
                    ),
 
                    a: ({ node, ...props }) => (
                      <a
                        href={props.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline hover:text-blue-350"
                      >
                        {props.children}
                      </a>
                    ),
 
                    h1: ({ node, ...props }) => (
                      <h1 className="my-3 text-xl font-semibold text-white" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="my-2 text-lg font-semibold text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="my-2 text-base font-semibold text-white" {...props} />
                    ),
 
                    code: ({ node, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !className || !match;
                      return isInline ? (
                        <code
                          className="rounded bg-gray-800 px-1 py-0.5 text-sm text-[#ED3438]"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <pre className="whitespace-pre-wrap break-words rounded-md bg-[#131517] p-2 text-sm text-gray-200 border border-[#202226]">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                  }}
                >
                  {scribeSummary}
                </ReactMarkdown>
              </div>
            );
          } else if (msg.sender === "user") {
            return (
              <div key={msg.id} className="max-w-[85%] bg-[#ED3438]/15 border border-[#ED3438]/35 text-gray-150 text-xs py-3 px-4 rounded-xl leading-relaxed self-end">
                {msg.content}
              </div>
            );
          } else if (msg.sender === "error") {
            return (
              <div key={msg.id} className="max-w-[90%] bg-[#241a22] border border-[#3c2234] text-rose-300 text-xs py-3.5 px-4 rounded-xl leading-relaxed flex flex-col gap-2">
                <span className="font-bold text-[#f43f5e]">{msg.title}</span>
                <p className="text-gray-300 text-[11px]">{msg.content}</p>
                <span className="text-rose-450 font-semibold text-[10px] mt-1 bg-rose-950/40 p-1.5 rounded border border-rose-900/30">
                  {msg.fix}
                </span>
              </div>
            );
          }
          return null;
        })}
        {isLoading && (
          <div className="max-w-[80px] bg-[#1c1f22] border border-[#2d3135] text-gray-400 text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 self-start">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* 4. Footer Input Bar */}
      <div className="p-3 bg-[#131517] border-t border-[#202226] flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center justify-between bg-[#1c1f22] border border-[#2d3135] px-3 py-1.5 rounded-lg text-xs text-gray-300">
            <div className="flex items-center gap-2 truncate">
              <Paperclip size={12} className="text-[#ED3438] shrink-0" />
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-[10px] text-gray-500 shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button onClick={handleRemoveFile} className="text-gray-400 hover:text-white transition-colors pl-2 shrink-0">
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleAttachmentClick}
            className="p-2.5 bg-[#1c1f22] hover:bg-[#252a2d] border border-[#2d3135] rounded-lg text-gray-400 hover:text-white transition-colors shrink-0"
          >
            <Paperclip size={15} />
          </button>
          <div className="flex-1 relative flex items-center">
            <input
              type="text"
              placeholder="Ask or paste an image (Ctrl+V)..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full bg-[#1c1f22] border border-[#2d3135] rounded-lg pl-3 pr-12 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ED3438] font-medium"
            />
            <button
              onClick={handleSend}
              className="absolute right-1.5 p-1.5 bg-[#ED3438] hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CopilotWidget;
