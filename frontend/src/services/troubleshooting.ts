import store, { Dispatch } from "../redux/store";
import { TroubleshootAPI } from "./Axios";
import axios from "axios";

const BACKEND_TROUBLESHOOTING_URL = import.meta.env.VITE_BACKEND_SMART_TROUBLESHOOT_URL;

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

export const CreateChat = async (
  title: string,
  asset_number?: string,
  sf_asset_id?: string,
  ticket_id?: string,
) => {
  let url = `/troubleshooting/chat?title=${encodeURIComponent(title)}`;
  if (asset_number) {
    url += `&asset_number=${encodeURIComponent(asset_number)}`;
  }
  if (sf_asset_id) {
    url += `&sf_asset_id=${encodeURIComponent(sf_asset_id)}`;
  }
  // Required by the backend — every session must be traceable to a ticket.
  if (ticket_id) {
    url += `&ticket_id=${encodeURIComponent(ticket_id)}`;
  }
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + url);
  return response
}

// Close out a session. `solution_source` is normally omitted: the backend derives
// it from the turns, since the agent already recorded where each answer came from.
export const UpdateChatResolution = async (
  chat_id: number | string,
  resolved: boolean,
  note?: string,
  solution_source?: string,
) => {
  const body: Record<string, any> = { resolved };
  if (note) body.note = note;
  if (solution_source) body.solution_source = solution_source;
  const response = await TroubleshootAPI.patch(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat/${chat_id}/resolution`,
    body,
  );
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

export type TroubleshootingChatMode = "TROUBLESHOOTING" | "KB";

export const CreateChatHistory = async (
  query: string,
  chat_id: string,
  mode: TroubleshootingChatMode = "TROUBLESHOOTING",
) => {
  const body = {
    human: query,
    mode,
  };
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat_history?chat_id=${chat_id}`, body);
  return response
}

export const DeleteChatHistory = async (chat_history_id: number, chat_id: number) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat_history/${chat_history_id}?chat_id=${chat_id}`);
  return response
}

// Per-message feedback (like/dislike + optional suggested answer). The backend
// blocks updates once an owner has reviewed the paired feedback record, so a
// `Cannot update, as it has already been reviewed` detail in the response
// means the UI should leave the rating as-is.
export const updateChatHistory = async (
  chat_history_id: number,
  chat_id: number,
  like?: boolean,
  dislike_reason?: string,
  updated_answer?: string,
) => {
  const body: Record<string, any> = {};
  if (like !== undefined) body.like = like;
  if (dislike_reason !== undefined) body.dislike_reason = dislike_reason;
  if (updated_answer !== undefined) body.updated_answer = updated_answer;
  const response = await TroubleshootAPI.patch(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/chat_history/${chat_history_id}?chat_id=${chat_id}`,
    body,
  );
  return response;
};


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

export const getFileBlobUrl = async (product_id: string | number) => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(
    BACKEND_TROUBLESHOOTING_URL +
      `/troubleshooting/document/${product_id}/link`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};

export const PollDocumentStatus = async (product_id: string | number) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/document/${product_id}/status`);
  return response;
};

//<====================================Troubleshooting Node Tree========================================>
export const ReadProductTree = async (product_id: number | string) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/node/tree?product_id=${product_id}`);
  return response;
};

export const CreateNode = async (body: {
  product_id: number;
  parent_id?: number | null;
  node_type: "PROBLEM" | "WHY" | "SOLUTION";
  content: string;
  description?: string | null;
  position?: number;
}) => {
  const response = await TroubleshootAPI.post(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/node`, body);
  return response;
};

export const UpdateNode = async (
  node_id: number,
  body: { content?: string; description?: string | null; position?: number },
) => {
  const response = await TroubleshootAPI.patch(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/node/${node_id}`, body);
  return response;
};

export const DeleteNode = async (node_id: number) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/node/${node_id}`);
  return response;
};

export const ReadNodeImages = async (node_id: number) => {
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/node/${node_id}/images`);
  return response;
};

export const UploadNodeImage = async (node_id: number, file: File, caption?: string) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('image', file, file.name);
  if (caption) formData.append('caption', caption);
  try {
    const response = await axios.post(
      `${BACKEND_TROUBLESHOOTING_URL}/troubleshooting/node/${node_id}/image`,
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
      (store.dispatch as Dispatch).toast.openToast({ status: true, message: "Unsupported image type. Use .png, .jpg, .jpeg, .webp or .gif" })
    throw error;
  }
};

