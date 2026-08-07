import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
  useQueryClient,
} from "@tanstack/react-query";
import { PricingAnalyticsAPI } from "../../../../services/Axios";
import {
  transformSkyscraperData,
  transformQoqMatrixData,
  transformSkuDeviationData,
  transformClassificationMatrixData,
} from "./utils";

export * from "./types";
export { fmt, fmtLakhs, fmtPP } from "./utils";

export const GetMemberPricingAnalyticsRole = async () => {
  const response = await PricingAnalyticsAPI.get("/member/me");
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
  search_term?: string,
) => {
  const response = await PricingAnalyticsAPI.get(
    `/member?skip=${skip}&limit=${limit}${
      search_term !== "" ? "&search_term=" + search_term : ""
    }`,
  );
  return response;
};

export const CreateMember = async (
  role: string,
  email: string,
  name: string,
) => {
  const response = await PricingAnalyticsAPI.post(
    `/member?role=${role}&email=${email}&name=${name}`,
  );
  return response;
};

export const UpdateMember = async (
  role: string,
  name: string,
  member_id: string,
) => {
  const response = await PricingAnalyticsAPI.patch(
    `/member/${member_id}?name=${name}&role=${role}`,
  );
  return response;
};

export const DeleteMember = async (member_id: string) => {
  const response = await PricingAnalyticsAPI.delete(`/member/${member_id}`);
  return response;
};

