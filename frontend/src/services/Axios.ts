import {
  axiosSSO,
  axiosGPT,
  axiosSales,
  axiosTBWES,
  axiosTroubleshoot,
  axiosDoctorBot,
  axiosCyberbuddy,
  axiosHeatingOCR,
  axiosTransmitterOCR,
  axiosDocumentTranslator,
  axiosCCTVService,
  axiosEdge,
  axiosPricingAnalytics,
} from "./axiosInstances";

import { setInterceptors } from "./axiosConfig";

// Apply interceptors to all axios instances
[
  axiosSSO,
  axiosGPT,
  axiosSales,
  axiosTBWES,
  axiosTroubleshoot,
  axiosDoctorBot,
  axiosCyberbuddy,
  axiosHeatingOCR,
  axiosTransmitterOCR,
  axiosDocumentTranslator,
  axiosCCTVService,
  axiosEdge,
  axiosPricingAnalytics
].forEach(setInterceptors);

// Reusable wrapper for standard HTTP methods
const createAPI = (instance: any) => ({
  get: (path: string) => instance.get(path).then((res) => res.data),
  post: (path: string, body?: any, responseType?: any) =>
    instance.post(path, body, responseType).then((res) => res.data),
  patch: (path: string, body?: any) =>
    instance.patch(path, body).then((res) => res.data),
  put: (path: string, body?: any) =>
    instance.put(path, body).then((res) => res.data),
  delete: (path: string) => instance.delete(path).then((res) => res.data),
  upload: (path: string, body: any, contentType: string) =>
    instance
      .put(path, body, {
        headers: { "Content-Type": contentType },
      })
      .then((res) => res.data),
});

// Exporting all services with their HTTP methods
export const SSOAPI = createAPI(axiosSSO);
export const GPTAPI = createAPI(axiosGPT);
export const SalesAPI = createAPI(axiosSales);
export const TBWESAPI = createAPI(axiosTBWES);
export const TroubleshootAPI = createAPI(axiosTroubleshoot);
export const DoctorBotAPI = createAPI(axiosDoctorBot);
export const CyberbuddyAPI = createAPI(axiosCyberbuddy);
export const HeatingOCRAPI = createAPI(axiosHeatingOCR);
export const TransmitterOCRAPI = createAPI(axiosTransmitterOCR);
export const DocumentTranslatorAPI = createAPI(axiosDocumentTranslator);
export const EdgeAPI = createAPI(axiosEdge);
export const CCTVServiceAPI = createAPI(axiosCCTVService);
export async function redirectToLogin(): Promise<void> {
  window.location.href = `/`;
  localStorage.clear();
}
export const PricingAnalyticsAPI = createAPI(axiosPricingAnalytics);
