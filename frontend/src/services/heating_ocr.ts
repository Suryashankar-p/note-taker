import store, { Dispatch } from "../redux/store";
import { HeatingOCRAPI } from "./Axios";
import axios from "axios";

const BACKEND_HEATING_OCR_URL=import.meta.env.VITE_BACKEND_HEATING_OCR_URL  || window.env?.BACKEND_HEATING_OCR_URL;

/////////////////<<<<<<<<<<<<<<<<<<<OCR APIs>>>>>>>>>>>>>>>>>>>>>\\\\\\\\\\\\\\\\\\

export const GetHeatingOCRRole = async () => {
    const response = await HeatingOCRAPI.get('/heating_ocr/member/me')
    return response
  }
  
  export const GetOCRActivities = async (skip: number = 0, limit: number = 100, search_term?: string, user_status?: string, status?: string) => {
    const response = await HeatingOCRAPI.get(`/heating_ocr/activity?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}${status ? '&status=' + status : ''}${user_status ? '&user_status=' + user_status : ''}`)
    return response
  }
  
  export const GetOCRActivitiesDetails = async(activity_id: number) => {
    const response = await HeatingOCRAPI.get(`/heating_ocr/activity/${activity_id}`)
    return response
  }
  
  export const UpdateOCRActivitiesDetails = async(activity_id: number, body?: any) => {
    const response = await HeatingOCRAPI.patch(`/heating_ocr/activity/${activity_id}`, body);
    return response
  }

  export const GetMakerCodes = async (search = "") => {
    const response = await HeatingOCRAPI.get(`/heating_ocr/maker_code/${search ? `?search=${search}` : ""}`);
    return response;
  };

  export const GetProcessCodes = async (search = "") => {
    const response = await HeatingOCRAPI.get(`/heating_ocr/process_code/${search ? `?search=${search}` : ""}`);
    return response;
  };
  
  export const DeleteOCRActivities = async(activity_id: number) => {
    const response = await HeatingOCRAPI.delete(`/heating_ocr/activity/${activity_id}`)
    return response
  }
  
  export const ReadOCRMembers = async (skip: number = 0, limit: number = 100, search_term?: string) => {
    const response = await HeatingOCRAPI.get(`/heating_ocr/member?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`)
    return response
  }
  
  export const CreateOCRMember = async (role: string, email: string, name: string) => {
    const response = await HeatingOCRAPI.post(`/heating_ocr/member?role=${role}&email=${email}&name=${name}`)
    return response
  }
  
  export const UpdateOCRMember = async (role: string, name: string, member_id: string) => {
    const response = await HeatingOCRAPI.patch(`/heating_ocr/member/${member_id}?name=${name}&role=${role}`)
    return response
  }
  
  export const DeleteOCRMember = async (member_id: string) => {
    const response = await HeatingOCRAPI.delete(`/heating_ocr/member/${member_id}`)
    return response
  }
  
  export const ReadOCRActivityUsage = async (year: string | number, month: string | number) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/activity?year=${year}&month=${month}`)
    return response
  }

  export const ReadOCRActivityUsageByYear = async (year: string | number) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/year-activity?year=${year}`)
    return response
  }

  export const ReadOCRTopUsers = async (year: string | number, month: string | number, skip: number = 0, limit: number = 6) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/activity/top?skip=${skip}&limit=${limit}&year=${year}&month=${month}`)
    return response
  }
  
  export const ReadOCRCostUsage = async (year: string | number, month: string | number) => {
    const response = await HeatingOCRAPI.post(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/cost?year=${year}&month=${month}`)
    return response
  }

  export const ReadOCRCostUsageByYear = async (year: string | number) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/year-cost?year=${year}`)
    return response
  }
  
  export const ReadOCRUsageLimit = async () => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + '/heating_ocr/usage/cost/limit')
    return response
  }
  
  export const UpdateOCRUsageLimit = async (limit: number) => {
    const response = await HeatingOCRAPI.patch(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/cost/limit?limit=${limit}`)
    return response
  }
  
  export const UpdateBAAN = async (body: any) => {
    const response = await HeatingOCRAPI.put(BACKEND_HEATING_OCR_URL + `/heating_ocr/baan`, body)
    return response
  }
  
  export const CreateOCRActivity = async (title: string, document: File, template?: string, number?: number) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('title', title);
    formData.append('document', document);
    if (template) {
      formData.append('template', template);
    }
    if (number) {
      formData.append('number', number.toString());
    }
    const response = await axios.post(`${BACKEND_HEATING_OCR_URL}/heating_ocr/activity`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  };
  
  export const GetDocumentUrl = async(activity_id: number) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/activity/${activity_id}/link`)
    return response
  }
  
  export const SentMultipartMessage = async (activity_id: number, status: string) => {
    const response = await HeatingOCRAPI.post(BACKEND_HEATING_OCR_URL + `/heating_ocr/activity/${activity_id}?status=${status}`)
    return response
  }
  
  export const ReadOCRActivityStatus = async (year: string | number, month: string | number) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/usage/activity/stats?year=${year}&month=${month}`)
    return response
  }
  
  export const GetBaanData = async (skip: number, limit: number, search_term: string) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/baan?skip=${skip}&limit=${limit}${search_term !== '' ? '&search_term=' + search_term : ''}`);
    return response
  }
  
  export const TranferActivity = async (activity_id: string, user_id: string) => {
    const response = await HeatingOCRAPI.put(BACKEND_HEATING_OCR_URL + `/heating_ocr/activity/${activity_id}/transfer?user_id=${user_id}`)
    return response
  }
  
  export const GetActivityGroups = async (activity_id: number) => {
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/activity/${activity_id}/groups`);
    return response;
  };

  export const GetGroupActivityData = async (activity_id: number, group: string[]) => {
    // Encode the group array as JSON string
    const groupParam = encodeURIComponent(JSON.stringify(group));
    const response = await HeatingOCRAPI.get(BACKEND_HEATING_OCR_URL + `/heating_ocr/activity/${activity_id}/mapped-activity?group=${groupParam}`);
    return response;
  };

