import store, { Dispatch } from "../redux/store";
import { CyberbuddyAPI } from "./Axios";
import axios from "axios";

const BACKEND_CYBERBUDDY_URL = import.meta.env.VITE_BACKEND_CYBERBUDDY_URL || window.env?.BACKEND_CYBERBUDDY_URL;

//<====================================CyberBuddy Auth========================================>

export const GetMemberCyberBuddyRole = async () => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + "/cyberbuddy/member/me");
  return response;
};

//<====================================CyberBuddy chat========================================>

export const GetAllChatLists = async (skip: number = 0, limit: number = 100, search_term: string = "") => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat?skip=${skip}&limit=${limit}${search_term !== "" ? "&search_term=" + search_term : ""}`);
  return response;
};

export const DeleteAllChatList = async () => {
  const response = await CyberbuddyAPI.delete(BACKEND_CYBERBUDDY_URL + '/cyberbuddy/chat');
  return response
}

export const CreateChat = async (title: string) => {
  let body = {
    title: title,
  };
  const response = await CyberbuddyAPI.post(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat`,body);
  return response;
};

export const UpdateChat = async (chat_id: number, title?: string) => {
  const response = await CyberbuddyAPI.patch(
    BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat/${chat_id}?title=${title}`
  );
  return response;
};

export const DeleteChat = async (chat_id: number) => {
  const response = await CyberbuddyAPI.delete(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat/${chat_id}`);
  return response;
};

// Update chat history (like/dislike/answer)
export const updateChatHistory = async (
  chat_history_id: number,
  chat_id: number,
  like?: boolean,
  dislike_reason?: string,
  updated_answer?: string
) => {
  const queryParams = new URLSearchParams();
  if (like !== undefined) {
    queryParams.append('like', like ? 'True' : 'False');
  }
  if (dislike_reason !== undefined) {
    queryParams.append('dislike_reason', dislike_reason);
  }
  if (updated_answer !== undefined) {
    queryParams.append('updated_answer', updated_answer);
  }
  const response = await CyberbuddyAPI.patch(
    BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat/${chat_id}/chat_history/${chat_history_id}?${queryParams.toString()}`
  );
  return response;
};

//<====================================CyberBuddy chat history========================================>

export const ReadChatHistories = async (skip: number = 0, limit: number = 100, chat_id?: string) => {
  if (chat_id) {
    const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat/${chat_id}/chat_history?skip=${skip}&limit=${limit}`);
    return response;
  }
};

export const CreateChatHistory = async (query: string, chat_id: string) => {
  let body={
    human: query
  }
  const response = await CyberbuddyAPI.post(
    BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat/${chat_id}/chat_history`, body
  );
  return response;
};

export const DeleteChatHistory = async (
  chat_history_id: number,
  chat_id: number
) => {
  const response = await CyberbuddyAPI.delete(
    BACKEND_CYBERBUDDY_URL + `/cyberbuddy/chat/${chat_id}/chat_history/${chat_history_id}`
  );
  return response;
};

//<=====================================CyberBuddy Settings==========================================>//

//<<<<<<Document>>>>>>

export const CreateDocument = async (
  kind: string,
  file: File
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("document", file, file.name);
  formData.append("kind", kind);
  formData.append("description", "None");

  const response = await axios.post(
    `${BACKEND_CYBERBUDDY_URL}/cyberbuddy/document`,
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

export const ReadDocuments = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  let url = `${BACKEND_CYBERBUDDY_URL}/cyberbuddy/document?skip=${skip}&limit=${limit}`;
  if (search_term && search_term.trim() !== '') {
    url += `&search_term=${search_term}`;
  }
  const response = await CyberbuddyAPI.get(url);
  return response;
};

export const ReadDocument = async (document_id: number | string) => {
  const response = await CyberbuddyAPI.get(`${BACKEND_CYBERBUDDY_URL}/cyberbuddy/document/${document_id}`);
  return response;
};

export const EditDocument = async (
  document_id: string | number,
  description: string,
  kind: string,
  file?: File
) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  if (file) {
    formData.append('document', file, file.name);
  }
  formData.append('description', description);
  formData.append('kind', kind);
  const response = await axios.patch(
    `${BACKEND_CYBERBUDDY_URL}/cyberbuddy/document/${document_id}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const DeleteDocument = async (document_id: string | number) => {
  const token = localStorage.getItem('access_token');
  const response = await axios.delete(`${BACKEND_CYBERBUDDY_URL}/cyberbuddy/document/${document_id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response;
};

export const PollDocumentStatus = async (document_id: string | number) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/document/${document_id}/status`);
  return response;
};

export const ReadDocumentUrl = async (document_id: string | number) => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(
    BACKEND_CYBERBUDDY_URL + `/cyberbuddy/document/${document_id}/link`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return response
}

//<Feedback>

export const ReadChatFeedbacks = async (skip: number, limit: number, status: string, search_term?: string) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/feedback?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}&status=${status}`)
  return response
}

export const UpdateChatFeedback = async (chat_feedback_id: number, body?: any) => {
  const response = await CyberbuddyAPI.patch(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/feedback/${chat_feedback_id}`, body)
  return response
}

export const ReadFeedbackWithid = async (feedback_id: string) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/feedback/${feedback_id}`)
  return response
}

export const DownloadFeedbackData = async (fromDate: string, toDate: string) => {
  let body={
    from_date: fromDate,
    to_date: toDate,
  }
  const response = await CyberbuddyAPI.post(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/feedback/download`, body , {responseType: "blob"});
  return response;
};

//<Members>

export const ReadMembers = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/member?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateMember = async (role: string, email: string, name: string) => {
  const response = await CyberbuddyAPI.post(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/member?role=${role}&email=${email}&name=${name}`)
  return response
}

export const UpdateMember = async (role: string, name: string, member_id: string) => {
  const response = await CyberbuddyAPI.patch(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/member/${member_id}?name=${name}&role=${role}`)
  return response
}

export const DeleteMember = async (member_id: string) => {
  const response = await CyberbuddyAPI.delete(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/member/${member_id}`)
  return response
}

//<<<<<<Usage APIs>>>>>>

export const ReadCostUsage = async (year: string | number, month: string | number) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/usage/cost?year=${year}&month=${month}`)
  return response
}

export const ReadUsageLimit = async () => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + '/cyberbuddy/usage/cost/limit')
  return response
}

export const UpdateUsageLimit = async (limit: number) => {
  const response = await CyberbuddyAPI.patch(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/usage/cost/limit?limit=${limit}`)
  return response
}

export const ReadActivityUsage = async (year: string | number, month: string | number) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/usage/activity?year=${year}&month=${month}`)
  return response
}

export const ReadActivityUsageTopUsers = async (year: string | number, month: string | number, skip: number = 0, limit: number = 6) => {
  const response = await CyberbuddyAPI.get(BACKEND_CYBERBUDDY_URL + `/cyberbuddy/usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`)
  return response
}