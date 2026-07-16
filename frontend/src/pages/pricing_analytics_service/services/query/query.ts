import { useMutation, useQuery, useInfiniteQuery, keepPreviousData, useQueryClient } from "@tanstack/react-query";
import { PricingAnalyticsAPI } from "../../../../services/Axios";
import { transformSkyscraperData, transformQoqMatrixData, transformSkuDeviationData, transformClassificationMatrixData } from "./utils";

export * from "./types";
export { fmt, fmtLakhs, fmtPP } from "./utils";

export const GetMemberPricingAnalyticsRole = async () => {
  const response = await PricingAnalyticsAPI.get(
    "/member/me"
  );
  return response;
};

export const useGetMemberPricingAnalyticsRole = () => {
  return useQuery({
    queryKey: ["member-role-pricing-analytics"],
    queryFn: async () => {
      const response = await GetMemberPricingAnalyticsRole();
      return response;
    },
  });
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-member"],
    mutationFn: async (data: { name: string; email: string; role: string }) => {
      const response = await CreateMember(data.role, data.email, data.name);
      if (response?.detail) {
        throw new Error(response.detail);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-member"],
    mutationFn: async (data: { member_id: string; name: string; role: string }) => {
      const response = await UpdateMember(data.role, data.name, data.member_id);
      if (response?.detail) {
        throw new Error(response.detail);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
    },
  });
};

export const useDeleteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-member"],
    mutationFn: async (member_id: string) => {
      const response = await DeleteMember(member_id);
      if (response?.detail) {
        throw new Error(response.detail);
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members-list"] });
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

export const useGetSessions = () => {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.get("/sessions/");
      return response;
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-session"],
    mutationFn: async (sessionId: number) => {
      const response = await PricingAnalyticsAPI.delete(`/sessions/${sessionId}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-session"],
    mutationFn: async (data: { sessionId: number; session_name: string }) => {
      const response = await PricingAnalyticsAPI.patch(`/sessions/${data.sessionId}`, {
        session_name: data.session_name,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
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

export const useGetBusinessInsights = (sessionId: number, quarter?: string) => {
  return useQuery({
    queryKey: ["business-insights", sessionId, quarter],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/business-insights",
        { session_id: sessionId, quarter: quarter }
      );
      return response;
    },
    enabled: !!sessionId && !!quarter,
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
      return transformClassificationMatrixData(response);
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
      return transformSkyscraperData(response);
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
      return transformQoqMatrixData(response);
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
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    }) => {
      const response = await PricingAnalyticsAPI.post(
        "/llm/chat",
        payload
      );
      return response;
    }
  });
};

export const useGetDispersion = (sessionId: number, familyNk: string | null) => {
  return useQuery({
    queryKey: ["dispersion", sessionId, familyNk],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/dispersion",
        {
          session_id: sessionId,
          family_nk: familyNk === "null" || !familyNk ? null : familyNk
        }
      );
      return response;
    },
    enabled: !!sessionId,
    placeholderData: keepPreviousData,
  });
};

export const useGetQoqDistribution = (
  sessionId: number,
  quarter: string | null,
  familyNk: string | null
) => {
  return useQuery({
    queryKey: ["qoq-distribution", sessionId, quarter, familyNk],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/qoq-distribution",
        {
          session_id: sessionId,
          quarter: quarter,
          family_nk: familyNk === "null" || !familyNk ? null : familyNk
        }
      );
      return response;
    },
    enabled: !!sessionId,
    placeholderData: keepPreviousData,
  });
};

export const useGetSkuDeviation = (sessionId: number, familyNk?: string | null) => {
  return useQuery({
    queryKey: ["sku-deviation", sessionId, familyNk],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/sku-deviation",
        {
          session_id: sessionId,
          family_nk: familyNk === "null" || !familyNk ? null : familyNk
        }
      );
      return transformSkuDeviationData(response);
    },
    enabled: !!sessionId,
  });
};