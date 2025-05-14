import {
  axiosSSO,
  axiosGPT,
  axiosSales,
  axiosTBWES,
  axiosTroubleshoot,
  axiosDoctorBot,
} from './axiosInstances';

import { setInterceptors } from './axiosConfig';

// Apply interceptors to all axios instances
[
  axiosSSO,
  axiosGPT,
  axiosSales,
  axiosTBWES,
  axiosTroubleshoot,
  axiosDoctorBot,
].forEach(setInterceptors);

// Reusable wrapper for standard HTTP methods
const createAPI = (instance: any) => ({
  get: (path: string) => instance.get(path).then(res => res.data),
  post: (path: string, body?: any) => instance.post(path, body).then(res => res.data),
  patch: (path: string, body?: any) => instance.patch(path, body).then(res => res.data),
  put: (path: string, body?: any) => instance.put(path, body).then(res => res.data),
  delete: (path: string) => instance.delete(path).then(res => res.data),
  upload: (path: string, body: any, contentType: string) =>
    instance.put(path, body, {
      headers: { 'Content-Type': contentType },
    }).then(res => res.data),
});

// Exporting all services with their HTTP methods
export const SSOAPI = createAPI(axiosSSO);
export const GPTAPI = createAPI(axiosGPT);
export const SalesAPI = createAPI(axiosSales);
export const TBWESAPI = createAPI(axiosTBWES);
export const TroubleshootAPI = createAPI(axiosTroubleshoot);
export const DoctorBotAPI = createAPI(axiosDoctorBot);

export async function redirectToLogin(): Promise<void> {
  window.location.href = '/api2/';
  localStorage.clear();
}