import { SkuQuarterData } from "./types";

export const transformSkyscraperData = (response: any) => {
  const transformed: Record<string, any> = {};
  
  Object.defineProperty(transformed, "byQuarter", {
    value: {} as Record<string, any>,
    enumerable: false,
    writable: true,
    configurable: true
  });

  if (response && response.quarters) {
    response.quarters.forEach((q: any) => {
      const targetBars = q.vs_target?.bars || [];
      const baselineBars = q.vs_baseline?.bars || [];
      
      const baselineRefMap = new Map<string, { ref_gm_pct: number; margin_gap_pp: number }>();
      baselineBars.forEach((b: any) => {
        if (b.family_nk) {
          baselineRefMap.set(b.family_nk.toLowerCase(), {
            ref_gm_pct: b.ref_gm_pct ?? 0,
            margin_gap_pp: b.margin_gap_pp ?? 0,
          });
        }
      });

      const mergedBars = targetBars.map((tBar: any) => {
        const nk = tBar.family_nk?.toLowerCase();
        const baselineInfo = nk ? baselineRefMap.get(nk) : undefined;
        return {
          ...tBar,
          ref_gm_pct: baselineInfo ? baselineInfo.ref_gm_pct : tBar.ref_gm_pct,
          baseline_margin_gap_pp: baselineInfo ? baselineInfo.margin_gap_pp : 0,
        };
      });

      transformed[q.quarter] = mergedBars;

      transformed.byQuarter[q.quarter] = {
        bars: mergedBars,
        insights: q.insights || [],
        vs_target: {
          above_target: q.vs_target?.above_target ?? 0,
          below_target: q.vs_target?.below_target ?? 0,
          at_target: q.vs_target?.at_target ?? 0,
        },
        vs_baseline: {
          above_baseline: q.vs_baseline?.above_baseline ?? q.vs_baseline?.above_target ?? q.vs_baseline?.above ?? 0,
          below_baseline: q.vs_baseline?.below_baseline ?? q.vs_baseline?.below_target ?? q.vs_baseline?.below ?? 0,
        }
      };
    });
  }
  return transformed;
};

export const transformQoqMatrixData = (response: any) => {
  const familyDetails: Record<string, any> = {};
  const quarterMatrices: Record<string, any> = {};
  const familyHistory: Record<string, Record<string, any>> = {};

  if (response && response.quarters) {
    response.quarters.forEach((qEntry: any) => {
      const quarter: string = qEntry.quarter;
      const qMatrix: Record<string, Record<string, string[]>> = {};

      Object.entries(qEntry.matrix || {}).forEach(([rowKey, cols]: [string, any]) => {
        qMatrix[rowKey] = {};
        Object.entries(cols).forEach(([colKey, cellData]: [string, any]) => {
          const familiesArr: any[] = Array.isArray(cellData)
            ? cellData
            : (cellData?.families ?? []);

          const names: string[] = [];
          familiesArr.forEach((fam: any) => {
            const displayName = fam.name || fam.display_name || fam.nk;
            names.push(displayName);

            const lk = displayName.toLowerCase();
            familyDetails[lk] = fam;
            if (fam.nk) familyDetails[fam.nk.toLowerCase()] = fam;

            if (!familyHistory[lk]) familyHistory[lk] = {};
            familyHistory[lk][quarter] = fam;
            if (fam.nk) {
              const nkLk = fam.nk.toLowerCase();
              if (!familyHistory[nkLk]) familyHistory[nkLk] = {};
              familyHistory[nkLk][quarter] = fam;
            }
          });
          qMatrix[rowKey][colKey] = names;
        });
      });
      quarterMatrices[quarter] = qMatrix;
    });
  }

  const quarters = Object.keys(quarterMatrices).sort((a, b) => {
    const parseQ = (s: string) => {
      const m = s.match(/Q(\d)\s+FY\s+(\d+)/);
      return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 0;
    };
    return parseQ(a) - parseQ(b);
  });
  const latestQuarter = quarters[quarters.length - 1] || "";

  return {
    matrix: quarterMatrices[latestQuarter] || {},
    quarterMatrices,
    familyDetails,
    familyHistory,
    quarters,
  };
};

export const transformSkuDeviationData = (response: any) => {
  const quarterMap: Record<string, SkuQuarterData> = {};
  const sortedQuarters: string[] = [];

  if (response && response.quarters) {
    const parseQ = (s: string) => {
      const m = s.match(/Q(\d)\s+FY\s+(\d+)/);
      return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 0;
    };

    (response.quarters as SkuQuarterData[])
      .slice()
      .sort((a, b) => parseQ(a.quarter) - parseQ(b.quarter))
      .forEach((qEntry) => {
        quarterMap[qEntry.quarter] = {
          quarter: qEntry.quarter,
          standard_rows: qEntry.standard_rows || [],
          nonstd_rows: qEntry.nonstd_rows || [],
          summary: qEntry.summary || undefined,
        };
        sortedQuarters.push(qEntry.quarter);
      });
  }

  const latestQuarter = sortedQuarters[sortedQuarters.length - 1] || "";
  return { quarterMap, sortedQuarters, latestQuarter };
};

