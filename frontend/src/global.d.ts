export {};

declare global {
  interface Window {
    env: {
      ENABLE_SSO: string;
      ADMIN_USER_EMAIL: string;
      DOMAIN: string;
      URL_PREFIX: string;
      THERMAX_GPT: string;
      SALES: string;
      TBWES_OCR: string;
      SMART_TROUBLESHOOT: string;
      DOCTOR_CONBOT: string;
      CYBERBUDDY: string;
      HEATING_OCR: string;
      BACKEND_SSO_URL: string;
      BACKEND_THERMAX_GPT_URL: string;
      BACKEND_DOCTOR_CONBOT_URL: string;
      BACKEND_SMART_TROUBLESHOOT_URL: string;
      BACKEND_SALES_URL: string;
      BACKEND_TBWES_OCR_URL: string;
      BACKEND_CYBERBUDDY_URL: string;
      BACKEND_HEATING_OCR_URL: string;
    };
  }
}
