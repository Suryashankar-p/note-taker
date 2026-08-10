import React, { useState, useRef, useEffect } from "react";
import { Settings, Database, FolderOpen, Loader2, MoreVertical, Trash2, Edit2, Check, X } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
// Sessions list imports removed

const UploadSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const baseUploadPath = "/ai-studio/pricing-analytics";

  const sessions = [
    { id: 10, session_name: "Q4 FY26 Strategy Run" },
    { id: 11, session_name: "FY26 Baseline Analysis" }
  ];
  const isLoadingSessions = false;

  const deleteSession = (id: number, options?: { onSuccess?: () => void }) => {
    options?.onSuccess?.();
  };
  const isDeletingSession = false;

  const updateSession = (args: { sessionId: number; session_name: string }, options?: { onSuccess?: () => void }) => {
    options?.onSuccess?.();
  };
  const isUpdatingSession = false;

  const currentSessionId = localStorage.getItem("pricing_session_id") || "10";

  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [editNameValue, setEditNameValue] = useState<string>("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSessionClick = (sessionId: number) => {
    localStorage.setItem("pricing_session_id", String(sessionId));
    navigate(`${baseUploadPath}/workspace`);
  };

  return (
    <aside
      className="flex flex-col w-64 h-full p-5 bg-[#131517] 
      border-r 
      border-[#202226]
      justify-between
      text-white
    "
    >
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="mb-6 px-1">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Pricing <span className="text-[#a61c1e]">Analytics</span>
          </h2>
          <p className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5">
            Pricing Analytics Service
          </p>
        </div>

        <hr className="border-t border-[#202226] mb-5" />

        {/* Sessions list (Commented out for now)
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-1 mb-3">
            <Database className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">
              Sessions
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
            {isLoadingSessions ? (
              <div className="flex items-center gap-2 px-2 py-3 text-xs text-gray-505">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#a61c1e]" />
                <span>Loading...</span>
              </div>
            ) : !sessions || sessions.length === 0 ? (
              <div className="px-2 py-3 text-xs text-gray-400 italic">
                No active sessions
              </div>
            ) : (
              sessions.map((session: any) => {
                const isActive = pathname.includes("/workspace") && currentSessionId === String(session.id);

                return (
                  <div key={session.id} className="relative group w-full flex items-center">
                    <button
                      onClick={() => handleSessionClick(session.id)}
                      className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 text-left truncate pr-8 ${
                        isActive
                          ? "bg-[#a61c1e] text-white font-semibold shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <FolderOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
                      <span className="truncate">{session.session_name || `Session #${session.id}`}</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(activeDropdownId === session.id ? null : session.id);
                      }}
                      className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {activeDropdownId === session.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-2 top-8 z-30 w-28 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-left"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                            setEditNameValue(session.session_name || `Session #${session.id}`);
                            setIsRenameModalOpen(true);
                            setActiveDropdownId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                            setIsDeleteModalOpen(true);
                            setActiveDropdownId(null);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-655 hover:bg-gray-50 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        */}
      </div>

      <nav className="flex flex-col mt-4">
        <NavLink
          to={`${baseUploadPath}/settings/members`}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${isActive
              ? "text-[#e03639] font-semibold"
              : "text-[#a3a3a6] hover:text-white"
            }`
          }
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Rename Modal */}
      {isRenameModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-[400px] max-w-full text-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Rename Session</h3>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Name
              </label>
              <input
                type="text"
                value={editNameValue}
                onChange={(e) => setEditNameValue(e.target.value)}
                disabled={isUpdatingSession}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#a61c1e]/20 focus:border-[#a61c1e] disabled:opacity-50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateSession(
                      { sessionId: selectedSession.id, session_name: editNameValue },
                      {
                        onSuccess: () => {
                          setIsRenameModalOpen(false);
                          setSelectedSession(null);
                        },
                      }
                    );
                  } else if (e.key === "Escape") {
                    if (!isUpdatingSession) {
                      setIsRenameModalOpen(false);
                      setSelectedSession(null);
                    }
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsRenameModalOpen(false);
                  setSelectedSession(null);
                }}
                disabled={isUpdatingSession}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSession(
                    { sessionId: selectedSession.id, session_name: editNameValue },
                    {
                      onSuccess: () => {
                        setIsRenameModalOpen(false);
                        setSelectedSession(null);
                      },
                    }
                  );
                }}
                disabled={isUpdatingSession}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#a61c1e] text-white hover:bg-red-700 transition-colors disabled:opacity-50 min-w-[70px]"
              >
                {isUpdatingSession ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-white" />
                    Updating...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-[400px] max-w-full text-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-3 text-slate-800">Delete Session</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete session <strong className="text-slate-800 font-bold">"{selectedSession.session_name || `Session #${selectedSession.id}`}"</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedSession(null);
                }}
                disabled={isDeletingSession}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSession(selectedSession.id, {
                    onSuccess: () => {
                      setIsDeleteModalOpen(false);
                      setSelectedSession(null);
                    },
                  });
                }}
                disabled={isDeletingSession}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#a61c1e] text-white hover:bg-red-700 transition-colors disabled:opacity-50 min-w-[70px]"
              >
                {isDeletingSession ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-white" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default UploadSidebar;
