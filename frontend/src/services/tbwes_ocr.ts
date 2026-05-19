import store, { Dispatch } from "../redux/store";
import { TBWESAPI } from "./Axios";
import axios from "axios";

const BACKEND_TBWES_OCR_URL = import.meta.env.VITE_BACKEND_TBWES_OCR_URL;

/////////////////<<<<<<<<<<<<<<<<<<<OCR APIs>>>>>>>>>>>>>>>>>>>>>\\\\\\\\\\\\\\\\\\

export const GetMemberOCRRole = async () => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + '/tbwes_ocr/member/me')
  return response
}

export const GetOCRActivities = async (skip: number = 0, limit: number = 100, search_term?: string, user_status?: string, status?: string) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}${status ? '&status=' + status : ''}${user_status ? '&user_status=' + user_status : ''}`)
  return response
}

export const GetOCRActivitiesDetails = async (activity_id: number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/${activity_id}`)
  return response
}

export const UpdateOCRActivitiesDetails = async (activity_id: number, body?: any) => {
  const response = await TBWESAPI.post(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/${activity_id}/update`, body);
  return response
}

export const DeleteOCRActivities = async (activity_id: number) => {
  const response = await TBWESAPI.delete(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/${activity_id}`)
  return response
}

export const ReadOCRMembers = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/member?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const CreateOCRMember = async (role: string, email: string, name: string) => {
  const response = await TBWESAPI.post(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/member?role=${role}&email=${email}&name=${name}`)
  return response
}

export const UpdateOCRMember = async (role: string, name: string, member_id: string) => {
  const response = await TBWESAPI.patch(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/member/${member_id}?name=${name}&role=${role}`)
  return response
}

export const DeleteOCRMember = async (member_id: string) => {
  const response = await TBWESAPI.delete(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/member/${member_id}`)
  return response
}

export const ReadOCRActivityUsage = async (year: string | number, month: string | number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/activity?year=${year}&month=${month}`)
  return response
}

export const ReadOCRYearActivityUsage = async (year: string | number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/year-usage?year=${year}`)
  return response
}

export const ReadOCRTopUsers = async (year: string | number, month: string | number, n: number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/activity/top?year=${year}&month=${month}&n=${n}`)
  return response
}

export const ReadOCRCostUsage = async (year: string | number, month: string | number) => {
  const response = await TBWESAPI.post(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/cost?year=${year}&month=${month}`)
  return response
}

export const ReadOCRYearCostUsage = async (year: string | number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/year-cost?year=${year}`)
  return response
}

export const ReadOCRUsageLimit = async () => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + '/tbwes_ocr/usage/cost/limit')
  return response
}

export const UpdateOCRUsageLimit = async (limit: number) => {
  const response = await TBWESAPI.patch(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/cost/limit?limit=${limit}`)
  return response
}

export const UpdateBAAN = async (body: any) => {
  const response = await TBWESAPI.put(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/baan`, body)
  return response
}

export const CreateOCRActivity = async (
  title: string,
  file: File,
  product_document_id?: string | number
) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  if (file) {
    formData.append('document', file, file.name);
  }
  formData.append('title', title)
  try {
    const response = await axios.post(
      `${BACKEND_TBWES_OCR_URL}/tbwes_ocr/activity`,
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

export const GetDocumentUrl = async (activity_id: number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/${activity_id}/link`)
  return response
}

export const SentMultipartMessage = async (activity_id: number, status: string) => {
  const response = await TBWESAPI.post(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/${activity_id}?status=${status}`)
  return response
}

export const ReadOCRActivityStatus = async (year: string | number, month: string | number) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/usage/activity/stats?year=${year}&month=${month}`)
  return response
}

export const GetBaanData = async (skip: number, limit: number, search_term: string) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/baan?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`);
  return response
}

export const TranferActivity = async (activity_id: string, user_id: string) => {
  const response = await TBWESAPI.post(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/${activity_id}/transfer?user_id=${user_id}`)
  return response
}

export const GetAckData = async (activity_id: string) => {
  const response = await TBWESAPI.get(BACKEND_TBWES_OCR_URL + `/tbwes_ocr/activity/ack_response/${activity_id}`);
  return response
}