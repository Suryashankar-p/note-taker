import React, { useState, useEffect, useMemo } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../../redux/store";
import Toast from "../../../../components/Toast";
import CustomSelect from "../CustomSelect";
import {
  type SkuNonStdRow,
  type SkuStandardRow,
  fmt,
  fmtLakhs,
  fmtPP,
  useGetSkuDeviation,
  usePublish,
} from "../../services/query/query";
import PageLoading from "../../../../components/PageLoading";

interface SkuDrillDownTabProps {
  selectedFamily?: string | null;
}

const SkuDrillDownTab: React.FC<SkuDrillDownTabProps> = ({
  selectedFamily: propsSelectedFamily,
}) => {
  const context = useOutletContext<any>() || {};
  const onNavigateToTab = context.onNavigateToTab;
  const { bu } = useParams<{ bu?: string }>();
  const activeBu = bu || "heating";
  const buLabel = activeBu.charAt(0).toUpperCase() + activeBu.slice(1);

  const navigate = useNavigate();
  const dispatch = useDispatch<Dispatch>();
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const { mutate: publish, isPending: isPublishing } = usePublish();

  const selectedFamily =
    propsSelectedFamily !== undefined
      ? propsSelectedFamily
      : context.selectedFamily;

  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const { data: skuData, isLoading, error } = useGetSkuDeviation(
    activeBu,
    selectedQuarter || null,
    selectedFamily || null
  );

  const sortedQuarters = useMemo(() => {
    return skuData?.sortedQuarters || [];
  }, [skuData]);

  useEffect(() => {
    if (sortedQuarters.length > 0 && !selectedQuarter) {
      setSelectedQuarter(sortedQuarters[sortedQuarters.length - 1]);
    }
  }, [sortedQuarters, selectedQuarter]);

  const is404 = useMemo(() => {
    const check404 = (err: any) => err?.response?.status === 404 || err?.status === 404;
    return check404(error);
  }, [error]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (is404 || !skuData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
        <h2 className="text-base font-bold text-gray-900 mb-2">No SKU Deviation Data Available</h2>
        <p className="text-xs text-gray-500 max-w-sm mb-6 leading-relaxed">
          The {activeBu} workspace has no SKU deviation data compiled. Upload the required files to start.
        </p>
        <button
          onClick={() => onNavigateToTab?.("upload")}
          className="px-4 py-2 bg-[#a61c1e] text-white hover:bg-red-700 font-bold rounded-lg text-xs tracking-wide transition-colors shadow-sm"
        >
          Go to Upload Page
        </button>
      </div>
    );
  }

  const activeQuarter = selectedQuarter || skuData?.latestQuarter || "";
  const quarterData = skuData?.quarterMap?.[activeQuarter];

  const nonstdRows: SkuNonStdRow[] = selectedFamily
    ? quarterData?.nonstd_rows || []
    : [];
  const standardRows: SkuStandardRow[] = selectedFamily
    ? quarterData?.standard_rows || []
    : [];

  const getChannelValue = (item: SkuNonStdRow | SkuStandardRow) =>
    item.channel_or_direct ?? item.channel_direct ?? item.channel ?? "—";

  const handlePublishClick = () => {
    setShowPublishModal(true);
  };

  const handleConfirmPublish = () => {
    publish(
      { business_unit: activeBu },
      {
        onSuccess: (data: any) => {
          if (data && data.detail) {
            dispatch.toast.openToast({
              status: true,
              message: data.detail,
              type: "error",
            });
            return;
          }

          dispatch.toast.openToast({
            status: true,
            message: data.message || "Workspace published successfully",
            type: "success",
          });
          setShowPublishModal(false);
        },
        onError: (error: any) => {
          dispatch.toast.openToast({
            status: true,
            message: error?.response?.data?.detail || "Publishing failed",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {toastStatus.status && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type={toastStatus.type as "success" | "error"} />
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-bold tracking-tight text-gray-850">
            SKU Drill-down — Deviation Analysis
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Quarter
            </span>
            {sortedQuarters.length > 0 && (
              <CustomSelect
                options={sortedQuarters}
                value={activeQuarter}
                onChange={setSelectedQuarter}
                labelPrefix=""
                alignRight
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {selectedFamily ? (
            <span className="font-extrabold text-[#a61c1e] bg-red-50 border border-red-200 px-3 py-1 rounded-lg text-xs">
              Active Family: {selectedFamily} · {activeQuarter}
            </span>
          ) : (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
              ⚠ No family selected — go to Step 3
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-xl text-xs font-semibold">
          <AlertCircle className="text-teal-600 shrink-0" size={16} />
          <p>
            {selectedFamily
              ? `Showing deviations for "${selectedFamily}". Use the QoQ Matrix to switch families.`
              : "Go back to Step 3 (QoQ Matrix) → click a cell → select a product family to see its SKU deviations here."}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Standard SKUs — price / cost deviations
          </h4>
          <span className="text-[10px] text-gray-400 font-bold">
            {standardRows.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">PF</th>
                <th className="py-2.5 px-3 text-center">Order No</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 w-72">Description</th>
                <th className="py-2.5 px-3">Channel / Direct</th>
                <th className="py-2.5 px-3 text-right">List Price</th>
                <th className="py-2.5 px-3 text-right">Actual Price</th>
                <th className="py-2.5 px-3 text-right">Price Deviation</th>
                <th className="py-2.5 px-3 text-right">List Cost</th>
                <th className="py-2.5 px-3 text-right">Actual Cost</th>
                <th className="py-2.5 px-3 text-right">Cost Deviation</th>
                <th className="py-2.5 px-3 text-right">
                  Overall margin (actual)
                </th>
                <th className="py-2.5 px-3 text-right">PF target (overall)</th>
                <th className="py-2.5 px-3 text-right">Notional loss (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {standardRows.length > 0 ? (
                standardRows.map((item, idx) => {
                  const priceDevNum = item.price_deviation ?? 0;
                  const costDevNum = item.cost_deviation ?? 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                        {item.product_family}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-500 whitespace-nowrap">
                        {item.order_no}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {item.item_code}
                      </td>
                      <td className="py-2.5 px-3 text-gray-600 leading-relaxed font-normal">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-gray-700">
                        {getChannelValue(item)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.list_price != null
                          ? fmt(item.list_price, 2)
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.actual_price != null
                          ? fmt(item.actual_price, 2)
                          : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          priceDevNum < 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.price_deviation != null
                          ? fmtPP(priceDevNum)
                          : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.list_cost != null ? fmt(item.list_cost, 2) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.actual_cost != null
                          ? fmt(item.actual_cost, 2)
                          : "—"}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          costDevNum < 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {item.cost_deviation != null ? fmtPP(costDevNum) : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                        {item.overall_margin_actual != null
                          ? `${fmt(item.overall_margin_actual)}%`
                          : item.overall_actual != null
                            ? `${fmt(item.overall_actual)}%`
                            : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                        {item.overall_target_pf != null
                          ? `${fmt(item.overall_target_pf)}%`
                          : item.overall_target != null
                            ? `${fmt(item.overall_target)}%`
                            : "—"}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                        {item.notional_loss != null
                          ? item.notional_loss >= 100000
                            ? fmtLakhs(item.notional_loss)
                            : `₹${item.notional_loss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={14}
                    className="py-6 text-center text-gray-400 font-bold text-xs bg-slate-50/30"
                  >
                    {selectedFamily
                      ? `No standard SKU deviations found for "${selectedFamily}" in ${activeQuarter}.`
                      : "No standard SKU data available for this quarter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Non-standard SKUs — margin vs. target
          </h4>
          <span className="text-[10px] text-gray-400 font-bold">
            {nonstdRows.length} rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-55 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">PF</th>
                <th className="py-2.5 px-3 text-center">Order No</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 w-72">Description</th>
                <th className="py-2.5 px-3 text-right">
                  Actual non-std margin
                </th>
                <th className="py-2.5 px-3 text-right">
                  Target non-std margin
                </th>
                <th className="py-2.5 px-3 text-right">Deviation (pp)</th>
                <th className="py-2.5 px-3 text-right">Overall actual (PF)</th>
                <th className="py-2.5 px-3 text-right">Overall target (PF)</th>
                <th className="py-2.5 px-3 text-right">Notional loss (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {nonstdRows.length > 0 ? (
                nonstdRows.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap">
                      {item.product_family}
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-500 whitespace-nowrap">
                      {item.order_no}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {item.item_code}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600 leading-relaxed font-normal">
                      {item.description}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                      {item.actual_nonstd_margin != null
                        ? `${fmt(item.actual_nonstd_margin)}%`
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                      {item.target_nonstd_margin != null
                        ? `${fmt(item.target_nonstd_margin)}%`
                        : "—"}
                    </td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${item.deviation_pp < 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      {item.deviation_pp != null
                        ? fmtPP(item.deviation_pp)
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                      {item.overall_actual != null
                        ? `${fmt(item.overall_actual)}%`
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap text-gray-700">
                      {item.overall_target != null
                        ? `${fmt(item.overall_target)}%`
                        : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-700 whitespace-nowrap">
                      {item.notional_loss != null
                        ? item.notional_loss >= 100000
                          ? fmtLakhs(item.notional_loss)
                          : `₹${item.notional_loss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`
                        : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="py-6 text-center text-gray-400 font-bold text-xs bg-slate-50/30"
                  >
                    {selectedFamily
                      ? `No non-standard SKU deviations found for "${selectedFamily}" in ${activeQuarter}.`
                      : "No non-standard SKU data available for this quarter."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 pt-6 mt-4">
        <button
          onClick={() => onNavigateToTab?.("qoq-matrix")}
          className="px-5 py-2 border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
        >
          Previous
        </button>
        <button
          onClick={handlePublishClick}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs tracking-wider uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          Publish Workspace
        </button>
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 w-[450px] max-w-full text-slate-800 shadow-xl text-left">
            <h3 className="text-sm font-extrabold mb-3 text-slate-900 uppercase tracking-wider">
              Publish Draft Calculations
            </h3>
            <p className="text-xs text-slate-650 mb-6 leading-relaxed">
              Are you sure you want to publish the draft calculations for the <strong>{buLabel}</strong> business unit? This will promote the latest compiled data to the live dashboard for CEO/CFO view.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isPublishing}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isPublishing ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Publishing...
                  </>
                ) : (
                  "Confirm & Publish"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkuDrillDownTab;
