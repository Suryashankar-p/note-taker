import axios, { AxiosInstance } from 'axios';

const sso_BaseURL = import.meta.env.VITE_BACKEND_SSO_URL;
const gpt_BaseURL = import.meta.env.VITE_BACKEND_THERMAX_GPT_URL;
const sales_BaseURL = import.meta.env.VITE_BACKEND_SALES_URL;
const tbwes_BaseURL = import.meta.env.VITE_BACKEND_TBWES_OCR_URL;
const troubleshoot_BaseURL = import.meta.env.VITE_BACKEND_SMART_TROUBLESHOOT_URL;
const doctorBot_BaseURL = import.meta.env.VITE_BACKEND_DOCTOR_CONBOT_URL;

export const axiosSSO: AxiosInstance = axios.create({
  baseURL: sso_BaseURL,
  timeout: 300000,
});

export const axiosGPT: AxiosInstance = axios.create({
  baseURL: gpt_BaseURL,
  timeout: 300000,
});

export const axiosSales: AxiosInstance = axios.create({
  baseURL: sales_BaseURL,
  timeout: 300000,
});

export const axiosTBWES: AxiosInstance = axios.create({
  baseURL: tbwes_BaseURL,
  timeout: 300000,
});

export const axiosTroubleshoot: AxiosInstance = axios.create({
  baseURL: troubleshoot_BaseURL,
  timeout: 300000,
});

export const axiosDoctorBot: AxiosInstance = axios.create({
  baseURL: doctorBot_BaseURL,
  timeout: 300000,
});
