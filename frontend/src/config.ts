const toBool = (value: any): boolean =>
  String(value).toLowerCase() === "true";

export const ACTIVE_SERVICES = {
  "sales": toBool(window.env?.SALES || import.meta.env.VITE_SALES),
  "tbwes_ocr": toBool(window.env?.TBWES_OCR || import.meta.env.VITE_TBWES_OCR),
  "thermax_gpt": toBool(window.env?.THERMAX_GPT || import.meta.env.VITE_THERMAX_GPT),
  "doctor_conbot": toBool(window.env?.DOCTOR_CONBOT || import.meta.env.VITE_DOCTOR_CONBOT),
  "troubleshooting": toBool(window.env?.SMART_TROUBLESHOOT || import.meta.env.VITE_SMART_TROUBLESHOOT),
  "cyberbuddy": toBool(window.env?.CYBERBUDDY || import.meta.env.VITE_CYBERBUDDY),
  "heating_ocr": toBool(window.env?.HEATING_OCR || import.meta.env.VITE_HEATING_OCR),
};
