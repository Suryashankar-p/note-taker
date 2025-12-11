export const ACTIVE_SERVICES = {
    "sales": window.env?.SALES || import.meta.env.VITE_SALES,
    "tbwes_ocr": window.env?.TBWES_OCR || import.meta.env.VITE_TBWES_OCR,
    "thermax_gpt": window.env?.THERMAX_GPT || import.meta.env.VITE_THERMAX_GPT,
    "doctor_conbot": window.env?.DOCTOR_CONBOT || import.meta.env.VITE_ENABLE_SSO,
    "troubleshooting": window.env?.SMART_TROUBLESHOOT || import.meta.env.VITE_ENABLE_SSO,
    "cyberbuddy": window.env?.CYBERBUDDY || import.meta.env.VITE_CYBERBUDDY,
    "heating_ocr": window.env?.HEATING_OCR || import.meta.env.VITE_HEATING_OCR,
}