const generateMockInsights = (qEntry: any) => {
  const insights: string[] = [];

  const getSegmentInfo = (segmentName: string) => {
    const medium = qEntry[segmentName]?.Medium;
    const low = qEntry[segmentName]?.Low;
    const high = qEntry[segmentName]?.High;
    
    const below = (low?.below_baseline || 0) + (medium?.below_baseline || 0) + (high?.below_baseline || 0);
    const above = (low?.above_baseline || 0) + (medium?.above_baseline || 0) + (high?.above_baseline || 0);
    const share = (low?.revenue_share_pct || 0) + (medium?.revenue_share_pct || 0) + (high?.revenue_share_pct || 0);
    
    return { below, above, share, medium };
  };

  const va = getSegmentInfo("Value_added");
  const comm = getSegmentInfo("Commodity");

  if (qEntry.global_delta_pp !== undefined && qEntry.global_delta_pp !== null) {
    const direction = qEntry.global_delta_pp >= 0 ? "accretive" : "dilutive";
    const actionWord = qEntry.global_delta_pp >= 0 ? "gained" : "dropped";
    insights.push(
      `Overall Margin Performance: For ${qEntry.quarter}, the overall pooled actual GM% is ${qEntry.pooled_actual_gm_pct?.toFixed(2)}%, which is ${direction} by ${actionWord} ${Math.abs(qEntry.global_delta_pp).toFixed(2)}pp compared to the baseline.`
    );
  }

  if (comm.share > 0 && comm.medium?.gm_delta_pp !== null && comm.medium?.gm_delta_pp !== undefined) {
    const directionText = comm.medium?.gm_delta_pp >= 0 ? "above" : "below";
    insights.push(
      `Commodity Segment Pressure: Commodity products represent the largest share of revenue (${comm.share.toFixed(1)}%), with margins running ${Math.abs(comm.medium?.gm_delta_pp).toFixed(2)}pp ${directionText} baseline due to volume transaction variations.`
    );
  }

  if (va.above > va.below) {
    insights.push(
      `Value-Added Expansion: Value-added products show solid performance with ${va.above} product families exceeding baseline margins, contributing to overall margin stability.`
    );
  } else if (va.share > 0) {
    insights.push(
      `Value-Added Segment Status: Value-added segment contributes ${va.share.toFixed(1)}% of revenue, with ${va.below} families currently performing below baseline targets.`
    );
  }

  return { insight_texts: insights };
};

export const transformClassificationMatrixData = (response: any) => {
  const quarterMatrices: Record<string, any> = {};
  const quarters: string[] = [];

  if (response && response.matrix && Array.isArray(response.matrix.quarters)) {
    response.matrix.quarters.forEach((qEntry: any) => {
      const quarter = qEntry.quarter;
      quarters.push(quarter);

      const normalizedMatrix: Record<string, any> = {};
      const rowMappings: Record<string, string> = {
        "Proprietary": "Proprietary",
        "Value_added": "Value-added",
        "Value-added": "Value-added",
        "Commodity": "Commodity"
      };

      Object.entries(qEntry).forEach(([key, rowVal]: [string, any]) => {
        const normalizedRowName = rowMappings[key];
        if (normalizedRowName) {
          normalizedMatrix[normalizedRowName] = rowVal;
        }
      });

      quarterMatrices[quarter] = {
        matrix: normalizedMatrix,
        pooled_actual_gm_pct: qEntry.pooled_actual_gm_pct,
        pooled_baseline_gm_pct: qEntry.pooled_baseline_gm_pct,
        global_delta_pp: qEntry.global_delta_pp,
        total_revenue_inr: qEntry.total_revenue_inr,
        total_below_baseline: qEntry.total_below_baseline,
        total_above_baseline: qEntry.total_above_baseline,
        insights: qEntry.insights || (qEntry.insight_texts ? { insight_texts: qEntry.insight_texts } : null) || generateMockInsights(qEntry)
      };
    });
  }

  const parseQ = (s: string) => {
    const m = s.match(/Q(\d)\s+FY\s+(\d+)/);
    return m ? parseInt(m[2]) * 10 + parseInt(m[1]) : 0;
  };
  quarters.sort((a, b) => parseQ(a) - parseQ(b));

  const latestQuarter = quarters[quarters.length - 1] || "";
  const prevQuarter = quarters.length > 1 ? quarters[quarters.length - 2] : "";

  const baseInsights = response.insights || response.matrix?.insights || {};

  return {
    quarterMatrices,
    quarters,
    latestQuarter,
    insights: {
      ...baseInsights,
      curr_qtr: latestQuarter,
      prev_qtr: prevQuarter
    }
  };
};

export const fmt = (n: number | null | undefined, decimals = 1) =>
  n != null ? n.toFixed(decimals) : "—";

export const fmtLakhs = (n: number | null | undefined) =>
  n != null ? `₹${(n / 100000).toFixed(2)}L` : "—";

export const fmtPP = (n: number | null | undefined) =>
  n != null ? `${n >= 0 ? "+" : ""}${n.toFixed(1)}` : "—";

