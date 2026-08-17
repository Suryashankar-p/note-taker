import store, { Dispatch } from "../redux/store";
import { TransmitterOCRAPI } from "./Axios";
import axios from "axios";

const BACKEND_TBWES_OCR_URL = import.meta.env.VITE_BACKEND_TRANSMITTER_OCR_URL;

/////////////////<<<<<<<<<<<<<<<<<<<Transmitter OCR APIs>>>>>>>>>>>>>>>>>>>>>\\\\\\\\\\\\\\\\\\
export const TransmitterGetMemberOCRRole = async () => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + '/transmitter_ocr/member/me')
  return response
}

// Master Activity Functions
export const TransmitterGetMasterActivities = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string,
  user_status?: string,
  status?: string,
  template?: string
) => {
  const response = await TransmitterOCRAPI.get(
    BACKEND_TBWES_OCR_URL +
      `/transmitter_ocr/master_activity?skip=${skip}&limit=${limit}` +
      `${search_term && search_term !== '' ? '&search_term=' + encodeURIComponent(search_term) : ''}` +
      `${status ? '&status=' + status : ''}` +
      `${user_status ? '&user_status=' + user_status : ''}` +
      `${template && template !== 'All' ? '&template=' + encodeURIComponent(template) : ''}`
  );
  return response;
};

export const TransmitterGetMasterActivityDetails = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}`)
  return response
}

// Polling endpoint — checks is_extracted status for a master activity
export const TransmitterGetMasterActivityStatus = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}/status`)
  return response
}

export const TransmitterUpdateMasterActivityDetails = async (activity_id: number, body?: any) => {
  const response = await TransmitterOCRAPI.patch(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}`, body);
  return response
}

export const TransmitterCheckMasterHasChildActivities = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}/has_child_activities`)
  return response
}

export const TransmitterDeleteMasterActivity = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.delete(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}`)
  return response
}

export const TransmitterCreateMasterActivity = async (
  title: string,
  device_type: string,  // "Transmitter" or "Gauge"
  template: string,     // "emerson", etc.
  file: File,
  product_document_id?: string | number
) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();

  // Append all required fields
  formData.append('title', title);
  formData.append('device_type', device_type);
  formData.append('template', template);

  if (file) {
    formData.append('document', file, file.name);
  }

  if (product_document_id) {
    formData.append('product_document_id', product_document_id.toString());
  }

  try {
    const response = await axios.post(
      `${BACKEND_TBWES_OCR_URL}/transmitter_ocr/master_activity`,
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
    if (error?.response?.status === 415) {
      (store.dispatch as Dispatch).toast.openToast({
        status: true,
        message: "Unsupported extension(s) only use .pdf, .xls, .xlsx",
        type: "error"
      });
    }
    throw error;
  }
};

export const TransmitterGetMasterDocumentUrl = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}/link`)
  return response
}

export const TransmitterSentMasterMultipartMessage = async (activity_id: number, status: string) => {
  const response = await TransmitterOCRAPI.post(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}?status=${status}`)
  return response
}

export const TransmitterGetMasterAckData = async (activity_id: string) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/ack_response/${activity_id}`);
  return response
}