export const useGetMembersList = (payload: {
  limit: number;
  search_term: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["members-list", payload],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await ReadMembers(
        pageParam,
        payload.limit,
        payload.search_term,
      );
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (
        lastPage &&
        lastPage.result &&
        lastPage.result.length < payload.limit
      ) {
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
    mutationFn: async (data: {
      member_id: string;
      name: string;
      role: string;
    }) => {
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
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/cogs?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadTargets = () => {
  return useMutation({
    mutationKey: ["upload-targets"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/targets?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadBaseline = () => {
  return useMutation({
    mutationKey: ["upload-baseline"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/baseline?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadNonstdTargets = () => {
  return useMutation({
    mutationKey: ["upload-nonstd-targets"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/nonstd-targets?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadPriceList = () => {
  return useMutation({
    mutationKey: ["upload-price-list"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/price-list?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadCostList = () => {
  return useMutation({
    mutationKey: ["upload-cost-list"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/cost-list?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadChannelPriceList = () => {
  return useMutation({
    mutationKey: ["upload-channel-price-list"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/channel-price-list?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useUploadDirectPriceList = () => {
  return useMutation({
    mutationKey: ["upload-direct-price-list"],
    mutationFn: async (payload: { file: File; business_unit: string }) => {
      const formData = new FormData();
      formData.append("file", payload.file);
      const response = await PricingAnalyticsAPI.post(
        `/upload/direct-price-list?business_unit=${payload.business_unit}`,
        formData,
      );
      return response;
    },
  });
};

export const useCompile = () => {
  return useMutation({
    mutationKey: ["compile"],
    mutationFn: async (payload: { business_unit: string; file_ids: number[] }) => {
      const response = await PricingAnalyticsAPI.post("/upload/compile", payload);
      return response;
    },
  });
};

export const usePublish = () => {
  return useMutation({
    mutationKey: ["publish"],
    mutationFn: async (payload: { business_unit: string }) => {
      const response = await PricingAnalyticsAPI.post("/upload/publish", payload);
      return response;
    },
  });
};

export const useGetOverallMargin = (businessUnit: string) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["overall-margin", businessUnit, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/overall-margin",
        { business_unit: businessUnit, published_only: publishedOnly },
      );
      return response;
    },
    enabled: !!businessUnit,
  });
};

export const useGetBusinessInsights = (businessUnit: string, quarter?: string) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["business-insights", businessUnit, quarter, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/business-insights",
        { business_unit: businessUnit, quarter: quarter || null, published_only: publishedOnly },
      );
      return response;
    },
    enabled: !!businessUnit && !!quarter,
  });
};

export const useGetClassificationMatrix = (
  businessUnit: string,
  quarter?: string,
) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["classification-matrix", businessUnit, quarter, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/classification-matrix",
        { business_unit: businessUnit, quarter: quarter || null, published_only: publishedOnly },
      );
      return response;
    },
    enabled: !!businessUnit,
  });
};

export const useGetSkyscraper = (businessUnit: string) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["skyscraper", businessUnit, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post("/analytics/skyscraper", {
        business_unit: businessUnit,
        published_only: publishedOnly,
      });
      return transformSkyscraperData(response);
    },
    enabled: !!businessUnit,
  });
};

export const useGetQoqMatrix = (
  businessUnit: string,
  quarter?: string,
  familyNk?: string | null,
) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["qoq-matrix", businessUnit, quarter, familyNk, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post("/analytics/qoq-matrix", {
        business_unit: businessUnit,
        quarter: quarter || null,
        family_nk: familyNk === "null" || !familyNk ? null : familyNk,
        published_only: publishedOnly,
      });
      return transformQoqMatrixData(response);
    },
    enabled: !!businessUnit,
  });
};

export const useGetSnapshotKpis = (businessUnit: string, quarter?: string) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["snapshot-kpis", businessUnit, quarter, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/snapshot-kpis",
        { business_unit: businessUnit, quarter: quarter || null, published_only: publishedOnly },
      );
      return response;
    },
    enabled: !!businessUnit && !!quarter,
  });
};

export const useSendLLMChat = () => {
  return useMutation({
    mutationKey: ["send-llm-chat"],
    mutationFn: async (payload: {
      query: string;
      mode: string;
      business_unit: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    }) => {
      const response = await PricingAnalyticsAPI.post("/llm/chat", payload);
      return response;
    },
  });
};

export const useGetDispersion = (
  businessUnit: string,
  quarter: string | null,
  familyNk?: string | null,
) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["dispersion", businessUnit, quarter, familyNk, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post("/analytics/dispersion", {
        business_unit: businessUnit,
        quarter: quarter,
        family_nk: familyNk === "null" || !familyNk ? null : familyNk,
        published_only: publishedOnly,
      });
      return response;
    },
    enabled: !!businessUnit && !!quarter,
    placeholderData: keepPreviousData,
  });
};

export const useGetQoqDistribution = (
  businessUnit: string,
  quarter: string | null,
  familyNk: string | null,
) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["qoq-distribution", businessUnit, quarter, familyNk, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/qoq-distribution",
        {
          business_unit: businessUnit,
          quarter: quarter,
          family_nk: familyNk === "null" || !familyNk ? null : familyNk,
          published_only: publishedOnly,
        },
      );
      return response;
    },
    enabled: !!businessUnit && !!quarter && !!familyNk,
    placeholderData: keepPreviousData,
  });
};

export const useGetSkuDeviation = (
  businessUnit: string,
  quarter?: string | null,
  familyNk?: string | null,
) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["sku-deviation", businessUnit, quarter, familyNk, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/sku-deviation",
        {
          business_unit: businessUnit,
          quarter: quarter || null,
          family_nk: familyNk === "null" || !familyNk ? null : familyNk,
          published_only: publishedOnly,
        },
      );
      return transformSkuDeviationData(response);
    },
    enabled: !!businessUnit,
    placeholderData: keepPreviousData,
  });
};

export const useGetGmDecompose = (businessUnit: string, quarter?: string) => {
  const publishedOnly = window.location.pathname.includes("/ceo");
  return useQuery({
    queryKey: ["gm-decompose", businessUnit, quarter, publishedOnly],
    queryFn: async () => {
      const response = await PricingAnalyticsAPI.post(
        "/analytics/gm-decompose",
        {
          business_unit: businessUnit,
          published_only: publishedOnly,
          ...(quarter ? { quarter } : {}),
        },
      );
      return response;
    },
    enabled: !!businessUnit && !!quarter,
  });
};
