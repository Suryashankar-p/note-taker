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
      
      const baselineRefMap = new Map<string, number>();
      baselineBars.forEach((b: any) => {
        if (b.family_nk) {
          baselineRefMap.set(b.family_nk.toLowerCase(), b.ref_gm_pct ?? 0);
        }
      });

      const mergedBars = targetBars.map((tBar: any) => {
        const nk = tBar.family_nk?.toLowerCase();
        return {
          ...tBar,
          ref_gm_pct: nk ? baselineRefMap.get(nk) ?? tBar.ref_gm_pct : tBar.ref_gm_pct,
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
          above_baseline: q.vs_baseline?.above_baseline ?? 0,
          below_baseline: q.vs_baseline?.below_baseline ?? 0,
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
        };
        sortedQuarters.push(qEntry.quarter);
      });
  }

  const latestQuarter = sortedQuarters[sortedQuarters.length - 1] || "";
  return { quarterMap, sortedQuarters, latestQuarter };
};