export const TransmitterTransferMasterActivity = async (activity_id: string, user_id: string) => {
  const response = await TransmitterOCRAPI.put(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_activity/${activity_id}/transfer?user_id=${user_id}`)
  return response
}

// Get child activities for a specific master activity
export const TransmitterGetMasterChildActivities = async (
  master_activity_id: number,
  skip: number = 0,
  limit: number = 100,
  search_term?: string,
  status?: string,
  user_status?: string
) => {
  let url = `${BACKEND_TBWES_OCR_URL}/transmitter_ocr/master_activity/${master_activity_id}/child_activities?skip=${skip}&limit=${limit}`;

  if (search_term && search_term !== '') {
    url += `&search_term=${encodeURIComponent(search_term)}`;
  }

  if (status) {
    url += `&status=${status}`;
  }

  if (user_status) {
    url += `&user_status=${user_status}`;
  }

  const response = await TransmitterOCRAPI.get(url);
  return response;
}

// Child Activity Functions
export const TransmitterGetChildActivities = async (
  skip: number = 0,
  limit: number = 100,
  search_term?: string,
  user_status?: string,
  status?: string,
  master_id?: number  // Now an integer
) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL +
    `/transmitter_ocr/child_activity?skip=${skip}&limit=${limit}` +
    `${search_term !== '' ? '&search_term=' + search_term : ''}` +
    `${status ? '&status=' + status : ''}` +
    `${user_status ? '&user_status=' + user_status : ''}` +
    `${master_id !== undefined ? '&master_id=' + master_id : ''}`
  );
  return response;
}

export const TransmitterGetChildActivityDetails = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}`)
  return response
}

// ── NEW: Polling endpoint — checks is_extracted status for a child activity
export const TransmitterGetChildActivityStatus = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}/status`)
  return response
}

export const TransmitterUpdateChildActivityDetails = async (activity_id: number, body?: any) => {
  const response = await TransmitterOCRAPI.patch(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}`, body);
  return response
}

export const TransmitterDeleteChildActivity = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.delete(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}`)
  return response
}

export const TransmitterCreateChildActivity = async (
  title: string,
  file: File,
  masterId: number,
  pagesToTrim?: string
) => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  if (file) {
    formData.append('document', file, file.name);
  }
  formData.append('title', title);
  formData.append('master_id', masterId.toString());
  if (pagesToTrim) {
    formData.append('pages_to_trim', pagesToTrim);
  }
  try {
    const response = await axios.post(
      `${BACKEND_TBWES_OCR_URL}/transmitter_ocr/child_activity`,
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
      (store.dispatch as Dispatch).toast.openToast({ status: true, message: "Unsupported extension(s) only use .pdf, .xls, .xlsx" });
    throw error;
  }
};

export const TransmitterGetChildDocumentUrl = async (activity_id: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}/link`)
  return response
}

export const TransmitterSentChildMultipartMessage = async (activity_id: number, status: string) => {
  const response = await TransmitterOCRAPI.post(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}?status=${status}`)
  return response
}

export const TransmitterGetChildAckData = async (activity_id: string) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/ack_response/${activity_id}`);
  return response
}

export const TransmitterTransferChildActivity = async (activity_id: string, user_id: string) => {
  const response = await TransmitterOCRAPI.put(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}/transfer?user_id=${user_id}`)
  return response
}

// Common Functions (Shared by Master and Child)
export const TransmitterReadOCRMembers = async (skip: number = 0, limit: number = 100, search_term?: string) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/member?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
  return response
}

export const TransmitterCreateOCRMember = async (role: string, email: string, name: string) => {
  const response = await TransmitterOCRAPI.post(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/member?role=${role}&email=${email}&name=${name}`)
  return response
}

export const TransmitterUpdateOCRMember = async (role: string, name: string, member_id: string) => {
  const response = await TransmitterOCRAPI.patch(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/member/${member_id}?name=${name}&role=${role}`)
  return response
}

export const TransmitterDeleteOCRMember = async (member_id: string) => {
  const response = await TransmitterOCRAPI.delete(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/member/${member_id}`)
  return response
}

export const TransmitterReadOCRActivityUsage = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/usage/activity?year=${year}&month=${month}`)
  return response
}

export const TransmitterReadOCRTopUsers = async (year: string | number, month: string | number, skip: number = 0, limit: number = 6) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`)
  return response
}

export const TransmitterReadMasterOCRCostUsage = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.post(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_usage/cost?year=${year}&month=${month}`)
  return response
}
export const TransmitterReadChildOCRCostUsage = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.post(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_usage/cost?year=${year}&month=${month}`)
  return response
}

export const TransmitterReadOCRUsageLimit = async () => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + '/transmitter_ocr/usage/cost/limit')
  return response
}

