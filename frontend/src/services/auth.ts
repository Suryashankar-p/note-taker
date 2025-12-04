
import {SSOAPI } from "./Axios";
import axios from "axios";


const BACKEND_SSO_URL = window.env?.BACKEND_SSO_URL || import.meta.env.VITE_BACKEND_SSO_URL

export interface LoginBody {
  username: string;
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
//<-------------------Authorisation and Login--------------------->//

export const loginApi = async (body: any): Promise<LoginResponse | null> => {  
  try {
    const response = await axios.post<LoginResponse>(`${BACKEND_SSO_URL}/login/access-token`, new URLSearchParams(body), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  } catch (err) {
    console.error("Login error", err);
    return null;
  }
};

// export const getAuthUrl = async () => {
//   const response = await SSOAPI.get(BACKEND_SSO_URL + "/microsoft/login");
//   return response;
// }
export const getAuthUrl = async (redirectUrl: string) => {
  const response = await SSOAPI.get(BACKEND_SSO_URL + `/microsoft/login?redirect=${redirectUrl}`);
  return response;
}

export const getToken = async (params: string) => {
  const response = await SSOAPI.get(BACKEND_SSO_URL + `/login/access-token?${params}`);
  return response
}
