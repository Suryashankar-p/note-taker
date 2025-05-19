export {};

declare global {
  interface Window {
    env: {
      ROOT_PATH: string;
      ENABLE_SSO: string;
      ADMIN_USER_EMAIL: string;
      DOMAIN: string;
      URL_PREFIX: string;
      BACKEND_SSO_URL: string;
      BACKEND_THERMAX_GPT_URL: string;
      BACKEND_DOCTOR_CONBOT_URL: string;
      BACKEND_SMART_TROUBLESHOOT_URL: string;
      BACKEND_SALES_URL: string;
      BACKEND_TBWES_OCR_URL: string;
    };
  }
}
