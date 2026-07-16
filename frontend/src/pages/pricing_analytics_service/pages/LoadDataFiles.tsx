import {
  FileText,
  Thermometer,
  BarChart3,
  DollarSign,
  List,
  X,
  Lock,
  Loader2,
} from "lucide-react";

import FileUploadCard from "../components/FileUploadCard";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useUploadCogs,
  useUploadTargets,
  useUploadBaseline,
  useUploadNonstdTargets,
  useUploadPriceList,
  useUploadCostList,
  useCreateSession,
} from "../services/query/query";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../redux/store";
import Toast from "../../../components/Toast";

const LoadFiles = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [pageError, setPageError] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [sessionName, setSessionName] = useState<string>("");

  useEffect(() => {
    localStorage.removeItem("pricing_session_id");
  }, []);

  const { mutate: uploadCogs } = useUploadCogs();
  const { mutate: uploadTargets } = useUploadTargets();
  const { mutate: uploadBaseline } = useUploadBaseline();
  const { mutate: uploadNonstdTargets } = useUploadNonstdTargets();
  const { mutate: uploadPriceList } = useUploadPriceList();
  const { mutate: uploadCostList } = useUploadCostList();
  const { mutate: createSession, isPending: isCreatingSession } = useCreateSession();

  const [files, setFiles] = useState([
    {
      title: "COGS Extract",
      // description: "COGS FY 26 FY 25 FY 24_v1.csv",
      status: "upload",
      fileName: "",
      icon: <FileText className="text-red-600" />,
      id: null as number | null,
    },

    {
      title: "Heating Targets",
      // description: "Target/Heating_Targets.csv",
      status: "upload",
      fileName: "",
      icon: <Thermometer className="text-red-600" />,
      id: null as number | null,
    },

    {
      title: "Heating Baseline",
      // description: "Baseline/Heating_baseline.csv",
      status: "upload",
      fileName: "",
      icon: <BarChart3 className="text-red-600" />,
      id: null as number | null,
    },

    {
      title: "Price List",
      // description:
      //   "Quarterly standard price list CSV (e.g. Q3FY26 in filename). Upload one file per quarter you need.",
      status: "upload",
      fileName: "",
      icon: <List className="text-red-600" />,
      id: null as number | null,
    },

    {
      title: "Cost List",
      // description:
      //   "Quarterly standard cost list CSV. Upload one file per quarter you need.",
      status: "upload",
      fileName: "",
      icon: <DollarSign className="text-red-600" />,
      id: null as number | null,
    },

    {
      title: "Non-standard Targets",
      // description:
      //   "Target/Heating_Non-Standard_Targets.csv — column J new margins_vJan26",
      status: "upload",
      fileName: "",
      icon: <X className="text-red-600" />,
      id: null as number | null,
    },
  ]);

  const handleUpload = (title: string, uploadedFile: File) => {
    setPageError(false);
    let uploadMutation: any = null;
    switch (title) {
      case "COGS Extract":
        uploadMutation = uploadCogs;
        break;
      case "Heating Targets":
        uploadMutation = uploadTargets;
        break;
      case "Heating Baseline":
        uploadMutation = uploadBaseline;
        break;
      case "Price List":
        uploadMutation = uploadPriceList;
        break;
      case "Cost List":
        uploadMutation = uploadCostList;
        break;
      case "Non-standard Targets":
        uploadMutation = uploadNonstdTargets;
        break;
      default:
        break;
    }

    if (uploadMutation) {
      setFiles((prev) =>
        prev.map((file) =>
          file.title === title
            ? { ...file, status: "loading", fileName: uploadedFile.name, id: null }
            : file,
        ),
      );

      uploadMutation(uploadedFile, {
        onSuccess: (data: any) => {
          if (data && data.detail) {
            console.error(`${title} upload error:`, data.detail);
            setFiles((prev) =>
              prev.map((file) =>
                file.title === title
                  ? { ...file, status: "upload", fileName: "", id: null }
                  : file,
              ),
            );
            setPageError(true);
            dispatch.toast.openToast({
              status: true,
              message: data.detail,
              type: "error",
            });
            return;
          }

          setFiles((prev) =>
            prev.map((file) =>
              file.title === title
                ? {
                  ...file,
                  status: "loaded",
                  fileName: uploadedFile.name,
                  id: data.id ?? data.file_id ?? (data.result && data.result.id)
                }
                : file,
            ),
          );
        },
        onError: (error: any) => {
          console.error(`${title} upload failed:`, error);
          setFiles((prev) =>
            prev.map((file) =>
              file.title === title
                ? { ...file, status: "upload", fileName: "", id: null }
                : file,
            ),
          );
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: error?.response?.data?.detail || "Upload failed",
            type: "error",
          });
        },
      });
    }
  };

  const handleContinue = () => {
    if (!allUploaded || isCreatingSession) return;
    setSessionName("");
    setIsCreateModalOpen(true);
  };

  const submitCreateSession = () => {
    if (!allUploaded || isCreatingSession) return;

    const cogsFile = files.find((f) => f.title === "COGS Extract");
    const targetsFile = files.find((f) => f.title === "Heating Targets");
    const baselineFile = files.find((f) => f.title === "Heating Baseline");
    const nonstdTargetsFile = files.find((f) => f.title === "Non-standard Targets");
    const priceListFile = files.find((f) => f.title === "Price List");
    const costListFile = files.find((f) => f.title === "Cost List");

    const payload = {
      session_name: sessionName.trim() || `Session - ${new Date().toLocaleDateString()}`,
      cogs_file_id: cogsFile?.id || 0,
      targets_file_id: targetsFile?.id || 0,
      baseline_file_id: baselineFile?.id || 0,
      nonstd_targets_file_id: nonstdTargetsFile?.id || 0,
      price_list_file_id: priceListFile?.id || 0,
      cost_list_file_id: costListFile?.id || 0,
    };

    createSession(payload, {
      onSuccess: (data: any) => {
        if (data && data.detail) {
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: data.detail,
            type: "error",
          });
          return;
        }
        const sessionId = data.id || data.session_id;
        if (sessionId) {
          localStorage.setItem("pricing_session_id", String(sessionId));
        }
        setIsCreateModalOpen(false);
        navigate("workspace", { state: { sessionId } });
      },
      onError: (error: any) => {
        setPageError(true);
        dispatch.toast.openToast({
          status: true,
          message: error?.response?.data?.detail || "Failed to create session",
          type: "error",
        });
      },
    });
  };

  const allUploaded = files.every((file) => file.status === "loaded");

  return (
    <div className="min-h-screen bg-slate-50">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="px-24 py-12">
        <h1 className="text-xl font-bold">Load Data Files</h1>

        <p className="mt-3 text-gray-500 text-sm">
          Upload all required files before continuing.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-5">
          {files.map((file) => (
            <FileUploadCard
              key={file.title}
              title={file.title}
              // description={file.description}
              status={file.status as "loaded" | "upload" | "loading"}
              icon={file.icon}
              onUpload={(uploadedFile: File) =>
                handleUpload(file.title, uploadedFile)
              }
              fileName={file.fileName}
            />
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center text-center gap-3">
          <button
            onClick={handleContinue}
            disabled={!allUploaded || isCreatingSession}
            className={`
              flex
              items-center
              justify-center
              gap-2
              w-[500px]
              rounded-xl 
              px-6
              py-3.5
              text-sm
              font-semibold 
              shadow-sm
              transition-all
              duration-200
              ${allUploaded && !isCreatingSession
                ? "bg-[#a61c1e] text-white hover:bg-red-700 cursor-pointer"
                : "bg-[#dbdbdb] text-[#7c7c7c] cursor-not-allowed"
              }
            `}
          >
            {isCreatingSession ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Session...
              </>
            ) : !allUploaded ? (
              <>
                <Lock size={18} className="text-[#969696]" />
                Upload all six files to continue
              </>
            ) : (
              "Create Session & Continue →"
            )}
          </button>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-[400px] max-w-full text-slate-800 shadow-xl text-left">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Create Session</h3>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Session Name
              </label>
              <input
                type="text"
                placeholder={`e.g. Session - ${new Date().toLocaleDateString()}`}
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                disabled={isCreatingSession}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#a61c1e]/20 focus:border-[#a61c1e] disabled:opacity-50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submitCreateSession();
                  } else if (e.key === "Escape") {
                    if (!isCreatingSession) setIsCreateModalOpen(false);
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                }}
                disabled={isCreatingSession}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitCreateSession}
                disabled={isCreatingSession}
                className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#a61c1e] text-white hover:bg-red-700 transition-colors disabled:opacity-50 min-w-[70px]"
              >
                {isCreatingSession ? (
                  <>
                    <Loader2 size={12} className="animate-spin text-white" />
                    Creating...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadFiles;
