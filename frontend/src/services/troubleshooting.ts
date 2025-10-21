import store, { Dispatch } from "../redux/store";
import { TroubleshootAPI } from "./Axios";
import axios from "axios";

const BACKEND_TROUBLESHOOTING_URL = import.meta.env.VITE_BACKEND_TROUBLESHOOTING_URL || window.env?.BACKEND_SMART_TROUBLESHOOT_URL;

//<====================================Troubleshooting Auth========================================>

export const GetMemberTroubleshootingRole = async () => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + "/troubleshooting/member/me");
  return response;
};

//<====================================Troubleshooting chat========================================>

export const GetAllChatLists = async (skip: number = 0, limit: number = 100, search_term: string = '') => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`);
  return response
}

export const CreateChat = async (title: string) => {
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat?title=${title}`);
  return response
}

export const DeleteAllChatList = async () => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + '/troubleshooting/chat');
  return response
}

export const UpdateChat = async (chat_id: number, title?: string) => {
  const response = await TroubleshootAPI.patch(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat/${chat_id}?title=${title}`);
  return response
}

export const DeleteChat = async (chat_id: number) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat/${chat_id}`);
  return response
}

//<==================================Troubleshooting chat history======================================>

export const ReadChatHistories = async (skip: number = 0, limit: number = 100, chat_id?: string) => {
  if (chat_id) {
    const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat_history?skip=${skip}&limit=${limit}&chat_id=${chat_id}`);
    return response
  }
}

export const CreateChatHistory = async (query: string, chat_id: string) => {
  const body={
    human:query
  }
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat_history?chat_id=${chat_id}`, body);
  return response
}

export const DeleteChatHistory = async (chat_history_id: number, chat_id: number) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat_history/${chat_history_id}?chat_id=${chat_id}`);
  return response
}

//<=====================================Troubleshooting Setting==========================================>//

//<Members>

export const ReadMembers = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/member?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateMember = async (role: string, email: string, name: string) => {
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/member?role=${role}&email=${email}&name=${name}`)
  return response
}

export const UpdateMember = async (role: string, name: string, member_id: string) => {
  const response = await TroubleshootAPI.patch(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/member/${member_id}?name=${name}&role=${role}`)
  return response
}

export const DeleteMember = async (member_id: string) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/member/${member_id}`)
  return response
}

//<Product>

export const ReadProducts = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/product?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateProduct = async (product_title: string) => {
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/product?product_title=${product_title}`)
  return response
}


export const DeleteProduct = async (product_id: string) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/product?product_id=${product_id}`)
  return response
}

//<Document>

export const ReadDocuments = async (product_id: number | string, skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/document?skip=${skip}&limit=${limit}&search_term=${search_term}&product_id=${product_id}`)
  return response
}

export const CreateDocument = async (
  productId: number | string,
  file: File,
) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  if (file) {
    formData.append('document', file, file.name);
  }
  try {
    const response = await axios.post(
      `${BACKEND_TROUBLESHOOTING_URL}/troubleshooting/document?product_id=${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 415)
      (store.dispatch as Dispatch).toast.openToast({ status: true, message: "Unsupported extension(s) only use .pdf, .xls, .xlsx ,.jpg, .jpeg ,.mp4" })
    throw error;
  }
};

export const DeleteDocument = async (product_id: string | number) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/document?product_id=${product_id}`)
  return response
}

export const ReadDocumentUrl = async (product_id: string | number) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/document/${product_id}/link`)
  return response
}

export const PollDocumentStatus = async (product_id: string | number) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/document/${product_id}/status`);
  return response;
};

//<Usage>

export const ReadCostUsage = async (year: string | number, month: string | number) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/usage/cost?year=${year}&month=${month}`)
  return response
}

export const ReadUsageLimit = async () => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + '/troubleshooting/usage/cost/limit')
  return response
}

export const UpdateUsageLimit = async (limit: number) => {
  const response = await TroubleshootAPI.patch(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/usage/cost/limit?limit=${limit}`)
  return response
}

export const ReadActivityUsage = async (year: string | number, month: string | number) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/usage/activity?year=${year}&month=${month}`)
  return response
}

export const ReadActivityUsageTopUsers = async (year: string | number, month: string | number, skip: number = 0, limit: number = 6) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`)
  return response
}

export const DownloadUsageActivity = async (fromDate: string, toDate: string) => {
  let body={
    from_date: fromDate,
    to_date: toDate,
  }
  const response = await TroubleshootAPI.post(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/usage/download`, body, {responseType: "blob"}
  );
  return response;
};