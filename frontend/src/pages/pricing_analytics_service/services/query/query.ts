import { useMutation, useQuery } from "@tanstack/react-query";
import { PricingAnalyticsAPI } from "../../../../services/Axios";

export const GetMemberPricingAnalyticsRole = async () => {
  const response = await PricingAnalyticsAPI.get(
    "/member/me"
  );
  return response;
};

export const useUploadCogs = () => {
  return useMutation({
    mutationKey: ["upload-cogs"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PricingAnalyticsAPI.post(
        "/upload/cogs",
        formData
      );
      return response;
    }
  });
};

export const useUploadTargets = () => {
  return useMutation({
    mutationKey: ["upload-targets"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PricingAnalyticsAPI.post(
        "/upload/targets",
        formData
      );
      return response;
    }
  });
};

export const useUploadBaseline = () => {
  return useMutation({
    mutationKey: ["upload-baseline"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PricingAnalyticsAPI.post(
        "/upload/baseline",
        formData
      );
      return response;
    }
  });
};

export const useUploadNonstdTargets = () => {
  return useMutation({
    mutationKey: ["upload-nonstd-targets"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PricingAnalyticsAPI.post(
        "/upload/nonstd-targets",
        formData
      );
      return response;
    }
  });
};

export const useUploadPriceList = () => {
  return useMutation({
    mutationKey: ["upload-price-list"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PricingAnalyticsAPI.post(
        "/upload/price-list",
        formData
      );
      return response;
    }
  });
};

export const useUploadCostList = () => {
  return useMutation({
    mutationKey: ["upload-cost-list"],
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await PricingAnalyticsAPI.post(
        "/upload/cost-list",
        formData
      );
      return response;
    }
  });
};

export const useCreateSession = () => {
  return useMutation({
    mutationKey: ["create-session"],
    mutationFn: async (payload: {
      session_name?: string;
      cogs_file_id: number;
      targets_file_id: number;
      baseline_file_id: number;
      nonstd_targets_file_id: number;
      price_list_file_id: number;
      cost_list_file_id: number;
    }) => {
      const response = await PricingAnalyticsAPI.post(
        "/sessions/",
        payload
      );
      return response;
    }
  });
};

export const useGetOverallMargin = (sessionId: number) => {
  return useQuery({
    queryKey: ["overall-margin", sessionId],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/overall-margin",
        { session_id: sessionId }
      );
      return response;
    },
    enabled: !!sessionId,
  });
};

export const useGetBusinessInsights = (sessionId: number) => {
  return useQuery({
    queryKey: ["business-insights", sessionId],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/business-insights",
        { session_id: sessionId }
      );
      return response;
    },
    enabled: !!sessionId,
  });
};

export const useGetClassificationMatrix = (sessionId: number) => {
  return useQuery({
    queryKey: ["classification-matrix", sessionId],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/classification-matrix",
        { session_id: sessionId }
      );
      return response;
    },
    enabled: !!sessionId,
  });
};

export const useGetSkyscraper = (sessionId: number) => {
  return useQuery({
    queryKey: ["skyscraper", sessionId],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/skyscraper",
        { session_id: sessionId }
      );
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
    },
    enabled: !!sessionId,
  });
};

export const useGetQoqMatrix = (sessionId: number) => {
  return useQuery({
    queryKey: ["qoq-matrix", sessionId],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/qoq-matrix",
        { session_id: sessionId }
      );

      // Build a flat family-details lookup keyed by lowercase name/nk
      // and rebuild the matrix cells as simple string[] (display names)
      // so existing QoqMatrixTab consumption continues to work.
      const familyDetails: Record<string, any> = {};
      const quarterMatrices: Record<string, any> = {};

      if (response && response.quarters) {
        response.quarters.forEach((qEntry: any) => {
          const qMatrix: Record<string, Record<string, string[]>> = {};
          Object.entries(qEntry.matrix || {}).forEach(([rowKey, cols]: [string, any]) => {
            qMatrix[rowKey] = {};
            Object.entries(cols).forEach(([colKey, families]: [string, any]) => {
              const names: string[] = [];
              (families as any[]).forEach((fam: any) => {
                const displayName = fam.name || fam.display_name || fam.nk;
                names.push(displayName);
                const lk = displayName.toLowerCase();
                if (!familyDetails[lk]) {
                  familyDetails[lk] = fam;
                }
                if (fam.nk) familyDetails[fam.nk.toLowerCase()] = fam;
              });
              qMatrix[rowKey][colKey] = names;
            });
          });
          quarterMatrices[qEntry.quarter] = qMatrix;
        });
      }

      // Return the latest quarter's matrix (same shape as before) plus
      // the full familyDetails map for all quarters.
      const quarters = Object.keys(quarterMatrices);
      const latestQuarter = quarters[quarters.length - 1] || "";
      return {
        matrix: quarterMatrices[latestQuarter] || {},
        quarterMatrices,
        familyDetails,
        quarters,
      };
    },
    enabled: !!sessionId,
  });
};

export const useGetSnapshotKpis = (sessionId: number) => {
  return useQuery({
    queryKey: ["snapshot-kpis", sessionId],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/snapshot-kpis",
        { session_id: sessionId }
      );
      return response;
    },
    enabled: !!sessionId,
  });
};

export const useSendLLMChat = () => {
  return useMutation({
    mutationKey: ["send-llm-chat"],
    mutationFn: async (payload: {
      query: string;
      mode: string;
      session_id: number;
    }) => {
      const response = await PricingAnalyticsAPI.post(
        "/llm/chat",
        payload
      );
      return response;
    }
  });
};