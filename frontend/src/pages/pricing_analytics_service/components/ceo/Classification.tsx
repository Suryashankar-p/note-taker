import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ClassificationGrid from "./ClassificationGrid";
import ClassificationInsights from "./ClassificationInsights";
import { useGetClassificationMatrix } from "../../services/query/query";
import PageLoading from "../../../../components/PageLoading";

const Classification = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const activeBu = bu || "heating";

  const [selectedQuarter, setSelectedQuarter] = useState<string>("");
  const { data: classificationData, isLoading, error } = useGetClassificationMatrix(activeBu, selectedQuarter || undefined);

  const quartersList = useMemo(() => {
    return classificationData?.available_quarters || classificationData?.quarters || [];
  }, [classificationData]);

  useEffect(() => {
    if (quartersList.length > 0 && !selectedQuarter) {
      setSelectedQuarter(quartersList[quartersList.length - 1]);
    }
  }, [quartersList, selectedQuarter]);

  const is404 = useMemo(() => {
    const check404 = (err: any) => err?.response?.status === 404 || err?.status === 404;
    return check404(error);
  }, [error]);

  if (isLoading) {
    return <PageLoading />;
  }

  const isCeo = window.location.pathname.includes("/ceo");

  if (is404 || !classificationData || quartersList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-800">
        <h2 className="text-base font-bold text-gray-900 mb-2">No Classification Data Available</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          {isCeo
            ? `The ${activeBu} workspace has no classification data compiled yet.`
            : `The ${activeBu} workspace has no classification data compiled. Upload the required files to start.`}
        </p>
        {!isCeo && (
          <button
            onClick={() => navigate(`/ai-studio/pricing-analytics/workspace/dashboard/analyst/${activeBu}/upload`)}
            className="px-4 py-2 bg-[#a61c1e] text-white hover:bg-red-700 font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm"
          >
            Go to Upload Page
          </button>
        )}
      </div>
    );
  }

  const activeQuarter = selectedQuarter || classificationData.quarter || "";
  const activeData = classificationData || null;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-gray-800">

      {(() => {
        const formatDate = (raw?: string | null): string => {
          if (!raw) return "—";
          try {
            const ddmmyyyy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
            if (ddmmyyyy) {
              const [, dd, mm, yyyy] = ddmmyyyy;
              const date = new Date(`${yyyy}-${mm}-${dd}`);
              if (isNaN(date.getTime())) return raw;
              return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            }
            const normalized = raw.replace(/(\.\d{3})\d+/, "$1");
            const date = new Date(normalized);
            if (isNaN(date.getTime())) return raw;
            return date.toLocaleString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });
          } catch {
            return raw;
          }
        };

        const publishedBy = (classificationData as any)?.published_by || "—";
        const publishedAt = formatDate((classificationData as any)?.published_date);
        return (
          <div className="flex items-center gap-2 self-start bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-xs text-[11px] font-semibold text-gray-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-extrabold text-gray-900 uppercase tracking-wide">{activeBu}</span>
            <span className="text-gray-300 mx-0.5">·</span>
            <span className="text-gray-500">Published by</span>
            <span className="text-gray-800 font-bold">{publishedBy}</span>
            <span className="text-gray-300 mx-0.5">·</span>
            <span className="text-gray-500">Pushed at</span>
            <span className="text-gray-800 font-bold">{publishedAt}</span>
          </div>
        );
      })()}

      <ClassificationGrid
        data={activeData}
        quartersList={quartersList}
        selectedQuarter={activeQuarter}
        setSelectedQuarter={setSelectedQuarter}
        activeBu={activeBu}
      />

      {activeData?.insights?.insight_texts && (
        <ClassificationInsights data={activeData.insights.insight_texts} />
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => navigate("../select-bu")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          ← Welcome
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("../overall-margin")}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <button
            onClick={() => navigate(`../${activeBu}/revenue-gm-ladder`)}
            className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Classification;
