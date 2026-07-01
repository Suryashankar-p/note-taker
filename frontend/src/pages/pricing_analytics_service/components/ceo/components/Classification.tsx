import React from "react";
import ClassificationGrid from "./ClassificationGrid";
import ClassificationInsights from "./ClassificationInsights";
import { useGetClassificationMatrix } from "../../../services/query/query";

const Classification = () => {
  const sessionId = Number(localStorage.getItem("pricing_session_id")) || 10;
  const { data, isLoading } = useGetClassificationMatrix(sessionId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-700"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto">
      {/* 1. 3x3 Freq Grid */}
      <ClassificationGrid data={data?.matrix} />

      {/* 2. Insights */}
      <ClassificationInsights />
    </div>
  );
};

export default Classification;
