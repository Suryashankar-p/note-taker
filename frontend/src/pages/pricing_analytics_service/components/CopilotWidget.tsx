import React, { useState, useRef, useEffect } from "react";
import {
  Maximize2,
  ArrowUpRight,
  Settings,
  RotateCcw,
  X,
  Send,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useSendLLMChat } from "../services/query/query";
import { useLocation } from "react-router-dom";

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
  const location = useLocation();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 1,
      sender: "system",
      content: "Welcome to GIA Co-pilot, how can I help you today?",
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatMutation = useSendLLMChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputVal.trim() || isLoading) return;
    const userQuery = inputVal.trim();
    setInputVal("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", content: userQuery },
    ]);

    const currentPath = location.pathname;
    const mode = currentPath.includes("/analyst") ? "pricing_analyst" : "ceo_cfo";
    const activeBu = currentPath.split("/").find((segment) =>
      ["heating", "cooling", "water"].includes(segment.toLowerCase())
    ) || "heating";

    const chatHistory = messages
      .filter((msg) => msg.sender === "user" || msg.sender === "system")
      .map((msg) => ({
        role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: msg.content,
      }));

    try {
      const data = await chatMutation.mutateAsync({
        query: userQuery,
        mode: mode,
        business_unit: activeBu,
        history: chatHistory,
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
    <div className="fixed bottom-8 right-6 w-[420px] h-[550px] bg-[#131517] text-white rounded-xl shadow-2xl border border-[#202226] flex flex-col overflow-hidden z-50 animate-fade-in font-sans">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#1a1c1e] border-b border-[#202226]">
        <div className="flex items-center gap-2">
          <Sparkles className="text-[#ED3438]" size={16} />
          <span className="text-sm font-bold tracking-tight">GIA LLM Co-pilot</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
          <button onClick={onClose} className="hover:text-white transition-colors pl-1">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0d0e0f]">
        {messages.map((msg) => {
          if (msg.sender === "system") {
            const scribeSummary = msg.content;
            return (
              <div key={msg.id} className="w-full max-w-[85%] bg-[#1c1f22] border border-[#2d3135] text-gray-200 text-xs py-3 px-4 rounded-xl leading-relaxed">
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
                      <h1 className="my-3 text-lg font-semibold text-white" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="my-2 text-md font-semibold text-white" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="my-2 text-sm font-semibold text-white" {...props} />
                    ),

                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto max-w-full my-2 border border-[#202226] rounded-md">
                        <table className="min-w-full divide-y divide-[#202226] text-xs text-gray-200" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-[#131517]" {...props} />,
                    th: ({ node, ...props }) => <th className="px-3 py-2 text-left font-bold text-gray-300" {...props} />,
                    td: ({ node, ...props }) => <td className="px-3 py-1.5 text-gray-400" {...props} />,

                    code: ({ node, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !className || !match;
                      const textContent = String(children || "");

                      // Detect if this code block is a math equation/formula
                      const isFormula = !isInline && (
                        textContent.includes("=") ||
                        textContent.includes("─") ||
                        textContent.includes("×") ||
                        /GM%|Elasticity|Revenue|cogs|Cost|Change in/i.test(textContent)
                      );

                      if (isInline) {
                        return (
                          <code
                            className="rounded bg-gray-800 px-1.5 py-0.5 text-[9px] font-bold text-[#ED3438]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      if (isFormula) {
                        return (
                          <div className="my-3 bg-gradient-to-r from-[#a61c1e]/15 to-transparent border-l-4 border-[#a61c1e] py-3.5 px-4 rounded-r-xl font-mono">
                            <span className="text-[9px] text-[#ED3438] font-bold uppercase tracking-widest block mb-2.5">
                              FORMULA DEFINITION
                            </span>
                            <pre className="w-full whitespace-pre-wrap break-words text-[13px] font-extrabold tracking-wide text-white leading-relaxed">
                              {children}
                            </pre>
                          </div>
                        );
                      }

                      return (
                        <pre className="w-full whitespace-pre-wrap break-words rounded-md bg-[#131517] p-2 text-xs text-gray-200 border border-[#202226]">
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
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-[#131517] border-t border-[#202226] flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Ask a question..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full bg-[#1c1f22] border border-[#2d3135] rounded-lg pl-3 pr-12 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-[#ED3438] font-medium"
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
  );
};

export default CopilotWidget;
