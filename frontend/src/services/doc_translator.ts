import store, { Dispatch } from "../redux/store";
import { fileTypeSelctor } from "../utils/functions";
import { DocumentTranslatorAPI } from "./Axios";
import { axiosDocumentTranslator } from "./axiosInstances";
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
  file: File,
  sourceLanguage: string
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();

  if (file) {
    formData.append("document", file, file.name);
  }
  formData.append("source_language", sourceLanguage);

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

// Streams the input/output document through our own backend (which has the
// blob-storage network access) instead of fetching the blob URL directly
// from the browser, which the storage firewall rejects.
export const GetTranslatorFile = async (
  task_id: string,
  which: "input" | "output"
) => {
  const response = await axiosDocumentTranslator.get(
    BACKEND_DOC_TRANSLATOR_URL + `/doc_translator/translate/file/${task_id}/${which}`,
    { responseType: "blob" }
  );
  return response.data;
};


//<====================================Document Translator Members========================================>

export const ReadMembers = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL +
      `/doc_translator/member?skip=${skip}&limit=${limit}${
        search_term ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateMember = async (
  role: string,
  email: string,
  name: string
) => {
  const response = await DocumentTranslatorAPI.post(
    BACKEND_DOC_TRANSLATOR_URL +
      `/doc_translator/member?role=${role}&email=${email}&name=${name}`
  );
  return response;
};

export const UpdateMember = async (
  role: string,
  name: string,
  member_id: string
) => {
  const response = await DocumentTranslatorAPI.patch(
    BACKEND_DOC_TRANSLATOR_URL +
      `/doc_translator/member/${member_id}?name=${name}&role=${role}`
  );
  return response;
};

export const DeleteMember = async (member_id: string) => {
  const response = await DocumentTranslatorAPI.delete(
    BACKEND_DOC_TRANSLATOR_URL +
      `/doc_translator/member/${member_id}`
  );
  return response;
};


//<====================================Document Translator Analytics========================================>

// Usage Analytics APIs
export const ReadCostUsage = async (year: string | number, month: string | number) => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL + `/doc_translator/usage/cost?year=${year}&month=${month}`
  );
  return response;
};

export const ReadActivityUsage = async (year: string | number, month: string | number) => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL + `/doc_translator/usage/activity?year=${year}&month=${month}`
  );
  return response;
};

export const ReadActivityUsageTopUsers = async (
  year: string | number,
  month: string | number
) => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL + `/doc_translator/usage/activity/top?year=${year}&month=${month}`
  );
  return response;
};

export const ReadActiveUsersTrend = async (
  year: string | number,
  month: string | number
) => {
  const response = await DocumentTranslatorAPI.get(
    BACKEND_DOC_TRANSLATOR_URL +
      `/doc_translator/usage/activity/trend?year=${year}&month=${month}`
  );
  return response;
};
