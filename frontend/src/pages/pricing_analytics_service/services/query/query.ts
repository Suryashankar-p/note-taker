import { useMutation, useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { PricingAnalyticsAPI } from "../../../../services/Axios";

export const GetMemberPricingAnalyticsRole = async () => {
  const response = await PricingAnalyticsAPI.get(
    "/member/me"
  );
  return response;
};

// MEMBER

export const ReadMembers = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await PricingAnalyticsAPI.get(
    `/member?skip=${skip}&limit=${limit}${
      search_term !== "" ? "&search_term=" + search_term : ""
    }`
  );
  return response;
};

export const CreateMember = async (
  role: string,
  email: string,
  name: string
) => {
  const response = await PricingAnalyticsAPI.post(
    `/member?role=${role}&email=${email}&name=${name}`
  );
  return response;
};

export const UpdateMember = async (
  role: string,
  name: string,
  member_id: string
) => {
  const response = await PricingAnalyticsAPI.patch(
    `/member/${member_id}?name=${name}&role=${role}`
  );
  return response;
};

export const DeleteMember = async (member_id: string) => {
  const response = await PricingAnalyticsAPI.delete(
    `/member/${member_id}`
  );
  return response;
};

export const useGetMembersList = (payload: { limit: number; search_term: string }) => {
  return useInfiniteQuery({
    queryKey: ["members-list", payload],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await ReadMembers(pageParam, payload.limit, payload.search_term);
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage && lastPage.result && lastPage.result.length < payload.limit) {
        return undefined;
      }
      return allPages.length * payload.limit;
    },
  });
};

export const useCreateMember = () => {
  return useMutation({
    mutationKey: ["create-member"],
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const response = await CreateMember(data.role, data.email, data.name);
      return response;
    },
  });
};

export const useUpdateMember = () => {
  return useMutation({
    mutationKey: ["update-member"],
    mutationFn: async (data: { member_id: string; name: string; role: string }) => {
      const response = await UpdateMember(data.role, data.name, data.member_id);
      return response;
    },
  });
};

export const useDeleteMember = () => {
  return useMutation({
    mutationKey: ["delete-member"],
    mutationFn: async (member_id: string) => {
      const response = await DeleteMember(member_id);
      return response;
    },
  });
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
      if (response && response.quarters) {
        response.quarters.forEach((q: any) => {
          transformed[q.quarter] = q.bars || [];
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