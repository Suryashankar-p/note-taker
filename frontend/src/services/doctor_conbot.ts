import store, { Dispatch } from "../redux/store";
import { fileTypeSelectorDoctorConBot } from "../utils/functions";
import { DoctorBotAPI } from "./Axios";
import axios from "axios";

const BACKEND_DOCTOR_CONBOT_URL =
  import.meta.env.VITE_BACKEND_DOCTOR_CONBOT_URL ||
  window.env?.BACKEND_DOCTOR_CONBOT_URL;

//<====================================Dr. Conbot Auth========================================>

export const GetMemberDoctorConbotRole = async () => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL + "/doctor_conbot/member/me"
  );
  return response;
};

//<====================================Dr. Conbot chat========================================>

export const GetAllChatLists = async (
  skip: number = 0,
  limit: number = 100,
  search_term: string = ""
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/chat?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const DeleteAllChatList = async () => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL + "/doctor_conbot/chat"
  );
  return response;
};

export const CreateChat = async (title: string) => {
  let body = {
    title: title,
  };
  console.log(body);
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/chat/`,
    body
  );
  return response;
};

export const UpdateChat = async (chat_id: number, title?: string) => {
  const response = await DoctorBotAPI.patch(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/chat/${chat_id}?title=${title}`
  );
  return response;
};

export const DeleteChat = async (chat_id: number) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/chat/${chat_id}`
  );
  return response;
};

//<====================================Dr. Conbot chat history========================================>

export const ReadChatHistories = async (
  skip: number = 0,
  limit: number = 100,
  chat_id?: string
) => {
  if (chat_id) {
    const response = await DoctorBotAPI.get(
      BACKEND_DOCTOR_CONBOT_URL +
        `/doctor_conbot/chat/${chat_id}/chat_history?skip=${skip}&limit=${limit}`
    );
    return response;
  }
};

export const CreateChatHistory = async (query: string, chat_id: string) => {
  let body = {
    human: query,
  };
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/chat/${chat_id}/chat_history`,
    body
  );
  return response;
};

export const CreateAgentChatHistory = async (
  query: string,
  chat_id: string
) => {
  let body = {
    human: query,
  };
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/chat/${chat_id}/agent/`,
    body
  );
  return response;
};

export const DeleteChatHistory = async (
  chat_history_id: number,
  chat_id: number
) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/chat/${chat_id}/chat_history/${chat_history_id}`
  );
  return response;
};

export const getChatHistoryFileUrl = async (sourceRequest: any) => {
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/chat/{chat_id}/chat_history/link`,
    sourceRequest
  );
  return response;
};

export const getChatHistoryFileBlobUrl = async (sourceRequest: any) => {
  const token = localStorage.getItem("access_token");

  const response = await axios.post(
    BACKEND_DOCTOR_CONBOT_URL +`/doctor_conbot/chat/{chat_id}/chat_history/link`,
    sourceRequest,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("api", response)
  return response
}

//<====================================Dr. Conbot member========================================>

export const ReadMembers = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/member?skip=${skip}&limit=${limit}${
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
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/member?role=${role}&email=${email}&name=${name}`
  );
  return response;
};

export const UpdateMember = async (
  role: string,
  name: string,
  member_id: string
) => {
  const response = await DoctorBotAPI.patch(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/member/${member_id}?name=${name}&role=${role}`
  );
  return response;
};

export const DeleteMember = async (member_id: string) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/member/${member_id}`
  );
  return response;
};

//<====================================Dr. Conbot usage========================================>

export const ReadCostUsage = async (
  year: string | number,
  month: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/usage/cost?year=${year}&month=${month}`
  );
  return response;
};

export const ReadUsageLimit = async () => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL + "/doctor_conbot/usage/cost/limit"
  );
  return response;
};

export const UpdateUsageLimit = async (limit: number) => {
  const response = await DoctorBotAPI.patch(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/usage/cost/limit?limit=${limit}`
  );
  return response;
};

export const ReadActivityUsage = async (
  year: string | number,
  month: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/usage/activity?year=${year}&month=${month}`
  );
  return response;
};

export const ReadActivityUsageTopUsers = async (
  year: string | number,
  month: string | number,
  skip: number = 0,
  limit: number = 6
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`
  );
  return response;
};

