import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import Toast from "../../components/Toast.tsx";
import {
  CreateNDAActivity,
  GetNDAActivity,
  GetNDAResultFile,
  GetNDAStatus,
  ListNDAActivities,
} from "../../services/legal_checker.ts";

type NDAListItem = {
  id: number;
  title: string;
  document_type: string;
  status: string;
  uploaded_filename: string;
  created_on: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

const RISK_STYLES: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border border-red-200",
  MEDIUM: "bg-orange-50 text-orange-700 border border-orange-200",
  LOW: "bg-green-50 text-green-700 border border-green-200",
};

const CLAUSE_STATUS_STYLES: Record<string, string> = {
  COMPLIANT: "bg-green-50 text-green-700",
  HIGH: "bg-red-50 text-red-700",
  MEDIUM: "bg-orange-50 text-orange-700",
  LOW: "bg-blue-50 text-blue-700",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const NdaReview: React.FC = () => {
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("UNKNOWN");
  const [file, setFile] = useState<File | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useDispatch<Dispatch>();
  const toast = useSelector((state: RootState) => state.toast);
  const queryClient = useQueryClient();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (activityId: number, title: string) => {
    setDownloading(true);
    try {
      const blob = await GetNDAResultFile(activityId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeTitle = title.replace(/[^a-zA-Z0-9 _-]/g, "").slice(0, 50);
      link.href = url;
      link.download = `${safeTitle}_review.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      dispatch.toast.openToast({
        message: error?.response?.data?.detail || "Failed to download the reviewed document.",
        status: true,
        type: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  const { data: activities } = useQuery({
    queryKey: ["legal_checker_nda_list"],
    queryFn: ListNDAActivities,
  });

  const { data: statusData } = useQuery({
    queryKey: ["legal_checker_nda_status", selectedId],
    queryFn: () => GetNDAStatus(selectedId as number),
    enabled: !!selectedId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "PENDING" || status === "PROCESSING" ? 3000 : false;
    },
  });

  const isDone = statusData?.status === "COMPLETED";
  const isFailed = statusData?.status === "FAILED";

  const { data: activityDetail } = useQuery({
    queryKey: ["legal_checker_nda_detail", selectedId],
    queryFn: () => GetNDAActivity(selectedId as number),
    enabled: !!selectedId && isDone,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      CreateNDAActivity(title.trim(), documentType, file as File),
    onSuccess: (data) => {
      setSelectedId(data.id);
      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["legal_checker_nda_list"] });
    },
    onError: (error: any) => {
      dispatch.toast.openToast({
        message:
          error?.response?.data?.detail ||
          "Failed to submit NDA for review.",
        status: true,
        type: "error",
      });
    },
  });

  useEffect(() => {
    if (isDone || isFailed) {
      queryClient.invalidateQueries({ queryKey: ["legal_checker_nda_list"] });
    }
  }, [isDone, isFailed]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = () => {
    if (!file) {
      dispatch.toast.openToast({
        message: "Please select a file.",
        status: true,
        type: "error",
      });
      return;
    }
    if (!title.trim()) {
      dispatch.toast.openToast({
        message: "Please enter a title.",
        status: true,
        type: "error",
      });
      return;
    }
    submitMutation.mutate();
  };

  const result = activityDetail?.review_result;
  const summary = result?.deviation_summary || {};
  const keyFields = result?.key_fields || {};
  const clauses = result?.clause_analysis || [];
  const issues = (result?.field_validation_issues || []).filter(
    (i: any) =>
      i.field &&
      i.field.toLowerCase() !== "none" &&
      i.issue &&
      i.issue.toLowerCase() !== "none"
  );

  return (
    <>
      {toast?.status && toast?.type === "error" && (
        <div className="fixed top-[4rem] sm:top-[5rem] md:top-[6rem] left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
      <div className="flex flex-col gap-6 px-2 pt-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <Text type="subtitle" className="mb-4">
              Upload NDA for Review
            </Text>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer mb-4 hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Text type="small" className="text-gray-500">
                {file ? `📄 ${file.name}` : "Click to choose your NDA file"}
              </Text>
              <Text type="small" className="text-gray-400 mt-1">
                PDF or DOCX only
              </Text>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx"
              onChange={handleFileChange}
            />

            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (e.g. NDA with Vendor ABC)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
              />
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
              >
                <option value="UNKNOWN">Auto-detect type</option>
                <option value="UNILATERAL">Unilateral NDA</option>
                <option value="MUTUAL">Mutual NDA</option>
              </select>
              <Button
                className="w-full justify-center py-2.5"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                <Text type="small">
                  {submitMutation.isPending ? "Submitting..." : "Start Review"}
                </Text>
              </Button>
            </div>
          </div>

          {/* Recent activities */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <Text type="subtitle">Recent Reviews</Text>
              <button
                onClick={() =>
                  queryClient.invalidateQueries({
                    queryKey: ["legal_checker_nda_list"],
                  })
                }
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                ↻ Refresh
              </button>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {!activities?.length && (
                <Text type="small" className="text-gray-400">
                  No reviews yet.
                </Text>
              )}
              {activities?.map((item: NDAListItem) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                    selectedId === item.id
                      ? "border-danger"
                      : "border-gray-100"
                  }`}
                >
                  <div className="min-w-0">
                    <Text
                      type="small"
                      className="font-medium text-gray-800 truncate"
                    >
                      {item.title}
                    </Text>
                    <Text type="small" className="text-gray-400">
                      {formatDate(item.created_on)} · {item.document_type}
                    </Text>
                  </div>
                  <span
                    className={`ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                      STATUS_STYLES[item.status] || ""
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Result panel */}
        {selectedId && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {isFailed && (
              <Text type="small" className="text-red-700">
                <strong>Analysis failed:</strong>{" "}
                {statusData?.error_message || "Unknown error"}
              </Text>
            )}
            {!isFailed && !isDone && (
              <div className="flex items-center gap-3 text-blue-700">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                <Text type="small" className="font-medium">
                  Analysing NDA document… This may take 30–60 seconds.
                </Text>
              </div>
            )}
            {isDone && activityDetail && result && (
              <div>
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <Text type="subtitle">{activityDetail.title}</Text>
                    <Text type="small" className="text-gray-500 mt-0.5">
                      {result.document_type || ""} NDA ·{" "}
                      {formatDate(activityDetail.created_on)}
                    </Text>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        RISK_STYLES[result.overall_risk] || ""
                      }`}
                    >
                      {result.overall_risk} RISK
                    </span>
                    <button
                      onClick={() => handleDownload(selectedId as number, activityDetail.title)}
                      disabled={downloading}
                      className="text-sm text-white px-4 py-1.5 rounded-lg font-medium bg-danger disabled:opacity-60"
                    >
                      {downloading ? "Preparing…" : "↓ Download Review"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    [
                      "Total Checked",
                      summary.total_clauses_checked,
                      "text-gray-700 bg-gray-50 border-gray-200",
                    ],
                    [
                      "Compliant",
                      summary.compliant,
                      "text-green-700 bg-green-50 border-green-200",
                    ],
                    [
                      "Deviated",
                      summary.deviated,
                      "text-yellow-700 bg-yellow-50 border-yellow-200",
                    ],
                    [
                      "Missing",
                      summary.missing,
                      "text-red-700 bg-red-50 border-red-200",
                    ],
                  ].map(([label, val, cls]: any) => (
                    <div
                      key={label}
                      className={`rounded-lg p-3 text-center border ${cls}`}
                    >
                      <p className="text-2xl font-bold">{val ?? "—"}</p>
                      <p className="text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {Object.keys(keyFields).length > 0 && (
                  <div className="mb-6">
                    <Text
                      type="small"
                      className="font-semibold text-gray-700 mb-2"
                    >
                      Key Fields
                    </Text>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(keyFields).map(([k, v]: any) => (
                        <div
                          key={k}
                          className="bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <Text type="small" className="text-gray-400">
                            {k.replace(/_/g, " ")}
                          </Text>
                          <Text
                            type="small"
                            className="font-medium text-gray-800 truncate"
                          >
                            {v || "—"}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {issues.length > 0 && (
                  <div className="mb-6 p-3 rounded-lg border border-red-200 bg-red-50">
                    <Text
                      type="small"
                      className="font-semibold text-red-700 mb-2"
                    >
                      ⚠ Field Validation Issues
                    </Text>
                    <ul className="space-y-1">
                      {issues.map((i: any, idx: number) => (
                        <li key={idx} className="text-sm text-red-700">
                          <span className="font-medium">
                            {i.field.replace(/_/g, " ")}:
                          </span>{" "}
                          {i.issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Text
                  type="small"
                  className="font-semibold text-gray-700 mb-3"
                >
                  Clause Analysis
                </Text>
                {!clauses.length && (
                  <Text type="small" className="text-gray-400">
                    No clause analysis available.
                  </Text>
                )}
                <div className="space-y-2">
                  {clauses.map((c: any, idx: number) => (
                    <details
                      key={idx}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 list-none">
                        <Text type="small" className="font-medium text-gray-800">
                          {c.clause_name}
                        </Text>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium ${
                              CLAUSE_STATUS_STYLES[
                                c.status === "COMPLIANT"
                                  ? "COMPLIANT"
                                  : c.risk_level
                              ] || ""
                            }`}
                          >
                            {c.status}
                          </span>
                          {c.status !== "COMPLIANT" && (
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-medium ${
                                CLAUSE_STATUS_STYLES[c.risk_level] || ""
                              }`}
                            >
                              {c.risk_level}
                            </span>
                          )}
                        </div>
                      </summary>
                      {(c.deviation_description || c.suggested_wording) && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-700 space-y-2">
                          {c.deviation_description && (
                            <p>
                              <strong>
                                {c.status === "COMPLIANT" ? "Note" : "Issue"}:
                              </strong>{" "}
                              {c.deviation_description}
                            </p>
                          )}
                          {c.suggested_wording && (
                            <p className="text-green-800 bg-green-50 rounded p-2">
                              <strong>Suggested:</strong> {c.suggested_wording}
                            </p>
                          )}
                        </div>
                      )}
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NdaReview;