export const TransmitterUpdateOCRUsageLimit = async (limit: number) => {
  const response = await TransmitterOCRAPI.patch(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/usage/cost/limit?limit=${limit}`)
  return response
}

export const TransmitterUpdateBAAN = async (body: any) => {
  const response = await TransmitterOCRAPI.put(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/baan`, body)
  return response
}

export const TransmitterReadOCRActivityStatus = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/usage/activity/stats?year=${year}&month=${month}`)
  return response
}

export const TransmitterGetBaanData = async (skip: number, limit: number, search_term: string) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/baan?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`);
  return response
}

// Master Usage Functions
export const TransmitterReadMasterActivityUsage = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_usage/activity?year=${year}&month=${month}`)
  return response
}

export const TransmitterReadMasterTopUsers = async (year: string | number, month: string | number, skip: number = 0, limit: number = 6) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`)
  return response
}

export const TransmitterReadMasterActivityStatus = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/master_usage/activity/stats?year=${year}&month=${month}`)
  return response
}

// Child Usage Functions
export const TransmitterReadChildActivityUsage = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_usage/activity?year=${year}&month=${month}`)
  return response
}

export const TransmitterReadChildTopUsers = async (year: string | number, month: string | number, skip: number = 0, limit: number = 6) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`)
  return response
}

export const TransmitterReadChildActivityStatus = async (year: string | number, month: string | number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_usage/activity/stats?year=${year}&month=${month}`)
  return response
}

// Tag Numbers Function
export const TransmitterGetTagNumbers = async (
  title: string,
  skip: number = 0,
  limit: number = 100,
  search_term?: string,
  status?: string,
  user_status?: string
) => {
  let url = `${BACKEND_TBWES_OCR_URL}/transmitter_ocr/child_activity/tag_numbers?title=${encodeURIComponent(title)}&skip=${skip}&limit=${limit}`;

  if (search_term && search_term !== '') {
    url += `&search_term=${encodeURIComponent(search_term)}`;
  }

  if (status && status !== 'ALL') {
    url += `&status=${status}`;
  }

  if (user_status && user_status !== 'ALL') {
    url += `&user_status=${user_status}`;
  } else {
    url += `&user_status=ALL`;
  }

  const response = await TransmitterOCRAPI.get(url);
  return response;
}

export const TransmitterGetTagNumberDocumentUrl = async (activity_id: number, tag_number: string) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/${activity_id}/transmitter/${encodeURIComponent(tag_number)}/link`)
  return response
}

export const TransmitterGetTagNumberDetails = async (title: string, tag_number: string) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/tag_number/details?title=${encodeURIComponent(title)}&tag_number=${encodeURIComponent(tag_number)}`)
  return response
}

export const TransmitterUpdateTagNumberFields = async (data: any) => {
  const response = await TransmitterOCRAPI.patch(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_activity/tag_number/update`, data);
  return response
}

// Activity Summary Detail APIs
export const TransmitterGetChildActivitySummaryDetails = async (
  activity_id: number,
  skip: number = 0,
  limit: number = 100,
  search_term?: string,
  status?: string,
  user_status?: string
) => {
  let url = `${BACKEND_TBWES_OCR_URL}/transmitter_ocr/child_activity/${activity_id}/details?skip=${skip}&limit=${limit}`;

  if (search_term && search_term !== '') {
    url += `&search_term=${encodeURIComponent(search_term)}`;
  }

  if (status) {
    url += `&status=${status}`;
  }

  if (user_status) {
    url += `&user_status=${user_status}`;
  }

  const response = await TransmitterOCRAPI.get(url);
  return response;
}

export const TransmitterGetYearTagsCount = async (year: number) => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_usage/year-tags-count?year=${year}`);
  return response;
};

export const TransmitterGetProcessedYears = async () => {
  const response = await TransmitterOCRAPI.get(BACKEND_TBWES_OCR_URL + `/transmitter_ocr/child_usage/processed-years`);
  return response;
};