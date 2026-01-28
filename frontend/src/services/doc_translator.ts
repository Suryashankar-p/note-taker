import store, { Dispatch } from "../redux/store";
import { fileTypeSelctor } from "../utils/functions";
import { DocumentTranslatorAPI } from "./Axios";
import axios from "axios";

const BACKEND_DOC_TRANSLATOR_URL =  import.meta.env.VITE_BACKEND_DOCUMENT_TRANSLATOR_URL || window.env?.BACKEND_DOCUMENT_TRANSLATOR_URL;

////===============================================\\\\\\\\\\\\
// Translation APIs

export const GetTranslatorRole = async () => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL + "/doc_translator/member/me"
  );
  return response;
};

export const TranslateDocument = async (
  language: string,
  file: File
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();

  if (file) {
    formData.append("document", file, file.name);
  }

  try {
    const response = await axios.post(
      `${BACKEND_DOC_TRANSLATOR_URL}/doc_translator/translate?language=${language}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 415) {
      (store.dispatch as Dispatch).toast.openToast({
        status: true,
        message: "Unsupported extension(s) only use .pdf, .xls, .xlsx",
      });
    }
    throw error;
  }
};

export const GetTranslatorResponse = async (task_id: string) => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL + `/doc_translator/translate/status/${task_id}`
  );
  return response;
};
