import React, { useState } from "react";
import {
  Maximize2,
  ArrowUpRight,
  Settings,
  RotateCcw,
  X,
  Camera,
  Send,
  Sparkles,
} from "lucide-react";

interface CopilotWidgetProps {
  onClose: () => void;
}

const CopilotWidget: React.FC<CopilotWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      content: "Welcome to GIA co-pilot, how can I help you today?",
    },
    {
      id: 2,
      sender: "user",
      content: "How many product families have net reduction in dispersion? Show full table.",
    },
    {
      id: 3,
      sender: "error",
      title: "Could not reach the model.",
      content: "Local LLM proxy is offline at http://127.0.0.1:3847. Start gia-llm-proxy.cmd and keep the window open. (Failed to fetch)",
      fix: "Fix: Double-click gia-llm-proxy.cmd in the project folder, leave that window open, then send your message again.",
    },
  ]);

  const [inputVal, setInputVal] = useState("");

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", content: inputVal },
      {
        id: Date.now() + 1,
        sender: "error",
        title: "Could not reach the model.",
        content: "Local LLM proxy is offline at http://127.0.0.1:3847. Start gia-llm-proxy.cmd and keep the window open. (Failed to fetch)",
        fix: "Fix: Double-click gia-llm-proxy.cmd in the project folder, leave that window open, then send your message again.",
      },
    ]);
    setInputVal("");
  };

  return (
    <div className="fixed bottom-2 right-6 w-[420px] h-[550px] bg-[#131517] text-white rounded-xl shadow-2xl border border-[#202226] flex flex-col overflow-hidden z-50 animate-fade-in font-sans">
      {/* 1. Header Bar */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#1a1c1e] border-b border-[#202226]">
        <div className="flex items-center gap-2">
          <Sparkles className="text-violet-400" size={16} />
          <span className="text-sm font-bold tracking-tight">GIA LLM Co-pilot</span>
        </div>
        <div className="flex items-center gap-3 text-gray-400">
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
          <button onClick={onClose} className="hover:text-white transition-colors pl-1">
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 2. Subheader key warning */}
      <div className="bg-[#2a1b1b] text-rose-350 text-[10px] py-1.5 px-4 text-left border-b border-[#3b1d1d] font-semibold tracking-wide">
        API key expired — paste a new JWT in Settings → Save
      </div>

      {/* 3. Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#0d0e0f]">
        {messages.map((msg) => {
          if (msg.sender === "system") {
            return (
              <div key={msg.id} className="max-w-[85%] bg-[#1c1f22] border border-[#2d3135] text-gray-200 text-xs py-3 px-4 rounded-xl leading-relaxed">
                {msg.content}
              </div>
            );
          } else if (msg.sender === "user") {
            return (
              <div key={msg.id} className="max-w-[85%] bg-[#2d283e] border border-[#3e3952] text-gray-150 text-xs py-3 px-4 rounded-xl leading-relaxed self-end">
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
      </div>

      {/* 4. Footer Input Bar */}
      <div className="p-3 bg-[#131517] border-t border-[#202226] flex items-center gap-2">
        <button className="p-2.5 bg-[#1c1f22] hover:bg-[#252a2d] border border-[#2d3135] rounded-lg text-gray-400 hover:text-white transition-colors">
          <Camera size={15} />
        </button>
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Ask or paste an image (Ctrl+V)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full bg-[#1c1f22] border border-[#2d3135] rounded-lg pl-3 pr-12 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-[#a61c1e] font-medium"
          />
          <button
            onClick={handleSend}
            className="absolute right-1.5 p-1.5 bg-violet-500 hover:bg-violet-650 text-white rounded-md transition-colors"
          >
            <Send size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopilotWidget;
