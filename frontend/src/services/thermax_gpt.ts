import axios from "axios";
import { GPTAPI } from "./Axios.ts";

const BACKEND_THERMAX_GPT_URL=import.meta.env.VITE_BACKEND_THERMAX_GPT_URL || window.env?.BACKEND_THERMAX_GPT_URL;

interface ChatCreatePayload {
  title: string;
  type?: string;
}


type DocumentAnalyserBody = {
  question: string;
  source_files?: string[];
};

export const GetMemberGPTRole = async () => {
  const response = await GPTAPI.get(BACKEND_THERMAX_GPT_URL + "/thermax_gpt/member/me/");
  return response;
};

export const GetAllChatLists = async (
  skip: number = 0,
  limit: number = 100,
  search_term: string = ""
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL +
      `/thermax_gpt/chat?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const DeleteAllChatList = async () => {
  const response = await GPTAPI.delete(BACKEND_THERMAX_GPT_URL + "/thermax_gpt/chat");
  return response;
};

export const CreateChat = async (payload: ChatCreatePayload) => {
  const response = await GPTAPI.post(BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat/`, payload);
  return response;
};

export const UpdateChat = async (chat_id: number, title?: string) => {
  const response = await GPTAPI.patch(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat/${chat_id}?title=${title}`
  );
  return response;
};

export const DeleteChat = async (chat_id: number) => {
  const response = await GPTAPI.delete(BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat/${chat_id}`);
  return response;
};

export const ReadChatHistories = async (
  skip: number = 0,
  limit: number = 100,
  chat_id?: string
) => {
  if (chat_id) {
    const response = await GPTAPI.get(
      BACKEND_THERMAX_GPT_URL +
        `/thermax_gpt/chat/${chat_id}/chat_history?skip=${skip}&limit=${limit}`
    );
    return response;
  }
};

export const CreateChatHistory = async (
  query: string,
  chat_id: string,
  file?: File
) => {
  const formData = new FormData();
  const token = localStorage.getItem("access_token");

  formData.append("human", query);

  if (file) {
    formData.append("file", file);
  }

  const response = await axios.post(
    `${BACKEND_THERMAX_GPT_URL}/thermax_gpt/chat/${chat_id}/chat_history`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};


export const DeleteChatHistory = async (
  chat_history_id: number,
  chat_id: number
) => {
  const response = await GPTAPI.delete(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat/${chat_id}/chat_history/${chat_history_id}`
  );
  return response;
};

//<<<<<<Usage APIs>>>>>>

export const ReadCostUsage = async (
  year: string | number,
  month: string | number,
  type: "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All" = "All"
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL +
      `/thermax_gpt/usage/cost?year=${year}&month=${month}&type=${type}`
  );
  return response;
};


export const ReadUsageLimit = async () => {
  const response = await GPTAPI.get(BACKEND_THERMAX_GPT_URL + "/thermax_gpt/usage/cost/limit");
  return response;
};

export const UpdateUsageLimit = async (limit: number) => {
  const response = await GPTAPI.patch(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/usage/cost/limit?limit=${limit}`
  );
  return response;
};

export const ReadActivityUsage = async (
  year: string | number,
  month: string | number,
  type: "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All" = "All"
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL +
      `/thermax_gpt/usage/activity?year=${year}&month=${month}&type=${type}`
  );
  return response;
};

export const ReadActivityUsageTopUsers = async (
  year: string | number,
  month: string | number,
  skip: number = 0,
  limit: number = 6,
  type: "Thermax-GPT" | "Deep Search" | "Document Analyser" | "All" = "All"
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL +
      `/thermax_gpt/usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}&type=${type}`
  );
  return response;
};


////<Members>

export const ReadMembers = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL +
      `/thermax_gpt/member?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateMember = async (body: any) => {
  const response = await GPTAPI.post(BACKEND_THERMAX_GPT_URL + `/thermax_gpt/member/`, body);
  return response;
};


export const UpdateMember = async (body: any, member_id: string) => {
  const response = await GPTAPI.patch(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/member/${member_id}`, body
  );
  return response;
};

export const DeleteMember = async (member_id: string) => {
  const response = await GPTAPI.delete(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/member/${member_id}`
  );
  return response;
};


export const uploadDocumentAnalyserFile = async (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await GPTAPI.post(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/document_analyzer/upload/`,
    formData
  );

  return response;
};

export const DocumentAnalyserFileStatusCheck = async (
  file_id: string
): Promise<any> => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/document_analyzer/status/${file_id}`
  );
  return response;
};

export const getThermaxServices = async () => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/services/active?skip=0&limit=100`
  );
  return response;
};


export const CreateChatHistoryStream = async (
  query: string,
  chat_id: string,
  file?: File
) => {
  const formData = new FormData();

  formData.append("human", query);

  if (file) {
    formData.append("file", file);
  }

  const response = await GPTAPI.post(
    `${BACKEND_THERMAX_GPT_URL}/thermax_gpt/chat/${chat_id}/chat_history/`,
    formData,
  );

  return response;
};


export const CreateDocumentAnalyserChatHistory = async (
  body: DocumentAnalyserBody,
  chat_id: string
) => {
  const response = await GPTAPI.post(
    `${BACKEND_THERMAX_GPT_URL}/thermax_gpt/document_analyzer/chat_history/?chat_id=${chat_id}`,
    body
  );

  return response;
};

export const CreateChatHistoryPerplexity = async (
  query: string,
  chat_id: string
) => {
  const formData = new FormData();

  formData.append("human", query);

  const response = await GPTAPI.post(
    `${BACKEND_THERMAX_GPT_URL}/thermax_gpt/chat/${chat_id}/chat_history/perplexity`,
    formData,
  );

  return response;
};

export const CreatePerplexityStream = async (
  query: string,
  chat_id: string
) => {
  const formData = new FormData();

  formData.append("human", query);

  const response = await GPTAPI.post(
    `${BACKEND_THERMAX_GPT_URL}/thermax_gpt/chat/${chat_id}/chat_history/perplexity/`,
    formData,
  );

  return response;
};

export const ReadVideo = async (
  chat_id: number,
  link: string
) => {
  const response = await axios.post(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat/${chat_id}/chat_history/video/stream`,
    {
      link: link,
    },
    {
      responseType: "blob",
    }
  );

  return response;
};