export const DownloadUsageActivity = async (fromDate: string, toDate: string) => {
  let body={
    from_date: fromDate,
    to_date: toDate,
  }
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/usage/download`, body, {responseType: "blob"}
  );
  return response;
};

//<====================================Dr. Conbot product========================================>

export const ReadProducts = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/product?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateProduct = async (
  title: string,
  short_title: string,
  description: string
) => {
  let body = {
    title: title,
    description: description,
    ...(short_title ? { short_title } : {}),
  };
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/product`,
    body
  );
  return response;
};

export const UpdateProduct = async (
  product_id: string,
  title: string,
  short_title: string,
  description: string
) => {
  let body = {
    title: title,
    description: description,
    ...(short_title ? { short_title } : {}),
  };
  const response = await DoctorBotAPI.patch(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/product/${product_id}?title=${title}&short_title=${short_title}&description=${description}`,
    body
  );
  return response;
};

export const DeleteProduct = async (product_id: string) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/product/${product_id}`
  );
  return response;
};

//<====================================Dr. Conbot product document========================================>

export const ReadProductDocuments = async (
  product_id: number | string,
  skip: number = 0,
  limit: number = 0,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/product/${product_id}/document?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateProductDocument = async (
  productId: number | string,
  description: string,
  kind: string,
  file: File,
  // models: any,
  product_document_id?: string | number
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  if (file) {
    formData.append("document", file, file.name);
  }

  try {
    const response = await axios.post(
      `${BACKEND_DOCTOR_CONBOT_URL}/doctor_conbot/product/${productId}/document${
        product_document_id ? "/" + product_document_id : ""
      }?description=${description}&kind=${fileTypeSelectorDoctorConBot(kind)}`,
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
        message:
          "Unsupported extension(s) only use .pdf, .xls, .xlsx ,.jpg, .jpeg ,.mp4",
      });
    throw error;
  }
};

export const EditProductDocument = async (
  productId: number | string,
  description: string,
  kind: string,

  product_document_id?: string | number
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("description", description);
  formData.append("kind", fileTypeSelectorDoctorConBot(kind));

  try {
    const response = await axios.patch(
      `${BACKEND_DOCTOR_CONBOT_URL}/doctor_conbot/product/${productId}/document${
        product_document_id ? "/" + product_document_id : ""
      }`,
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
        message:
          "Unsupported extension(s) only use .pdf, .xls, .xlsx ,.jpg, .jpeg ,.mp4",
      });
    throw error;
  }
};

export const DeleteProductDocument = async (
  product_id: string | number,
  product_document_id: string | number
) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/product/${product_id}/document/${product_document_id}`
  );
  return response;
};

export const ReadProductDocumentUrl = async (
  product_id: string | number,
  product_document_id: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/product/${product_id}/document/${product_document_id}/link`
  );
  return response;
};

export const ReadFaqDocumentUrl = async (
  product_document_id: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/faq/${product_document_id}/link`
  );
  return response;
};

export const PollDocumentStatus = async (
  product_document_id: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/product/{product_id}/document/${product_document_id}/status`
  );
  return response;
};

//<====================================Dr. Conbot category========================================>

export const ReadCategories = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateCategory = async (body: any) => {
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/category/`,
    body
  );
  return response;
};

export const DeleteCategory = async (product_id: string) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/category/${product_id}`
  );
  return response;
};

//<====================================Dr. Conbot category document========================================>

export const ReadCategoryDocuments = async (
  category_id: number | string,
  skip: number = 0,
  limit: number = 0,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/${category_id}/document?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateCategoryDocument = async (
  categoryId: number | string,
  description: string,
  kind: string,
  file: File
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();

  if (file) {
    formData.append("document", file, file.name);
  }

  // 👇 add these as form fields instead of query params
  formData.append("description", description);
  formData.append("kind", fileTypeSelectorDoctorConBot(kind));

  try {
    const response = await axios.post(
      `${BACKEND_DOCTOR_CONBOT_URL}/doctor_conbot/category/${categoryId}/document/`,
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
        message:
          "Unsupported extension(s). Only use .pdf, .xls, .xlsx, .jpg, .jpeg, .mp4",
      });
    }
    throw error;
  }
};

export const DeleteCategoryDocument = async (
  category_id: string | number,
  category_document_id: string | number
) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/${category_id}/document/${category_document_id}`
  );
  return response;
};

export const ReadCategoryDocumentUrl = async (
  category_id: string | number,
  category_document_id: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/${category_id}/document/${category_document_id}/link`
  );
  return response;
};