export const DeleteNodeImage = async (image_id: number) => {
  const response = await TroubleshootAPI.delete(BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/node/image/${image_id}`);
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

export const ReadActiveUsersTrend = async (
  year: string | number,
  month: string | number
) => {
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL +
      `/troubleshooting/usage/activity/trend?year=${year}&month=${month}`
  );
  return response;
};

//<====================================Feedback (Admin)============================================>

// `status` mirrors the backend literal (NOT_REVIEWED / IN_REVIEW / APPROVED /
// REJECTED). The list endpoint accepts it under the `status_filter` query
// param — the legacy `status` name is reserved for the FastAPI helper.
export const ReadChatFeedbacks = async (
  skip: number,
  limit: number,
  status?: string,
  search_term?: string,
) => {
  const params = new URLSearchParams();
  params.set("skip", String(skip));
  params.set("limit", String(limit));
  if (search_term && search_term !== "") params.set("search_term", search_term);
  if (status) params.set("status_filter", status);
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/feedback?${params.toString()}`,
  );
  return response;
};

export const ReadFeedbackWithId = async (feedback_id: string | number) => {
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/feedback/${feedback_id}`,
  );
  return response;
};

export const UpdateChatFeedback = async (chat_feedback_id: number, body?: any) => {
  const response = await TroubleshootAPI.patch(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/feedback/${chat_feedback_id}`,
    body,
  );
  return response;
};

export const DownloadFeedbackData = async (fromDate: string, toDate: string) => {
  const body = { from_date: fromDate, to_date: toDate };
  const response = await TroubleshootAPI.post(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/feedback/download`,
    body,
    { responseType: "blob" },
  );
  return response;
};

//<====================================Support interaction report (owner)===============================>

export const ReadSessionReport = async (
  from_date?: string,
  to_date?: string,
  skip: number = 0,
  limit: number = 50,
  resolution_status?: string,
  search_term?: string,
) => {
  const params = new URLSearchParams();
  if (from_date) params.set("from_date", from_date);
  if (to_date) params.set("to_date", to_date);
  params.set("skip", String(skip));
  params.set("limit", String(limit));
  if (resolution_status) params.set("resolution_status", resolution_status);
  if (search_term) params.set("search_term", search_term);
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/analytics/sessions?${params.toString()}`,
  );
  return response;
};

export const DownloadSessionReport = async (fromDate: string, toDate: string) => {
  const body = { from_date: fromDate, to_date: toDate };
  const response = await TroubleshootAPI.post(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/analytics/sessions/download`,
    body,
    { responseType: "blob" },
  );
  return response;
};

//<====================================Knowledge Base Documents========================================>

export const ReadKbDocuments = async (
  skip: number = 0,
  limit: number = 100,
  search_term: string = ""
) => {
  const qs = `skip=${skip}&limit=${limit}${search_term !== "" ? "&search_term=" + search_term : ""}`;
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/kb_document?${qs}`
  );
  return response;
};

export const CreateKbDocument = async (files: File[], product_id: number | string) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  files.forEach((file) => formData.append("documents", file, file.name));
  try {
    const response = await axios.post(
      `${BACKEND_TROUBLESHOOTING_URL}/troubleshooting/kb_document?product_id=${product_id}`,
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
    if (error?.response?.status === 415)
      (store.dispatch as Dispatch).toast.openToast({
        status: true,
        message: "Unsupported extension. Only .pdf and .docx are allowed for Knowledge Base.",
      });
    throw error;
  }
};

export const DeleteKbDocument = async (kb_document_id: number | string) => {
  const response = await TroubleshootAPI.delete(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/kb_document/${kb_document_id}`
  );
  return response;
};

export const ReadKbDocumentLink = async (kb_document_id: number | string) => {
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/kb_document/${kb_document_id}/link`
  );
  return response;
};

export const SearchAssets = async (search_term: string, skip = 0, limit = 20) => {
  let url = `/troubleshooting/asset/search?skip=${skip}&limit=${limit}`;
  if (search_term) {
    url += `&search_term=${encodeURIComponent(search_term)}`;
  }
  const response = await TroubleshootAPI.get(BACKEND_TROUBLESHOOTING_URL + url);
  return response;
};

export const PollKbDocumentStatus = async (kb_document_id: number | string) => {
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/kb_document/${kb_document_id}/status`
  );
  return response;
};

//<====================================Chat Analytics (Admin)========================================>

export const ReadTroubleshootingAnalytics = async (
  from_date?: string,
  to_date?: string,
  asset_limit: number = 10
) => {
  const params = new URLSearchParams();
  if (from_date) params.set("from_date", from_date);
  if (to_date) params.set("to_date", to_date);
  params.set("asset_limit", String(asset_limit));
  const response = await TroubleshootAPI.get(
    BACKEND_TROUBLESHOOTING_URL + `/troubleshooting/analytics?${params.toString()}`
  );
  return response;
};