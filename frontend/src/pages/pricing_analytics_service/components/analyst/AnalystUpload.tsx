import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Thermometer, BarChart3, List, DollarSign, X, Check, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../../redux/store";
import Toast from "../../../../components/Toast";
import FileUploadCard from "../FileUploadCard";
import {
  useUploadCogs,
  useUploadTargets,
  useUploadBaseline,
  useUploadNonstdTargets,
  useUploadPriceList,
  useUploadCostList,
  useUploadChannelPriceList,
  useUploadDirectPriceList,
  useCompile,
} from "../../services/query/query";

const AnalystUpload = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [pageError, setPageError] = useState<boolean>(false);

  const activeBu = bu || "heating";
  const buLabel = activeBu.charAt(0).toUpperCase() + activeBu.slice(1);

  const { mutate: uploadCogs } = useUploadCogs();
  const { mutate: uploadTargets } = useUploadTargets();
  const { mutate: uploadBaseline } = useUploadBaseline();
  const { mutate: uploadNonstdTargets } = useUploadNonstdTargets();
  const { mutate: uploadPriceList } = useUploadPriceList();
  const { mutate: uploadCostList } = useUploadCostList();
  const { mutate: uploadChannelPriceList } = useUploadChannelPriceList();
  const { mutate: uploadDirectPriceList } = useUploadDirectPriceList();
  const { mutate: compile, isPending: isCompiling } = useCompile();

  const [fileStates, setFileStates] = useState<
    Record<string, { status: "loaded" | "upload" | "loading"; fileName: string; id: number | null }>
  >({});
  const [compileWarnings, setCompileWarnings] = useState<string[]>([]);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);

  const getRequiredFiles = (businessUnit: string) => {
    const unitLabel = businessUnit.charAt(0).toUpperCase() + businessUnit.slice(1);
    const common = [
      { type: "cogs", title: "COGS Extract", icon: <FileText className="text-red-650" /> },
      { type: "targets", title: `${unitLabel} Targets`, icon: <Thermometer className="text-red-650" /> },
      { type: "baseline", title: `${unitLabel} Baseline`, icon: <BarChart3 className="text-red-650" /> },
      { type: "nonstd_targets", title: "Non-standard Targets", icon: <X className="text-red-650" /> },
    ];

    if (businessUnit === "heating") {
      return [
        ...common,
        { type: "price_list", title: "Price List", icon: <List className="text-red-650" /> },
        { type: "cost_list", title: "Cost List", icon: <DollarSign className="text-red-650" /> },
      ];
    } else if (businessUnit === "cooling") {
      return [
        ...common,
        { type: "price_list", title: "Price List", icon: <List className="text-red-650" /> },
      ];
    } else if (businessUnit === "water") {
      return [
        ...common,
        { type: "channel_price_list", title: "Channel Price List", icon: <List className="text-red-650" /> },
        { type: "direct_price_list", title: "Direct Price List", icon: <DollarSign className="text-red-650" /> },
      ];
    }
    return common;
  };

  const requiredFilesConfig = getRequiredFiles(activeBu);

  useEffect(() => {
    const initialStates: typeof fileStates = {};
    requiredFilesConfig.forEach((f) => {
      initialStates[f.type] = {
        status: "upload",
        fileName: "",
        id: null,
      };
    });
    setFileStates(initialStates);
    setCompileWarnings([]);
    setShowWarningModal(false);
    setPageError(false);
  }, [activeBu]);

  const getMutationForType = (type: string) => {
    switch (type) {
      case "cogs": return uploadCogs;
      case "targets": return uploadTargets;
      case "baseline": return uploadBaseline;
      case "nonstd_targets": return uploadNonstdTargets;
      case "price_list": return uploadPriceList;
      case "cost_list": return uploadCostList;
      case "channel_price_list": return uploadChannelPriceList;
      case "direct_price_list": return uploadDirectPriceList;
      default: return null;
    }
  };

  const handleUpload = (type: string, file: File) => {
    const mutate = getMutationForType(type);
    if (!mutate) return;

    setPageError(false);
    setFileStates((prev) => ({
      ...prev,
      [type]: { status: "loading", fileName: file.name, id: null },
    }));

    mutate(
      { file, business_unit: activeBu },
      {
        onSuccess: (data: any) => {
          const errorMessage = data?.detail || data?.error || data?.message || (data?.success === false ? "Upload failed" : null);
          const fileId = data?.file_id ?? data?.id ?? (data?.result && data?.result.id);

          if (errorMessage || !fileId) {
            setFileStates((prev) => ({
              ...prev,
              [type]: { status: "upload", fileName: "", id: null },
            }));
            setPageError(true);
            dispatch.toast.openToast({
              status: true,
              message: errorMessage || "Upload failed: Invalid server response",
              type: "error",
            });
            return;
          }

          setFileStates((prev) => ({
            ...prev,
            [type]: {
              status: "loaded",
              fileName: file.name,
              id: fileId,
            },
          }));
        },
        onError: (error: any) => {
          setFileStates((prev) => ({
            ...prev,
            [type]: { status: "upload", fileName: "", id: null },
          }));
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: error?.response?.data?.detail || "Upload failed",
            type: "error",
          });
        },
      }
    );
  };

  const handleCompile = () => {
    const fileIds = requiredFilesConfig
      .map((f) => fileStates[f.type]?.id)
      .filter((id): id is number => id !== null && id !== undefined);

    setPageError(false);
    compile(
      { business_unit: activeBu, file_ids: fileIds },
      {
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

          if (data?.warnings && data.warnings.length > 0) {
            setCompileWarnings(data.warnings);
            setShowWarningModal(true);
          } else {
            dispatch.toast.openToast({
              status: true,
              message: data.message || "Compilation completed successfully",
              type: "success",
            });
            navigate(`../${activeBu}/overall-margin`);
          }
        },
        onError: (error: any) => {
          setPageError(true);
          dispatch.toast.openToast({
            status: true,
            message: error?.response?.data?.detail || "Calculation engine failed to compile",
            type: "error",
          });
        },
      }
    );
  };

  const allUploaded = requiredFilesConfig.every((file) => fileStates[file.type]?.status === "loaded");

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-gray-800">
      {toastStatus.status && pageError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold">Load Data Files — {buLabel}</h1>
            <p className="text-xs text-gray-500 mt-1">
              Verify that all files are loaded and validated correctly before launching the pricing analysis studio.
            </p>
          </div>
          <button
            onClick={() => navigate("../select-bu")}
            className="px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-lg tracking-wide transition-colors shadow-sm"
          >
            ← Change BU
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          {requiredFilesConfig.map((file) => {
            const state = fileStates[file.type] || { status: "upload", fileName: "", id: null };
            return (
              <FileUploadCard
                key={file.type}
                title={file.title}
                status={state.status}
                icon={file.icon}
                onUpload={(uploadedFile: File) => handleUpload(file.type, uploadedFile)}
                onClear={() => {
                  setFileStates((prev) => ({
                    ...prev,
                    [file.type]: { status: "upload", fileName: "", id: null },
                  }));
                }}
                fileName={state.fileName}
              />
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center text-center gap-4">
          {allUploaded ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs font-semibold max-w-lg flex items-center gap-2">
              <Check size={16} className="text-emerald-600 shrink-0" />
              All data files are present and uploaded. Click below to compile.
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs font-semibold max-w-lg flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
              Upload all required files to unlock the compilation calculation engine.
            </div>
          )}

          <button
            onClick={handleCompile}
            disabled={!allUploaded || isCompiling}
            className={`
              flex
              items-center
              justify-center
              gap-2
              w-[450px]
              rounded-xl 
              px-6
              py-3.5
              text-xs
              font-bold 
              shadow-sm
              transition-all
              duration-200
              ${allUploaded && !isCompiling
                ? "bg-[#a61c1e] text-white hover:bg-red-750 cursor-pointer"
                : "bg-[#dbdbdb] text-[#7c7c7c] cursor-not-allowed"
              }
            `}
          >
            {isCompiling ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                Compiling calculations (may take minutes)...
              </>
            ) : (
              <>
                Compile & Review Workspace <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>

      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-[500px] max-w-full text-slate-800 shadow-xl text-left">
            <h3 className="text-lg font-bold mb-3 text-amber-600 flex items-center gap-2">
              <AlertTriangle size={20} /> Compile Warnings
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              The calculation engine compiled successfully, but detected some differences in quarter coverage:
            </p>
            <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900">
                {compileWarnings.map((warn, index) => (
                  <li key={index}>{warn}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowWarningModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Dismiss & Review Uploads
              </button>
              <button
                onClick={() => {
                  setShowWarningModal(false);
                  navigate(`../${activeBu}/overall-margin`);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#a61c1e] text-white hover:bg-red-700 transition-colors"
              >
                Proceed to Workspace anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalystUpload;
