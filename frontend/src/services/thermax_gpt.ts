import axios from "axios";
import { GPTAPI } from "./Axios.ts";

const BACKEND_THERMAX_GPT_URL=import.meta.env.VITE_BACKEND_THERMAX_GPT_URL || window.env?.BACKEND_THERMAX_GPT_URL;

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

export const CreateChat = async (title: string) => {
  const response = await GPTAPI.post(BACKEND_THERMAX_GPT_URL + `/thermax_gpt/chat?title=${title}`);
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

export const CreateChatHistoryPerplexity = async (
  query: string,
  chat_id: string,
) => {
  const formData = new FormData();
  const token = localStorage.getItem("access_token");

  formData.append("human", query);

  const response = await axios.post(
    `${BACKEND_THERMAX_GPT_URL}/thermax_gpt/chat/${chat_id}/chat_history/perplexity`,
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
  month: string | number
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/usage/cost?year=${year}&month=${month}`
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
  month: string | number
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/usage/activity?year=${year}&month=${month}`
  );
  return response;
};

export const ReadActivityUsageTopUsers = async (
  year: string | number,
  month: string | number,
  n: number
) => {
  const response = await GPTAPI.get(
    BACKEND_THERMAX_GPT_URL +
      `/thermax_gpt/usage/activity/top?year=${year}&month=${month}&n=${n}`
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

export const CreateMember = async (
  role: string,
  email: string,
  name: string
) => {
  const response = await GPTAPI.post(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/member?role=${role}&email=${email}&name=${name}`
  );
  return response;
};

export const UpdateMember = async (
  role: string,
  name: string,
  member_id: string
) => {
  const response = await GPTAPI.patch(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/member/${member_id}?name=${name}&role=${role}`
  );
  return response;
};

export const DeleteMember = async (member_id: string) => {
  const response = await GPTAPI.delete(
    BACKEND_THERMAX_GPT_URL + `/thermax_gpt/member/${member_id}`
  );
  return response;
};
