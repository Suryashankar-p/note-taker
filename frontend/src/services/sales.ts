import store, { Dispatch } from "../redux/store";
import { fileTypeSelctor } from "../utils/functions";
import { SalesAPI } from "./Axios";
import axios from "axios";

const BACKEND_SALES_URL = import.meta.env.VITE_BACKEND_SALES_URL || window.env?.BACKEND_SALES_URL;


//<====================================Sales Auth========================================>

export const GetMemberSalesRole = async () => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + '/sales/member/me')
  return response
}

//<====================================Sales chat========================================>

export const GetAllChatLists = async (skip: number = 0, limit: number = 100, search_term: string = '') => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/chat?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`);
  return response
}

export const DeleteAllChatList = async () => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + '/sales/chat');
  return response
}

export const CreateChat = async (title: string) => {
  const response = await SalesAPI.post(BACKEND_SALES_URL + `/sales/chat?title=${title}`);
  return response
}

export const UpdateChat = async (chat_id: number, title?: string) => {
  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/chat/${chat_id}?title=${title}`);
  return response
}

export const DeleteChat = async (chat_id: number) => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + `/sales/chat/${chat_id}`);
  return response
}

export const ReadChatHistories = async (skip: number = 0, limit: number = 100, chat_id?: string) => {
  if (chat_id) {
    const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/chat/${chat_id}/chat_history?skip=${skip}&limit=${limit}`);
    return response
  }
}

export const CreateChatHistory = async (query: string, chat_id: string) => {
  const body = {
    human: query
  }
  const response = await SalesAPI.post(BACKEND_SALES_URL + `/sales/chat/${chat_id}/chat_history`, body);
  return response
}

export const DeleteChatHistory = async (chat_history_id: number, chat_id: number) => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + `/sales/chat/${chat_id}/chat_history/${chat_history_id}`);
  return response
}

export const updateChatHistory = async (chat_history_id: number, chat_id: number, like?: boolean, dislike_reason?: string, updated_answer?: string) => {
  const queryParams = new URLSearchParams();

  if (like !== undefined) {
    queryParams.append('like', String(like));
  }
  if (dislike_reason !== undefined) {
    queryParams.append('dislike_reason', dislike_reason);
  }
  if (updated_answer !== undefined) {
    queryParams.append('updated_answer', updated_answer);
  }

  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/chat/${chat_id}/chat_history/${chat_history_id}?${queryParams.toString()}`);
  return response;
}

export const ReadRelatedQuestions = async (question: string, top: number = 3) => {
  const response = SalesAPI.get(BACKEND_SALES_URL + `/sales/similar_question?question=${question}&top=${top}`)
  return response
}
//<=====================================Sales Setting==========================================>//

//<Members>

export const ReadMembers = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/member?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateMember = async (role: string, email: string, name: string) => {
  const response = await SalesAPI.post(BACKEND_SALES_URL + `/sales/member?role=${role}&email=${email}&name=${name}`)
  return response
}

export const UpdateMember = async (role: string, name: string, member_id: string) => {
  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/member/${member_id}?name=${name}&role=${role}`)
  return response
}

export const DeleteMember = async (member_id: string) => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + `/sales/member/${member_id}`)
  return response
}

//<<Products/Knowledge>>

export const ReadProducts = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/product?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateProduct = async (title: string, short_title: string, description: string, body?: any) => {
  const response = await SalesAPI.post(BACKEND_SALES_URL + `/sales/product?title=${title}&short_title=${short_title}&description=${description}`, body)
  return response
}

export const UpdateProduct = async (product_id: string, title: string, short_title: string, description: string, body: any) => {
  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/product/${product_id}?title=${title}&short_title=${short_title}&description=${description}`, body)
  return response
}

export const DeleteProduct = async (product_id: string) => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + `/sales/product/${product_id}`)
  return response
}

export const ReadProductDocuments = async (product_id: number | string, skip: number = 0, limit: number = 0, search_term?: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/product/${product_id}/document?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateProductDocument = async (
  productId: number | string,
  description: string,
  kind: string,
  file: File,
  models: any,
  product_document_id?: string | number
) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  if (file) {
    formData.append('document', file, file.name);
  }
  formData.append('models', JSON.stringify(models));
  try {
    const response = await axios.post(
      `${BACKEND_SALES_URL}/sales/product/${productId}/document${product_document_id ? '/' + product_document_id : ''}?description=${description}&kind=${fileTypeSelctor(kind)}`,
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
      (store.dispatch as Dispatch).toast.openToast({ status: true, message: "Unsupported extension(s) only use .pdf, .xls, .xlsx" })
    throw error;
  }
};

export const DeleteProductDocument = async (product_id: string | number, product_document_id: string | number) => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + `/sales/product/${product_id}/document/${product_document_id}`)
  return response
}

export const ReadProductDocumentUrl = async (product_id: string | number, product_document_id: string | number) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/product/${product_id}/document/${product_document_id}/link`)
  return response
}


//<<<<<<Usage APIs>>>>>>

export const ReadCostUsage = async (year: string | number, month: string | number) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/usage/cost?year=${year}&month=${month}`)
  return response
}

export const ReadUsageLimit = async () => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + '/sales/usage/cost/limit')
  return response
}

export const UpdateUsageLimit = async (limit: number) => {
  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/usage/cost/limit?limit=${limit}`)
  return response
}

export const ReadActivityUsage = async (year: string | number, month: string | number) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/usage/activity?year=${year}&month=${month}`)
  return response
}

export const ReadActivityUsageTopUsers = async (year: string | number, month: string | number, n: number) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/usage/activity/top?year=${year}&month=${month}&n=${n}`)
  return response
}

//<<<<<<Q&A APIs>>>>>>

export const ReadQaA = async (skip: number, limit: number, status: string, search_term?: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/qa?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}&status=${status}`)
  return response
}


export const CreateQaA = async (question: string, answer: string, status: string, body: any) => {
  const response = await SalesAPI.post(BACKEND_SALES_URL + `/sales/qa?question=${question}&answer=${answer}&status=${status}`, body)
  return response
}

export const DeleteQaA = async (id: number) => {
  const response = await SalesAPI.delete(BACKEND_SALES_URL + `/sales/qa/${id}`)
  return response
}

export const UpdateQaA = async (id: number, question: string, answer: string, status: string, body: any) => {
  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/qa/${id}?question=${question}&answer=${answer}&status=${status}`, body)
  return response
}

export const ReadQAWithid = async (qa_id: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/qa/${qa_id}`)
  return response
}

//<<<<<<<<Feedback APIs>>>>>>>>>>>//

export const ReadChatFeedbacks = async (skip: number, limit: number, status: string, search_term?: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/feedback?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}&status=${status}`)
  return response
}

export const UpdateChatFeedback = async (chat_feedback_id: number, updated_question?: string, updated_answer?: string, status?: string, body?: any) => {
  const response = await SalesAPI.patch(BACKEND_SALES_URL + `/sales/feedback/${chat_feedback_id}?updated_question=${updated_question}&updated_answer=${updated_answer}&status=${status}`, body)
  return response
}

export const ReadFeedbackWithid = async (feedback_id: string) => {
  const response = await SalesAPI.get(BACKEND_SALES_URL + `/sales/feedback/${feedback_id}`)
  return response
}