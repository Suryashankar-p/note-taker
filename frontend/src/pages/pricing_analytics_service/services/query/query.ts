import { useMutation, useQuery } from "@tanstack/react-query";
import { PricingAnalyticsAPI } from "../../../../services/Axios";

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