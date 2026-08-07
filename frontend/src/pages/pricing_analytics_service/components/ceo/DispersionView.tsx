import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DispersionBoxes from "./DispersionBoxes";
import DispersionCharts from "./DispersionCharts";
import DispersionMovementExamples from "./DispersionMovementExamples";
import { useGetDispersion, useGetQoqMatrix } from "../../services/query/query";
import PageLoading from "../../../../components/PageLoading";

const DispersionView = () => {
  const { bu } = useParams<{ bu: string }>();
  const navigate = useNavigate();
  const activeBu = bu || "heating";

  const [selectedFamily, setSelectedFamily] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  // Get available quarters and families list from QoqMatrix API
  const { data: matrixData, isLoading: isMatrixLoading } = useGetQoqMatrix(activeBu);

  const quarters = useMemo(() => {
    return matrixData?.quarters || [];
  }, [matrixData]);

  const families = useMemo(() => {
    if (!matrixData?.familyDetails) return [];
    return Object.values(matrixData.familyDetails).map((f: any) => ({
      nk: f.nk || f.name || "",
      display_name: f.name || f.display_name || f.nk || "",
    }));
  }, [matrixData]);

  // Set default selection values
  useEffect(() => {
    if (quarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(quarters[quarters.length - 1]);
    }
  }, [quarters, selectedQuarter]);

  useEffect(() => {
    if (families.length > 0 && !selectedFamily) {
      setSelectedFamily(families[0].nk);
    }
  }, [families, selectedFamily]);

  const { data: dispersionData, isLoading: isDispersionLoading } = useGetDispersion(
    activeBu,
    selectedQuarter || null,
    selectedFamily || null
  );

  if (isMatrixLoading || isDispersionLoading) {
    return <PageLoading />;
  }

  const qoqCards = dispersionData?.qoq_movement || dispersionData?.qoqCards || [];
  const examples = dispersionData?.examples || dispersionData?.dispersionExamples || [];
  
  // Format dispersion curve and trend data for DispersionCharts component
  const familyDispersion = {
    curve: dispersionData?.family_dispersion?.curve || dispersionData?.dispersionCurve || [],
    trend: dispersionData?.family_dispersion?.trend || dispersionData?.trendLine || [],
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto text-gray-800">
      {/* 1. Upper Dispersion Boxes */}
      {quarters.length > 0 && (
        <DispersionBoxes
          qoqCards={qoqCards}
          selectedQuarter={selectedQuarter}
          setSelectedQuarter={setSelectedQuarter}
          quarters={quarters}
          isFetching={isDispersionLoading}
        />
      )}

      {/* 2. Dispersion Curve and Trend Line Charts */}
      {families.length > 0 && (
        <DispersionCharts
          familyDispersion={familyDispersion}
          families={families}
          selectedFamily={selectedFamily}
          setSelectedFamily={setSelectedFamily}
          isFetching={isDispersionLoading}
        />
      )}

      {/* 3. Examples Table */}
      {examples.length > 0 && (
        <DispersionMovementExamples
          setSelectedFamily={setSelectedFamily}
          dispersionExamples={examples}
          selectedQuarter={selectedQuarter}
        />
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
            onClick={() => navigate(`../${activeBu}/revenue-gm-ladder`)}
            className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            ← Previous
          </button>
          <button
            onClick={() => navigate("../select-bu")}
            className="px-6 py-2 bg-[#a61c1e] hover:bg-[#8e181a] text-white font-bold rounded-lg text-xs tracking-wide transition-all shadow-md active:scale-95"
          >
            Back to business units
          </button>
        </div>
      </div>
    </div>
  );
};

export default DispersionView;
