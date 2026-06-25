import React from "react";
import { AlertCircle } from "lucide-react";

interface SKUItem {
  sku: string;
  orderNo: string;
  itemCode: string;
  desc: string;
  channel: string;
  listPrice: string;
  actualPrice: string;
  priceDeviation: string;
  listCost: string;
  actualCost: string;
  costDeviation: string;
}

interface NonStdSKUItem {
  sku: string;
  orderNo: string;
  itemCode: string;
  desc: string;
  actualMargin: string;
  targetMargin: string;
  deviation: string;
  overallActual: string;
  overallTarget: string;
}

interface SkuDrillDownTabProps {
  selectedFamily: string | null;
}

const SkuDrillDownTab: React.FC<SkuDrillDownTabProps> = ({ selectedFamily }) => {
  // Mock Standard SKUs data
  const standardSkusList: SKUItem[] = [
    { sku: "Air nozzle", orderNo: "36075197", itemCode: "PF0010022", desc: "AIR NOZZLE - CAST - CR-25, 10-178-00 Mix MTED, 11 HOLES x DIA 2.5", channel: "Direct", listPrice: "1620.00", actualPrice: "1360.00", priceDeviation: "-260.00", listCost: "1050.00", actualCost: "1001.33", costDeviation: "-48.67" },
    { sku: "Air nozzle", orderNo: "36075197", itemCode: "PF0010022", desc: "AIR NOZZLE - (MACHINE) - S.S. 410 - OD 38, 18 HOLES x DIA. 3.0 FOR HX", channel: "Direct", listPrice: "1013.00", actualPrice: "825.00", priceDeviation: "-188.00", listCost: "385.00", actualCost: "393.43", costDeviation: "8.43" },
    { sku: "Air nozzle", orderNo: "36098877", itemCode: "PF0010035", desc: "AIR NOZZLE - D - CR-25, 16 HOLES x DIA 3.0", channel: "Direct", listPrice: "353.00", actualPrice: "290.00", priceDeviation: "-63.00", listCost: "112.50", actualCost: "113.88", costDeviation: "1.38" },
    { sku: "Air nozzle", orderNo: "36075197", itemCode: "PF0010022", desc: "AIR NOZZLE - (MACHINE) - S.S. 410 - OD 38, 18 HOLES x DIA. 3.0 FOR HX", channel: "Direct", listPrice: "1013.00", actualPrice: "825.00", priceDeviation: "-188.00", listCost: "385.00", actualCost: "397.39", costDeviation: "12.39" }
  ];

  // Mock Non-standard SKUs data
  const nonStdSkusList: NonStdSKUItem[] = [
    { sku: "Air nozzle", orderNo: "36075198", itemCode: "XJ00331002", desc: "XS AIR NOZZLE (OD 38)", actualMargin: "45.0%", targetMargin: "63.0%", deviation: "-18.0", overallActual: "62.4%", overallTarget: "64.8%" },
    { sku: "Air nozzle", orderNo: "36075210", itemCode: "PF00144365", desc: "AIR NOZZLE - CAST - CR-25, 10-178 - OD 38 x 11 HOLES x DIA 2.7", actualMargin: "47.1%", targetMargin: "65.3%", deviation: "-18.2", overallActual: "62.4%", overallTarget: "64.8%" }
  ];

  const hasSelectedFamily = selectedFamily !== null;

  return (
    <div className="flex flex-col gap-8 text-gray-800 pb-12">
      {/* Dynamic SKU Alert Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col gap-3">
        <h3 className="text-sm font-bold tracking-tight text-gray-850">
          SKU drill-down
        </h3>
        
        {hasSelectedFamily ? (
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-[#a61c1e] bg-red-50 border border-red-150 px-3 py-1 rounded-lg">
              Active Family: {selectedFamily} • Q4 FY 26
            </span>
          </div>
        ) : (
          <div className="text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-3 py-1 rounded-lg">
            No family selected
          </div>
        )}

        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-xl text-xs font-semibold">
          <AlertCircle className="text-teal-600 shrink-0" size={16} />
          <p>For any other product family, go to Step 3: click a cell in the QoQ matrix, select a product family, then open SKU drill-down.</p>
        </div>
      </div>

      {/* 1. Standard SKUs Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Standard SKUs (price / cost deviations)
          </h4>
          <span className="text-[10px] text-gray-400 font-bold">
            Showing {hasSelectedFamily ? standardSkusList.length : 0} lines
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">PF</th>
                <th className="py-2.5 px-3 text-center">Order No</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 w-72">Item Description</th>
                <th className="py-2.5 px-3 text-center">Channel</th>
                <th className="py-2.5 px-3 text-right">List Price</th>
                <th className="py-2.5 px-3 text-right">Actual Price</th>
                <th className="py-2.5 px-3 text-right">Price Deviation</th>
                <th className="py-2.5 px-3 text-right">List Cost</th>
                <th className="py-2.5 px-3 text-right">Actual Cost</th>
                <th className="py-2.5 px-3 text-right">Cost Deviation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {hasSelectedFamily ? (
                standardSkusList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{item.orderNo}</td>
                    <td className="py-2.5 px-3 text-center">{item.itemCode}</td>
                    <td className="py-2.5 px-3 text-gray-600 leading-relaxed font-normal">{item.desc}</td>
                    <td className="py-2.5 px-3 text-center">{item.channel}</td>
                    <td className="py-2.5 px-3 text-right">{item.listPrice}</td>
                    <td className="py-2.5 px-3 text-right">{item.actualPrice}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{item.priceDeviation}</td>
                    <td className="py-2.5 px-3 text-right">{item.listCost}</td>
                    <td className="py-2.5 px-3 text-right">{item.actualCost}</td>
                    <td className={`py-2.5 px-3 text-right font-bold ${item.costDeviation.startsWith("-") ? "text-rose-600" : "text-emerald-600"}`}>
                      {item.costDeviation}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="py-6 text-center text-gray-400 font-bold text-xs bg-slate-50/30">
                    No active product family. Select a family row in step 3 to populate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Non-standard SKUs Table */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-hidden">
        <div className="pb-3 border-b border-gray-100 mb-4 flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">
            Non-standard SKUs (vs non-standard targets)
          </h4>
          <span className="text-[10px] text-gray-400 font-bold">
            Showing {hasSelectedFamily ? nonStdSkusList.length : 0} lines
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-150 bg-gray-50 text-gray-500 font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-3">PF</th>
                <th className="py-2.5 px-3 text-center">Order No</th>
                <th className="py-2.5 px-3 text-center">Item Code</th>
                <th className="py-2.5 px-3 w-72">Item Description</th>
                <th className="py-2.5 px-3 text-right">Actual Non-Std Margin</th>
                <th className="py-2.5 px-3 text-right">Target Non-Std Margin</th>
                <th className="py-2.5 px-3 text-right">Deviation (PP)</th>
                <th className="py-2.5 px-3 text-right">Overall Actual (PP)</th>
                <th className="py-2.5 px-3 text-right">Overall Target (PP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {hasSelectedFamily ? (
                nonStdSkusList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-semibold text-gray-900">{item.sku}</td>
                    <td className="py-2.5 px-3 text-center text-gray-500">{item.orderNo}</td>
                    <td className="py-2.5 px-3 text-center">{item.itemCode}</td>
                    <td className="py-2.5 px-3 text-gray-600 leading-relaxed font-normal">{item.desc}</td>
                    <td className="py-2.5 px-3 text-right">{item.actualMargin}</td>
                    <td className="py-2.5 px-3 text-right">{item.targetMargin}</td>
                    <td className="py-2.5 px-3 text-right text-rose-600 font-bold">{item.deviation}</td>
                    <td className="py-2.5 px-3 text-right">{item.overallActual}</td>
                    <td className="py-2.5 px-3 text-right">{item.overallTarget}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-gray-400 font-bold text-xs bg-slate-50/30">
                    No active product family. Select a family row in step 3 to populate.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkuDrillDownTab;