export const getCategoryFileBlobUrl = async (file: any) => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(
    BACKEND_DOCTOR_CONBOT_URL +`/doctor_conbot/category/${file.category_id}/document/${file.id}/link`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("api", response)
  return response
}

export const PollCategoryDocumentStatus = async (category_id: string | number, category_document_id: string | number) => {
  const response = await DoctorBotAPI.get(BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/category/${category_id}/document/${category_document_id}/status`);
  return response;
};

//<====================================Dr. Conbot FAQ========================================>

export const ReadFaqDocuments = async (
  skip: number = 0,
  limit: number = 0,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/faq?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateFaqDocument = async (
  description: string,
  file: File,
  category_document_id?: string | number
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  if (file) {
    formData.append("document", file, file.name);
  }
  formData.append("description", description);
  formData.append("kind", "FAQ");
  try {
    const response = await axios.post(
      `${BACKEND_DOCTOR_CONBOT_URL}/doctor_conbot/faq${
        category_document_id ? "/" + category_document_id : ""
      }?description=${description}&kind=FAQ`,

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
        message:
          "Unsupported extension(s) only use .pdf, .xls, .xlsx ,.jpg, .jpeg ,.mp4",
      });
    throw error;
  }
};

export const DeleteFaqDocument = async (
  category_document_id: string | number
) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/faq/${category_document_id}`
  );
  return response;
};

//<====================================Dr. Conbot sub package========================================>

export const ReadSubpackages = async (
  category_id: number | string,
  skip: number = 0,
  limit: number = 100,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/${category_id}/sub_package?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateSubpackage = async (
  body: any,
  category_id: number | string
) => {
  const response = await DoctorBotAPI.post(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/${category_id}/sub_package/`,
    body
  );
  return response;
};

export const DeleteSubPackage = async (
  category_id: number | string,
  sub_package_id: string | number
) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/${category_id}/sub_package/${sub_package_id}`
  );
  return response;
};

//<====================================Dr. Conbot sub package document========================================>

export const ReadSubPackageDocuments = async (
  sub_package_id: number | string,
  skip: number = 0,
  limit: number = 0,
  search_term?: string
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/sub_package/${sub_package_id}/document?skip=${skip}&limit=${limit}${
        search_term !== "" ? "&search_term=" + search_term : ""
      }`
  );
  return response;
};

export const CreateSubPackageDocument = async (
  sub_package_id: number | string,
  description: string,
  kind: string,
  file: File
) => {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();

  if (file) {
    formData.append("document", file, file.name);
  }

  formData.append("description", description);
  formData.append("kind", fileTypeSelectorDoctorConBot(kind));

  try {
    const response = await axios.post(
      `${BACKEND_DOCTOR_CONBOT_URL}/doctor_conbot/category/sub_package/${sub_package_id}/document/`,
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
        message:
          "Unsupported extension(s). Only use .pdf, .xls, .xlsx, .jpg, .jpeg, .mp4",
      });
    }
    throw error;
  }
};

export const DeleteSubPackageDocument = async (
  sub_package_document_id: string | number,
  sub_package_id: string | number
) => {
  const response = await DoctorBotAPI.delete(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/sub_package/${sub_package_id}/document/${sub_package_document_id}`
  );
  return response;
};

export const ReadSubpackageDocumentUrl = async (
  sub_package_id: string | number,
  sub_package_document_id: string | number
) => {
  const response = await DoctorBotAPI.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/sub_package/${sub_package_id}/document/${sub_package_document_id}/link`
  );
  return response;
};

export const getSubpackageFileBlobUrl = async (file: any) => {
  const token = localStorage.getItem("access_token");
  console.log("file:",file);

  const response = await axios.get(
    BACKEND_DOCTOR_CONBOT_URL +
      `/doctor_conbot/category/sub_package/${file.sub_package_id}/document/${file.id}/link`,
    {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  console.log("api", response);
  return response;
};

export const PollSubpackageDocumentStatus = async (sub_package_id: string | number, sub_package_document_id: string | number) => {
  const response = await DoctorBotAPI.get(BACKEND_DOCTOR_CONBOT_URL + `/doctor_conbot/category/sub_package/${sub_package_id}/document/${sub_package_document_id}/status`);
  return response;
};
