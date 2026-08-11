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
  const { data: matrixData, isLoading: isMatrixLoading, error: matrixError } = useGetQoqMatrix(activeBu);

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

  // Wrap setSelectedFamily to resolve display_name or category examples to correct nk
  const handleSetSelectedFamily = (familyInput: string) => {
    if (!familyInput) return;
    const target = familyInput.toLowerCase().trim();
    // 1. Try to match by nk
    const matchByNk = families.find((f) => f.nk.toLowerCase() === target);
    if (matchByNk) {
      setSelectedFamily(matchByNk.nk);
      return;
    }
    // 2. Try to match by display_name
    const matchByDisplayName = families.find((f) => f.display_name.toLowerCase() === target);
    if (matchByDisplayName) {
      setSelectedFamily(matchByDisplayName.nk);
      return;
    }
    // 3. Try to clean suffix and match
    const cleanInput = familyInput.split(" (")[0].toLowerCase().trim();
    const matchByCleanNk = families.find((f) => f.nk.toLowerCase() === cleanInput);
    if (matchByCleanNk) {
      setSelectedFamily(matchByCleanNk.nk);
      return;
    }
    const matchByCleanDisplayName = families.find((f) => f.display_name.toLowerCase() === cleanInput);
    if (matchByCleanDisplayName) {
      setSelectedFamily(matchByCleanDisplayName.nk);
      return;
    }

    // Default fallback
    setSelectedFamily(familyInput);
  };

  useEffect(() => {
    if (families.length > 0 && !selectedFamily) {
      setSelectedFamily(families[0].nk);
    }
  }, [families, selectedFamily]);

  const { data: dispersionData, isLoading: isDispersionLoading, error: dispersionError } = useGetDispersion(
    activeBu,
    selectedQuarter || null,
    selectedFamily || null
  );

  const is404 = useMemo(() => {
    const check404 = (err: any) => err?.response?.status === 404 || err?.status === 404;
    return check404(matrixError) || check404(dispersionError);
  }, [matrixError, dispersionError]);

  if (isMatrixLoading || isDispersionLoading) {
    return <PageLoading />;
  }

  const isCeo = window.location.pathname.includes("/ceo");

  if (is404 || !matrixData || quarters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-800">
        <h2 className="text-base font-bold text-gray-900 mb-2">No Dispersion Data Available</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          {isCeo
            ? `The ${activeBu} workspace has no dispersion data compiled yet.`
            : `The ${activeBu} workspace has no dispersion data compiled. Upload the required files to start.`}
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

  const qoqCards = dispersionData?.qoq_cards || dispersionData?.qoq_movement || dispersionData?.qoqCards || [];
  const examples = dispersionData?.dispersion_examples || dispersionData?.examples || dispersionData?.dispersionExamples || [];
  
  // Format dispersion curve and trend data for DispersionCharts component
  const familyDispersion = {
    curve: dispersionData?.family_dispersion?.density_curves || dispersionData?.family_dispersion?.curve || dispersionData?.dispersionCurve || null,
    trend: dispersionData?.family_dispersion?.trend || dispersionData?.trendLine || null,
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
          setSelectedFamily={handleSetSelectedFamily}
          isFetching={isDispersionLoading}
        />
      )}

      {/* 3. Examples Table */}
      <DispersionMovementExamples
        setSelectedFamily={handleSetSelectedFamily}
        dispersionExamples={examples}
        selectedQuarter={selectedQuarter}
      />

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
