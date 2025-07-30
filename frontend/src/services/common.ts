import {SSOAPI } from "./Axios";

// const ROOT_PATH = 'http://localhost/api'
// const BACKEND_SSO_URL = import.meta.env.VITE_BACKEND_SSO_URL;
const BACKEND_SSO_URL = window.env?.BACKEND_SSO_URL || import.meta.env.VITE_BACKEND_SSO_URL;



//<======================User details and services and roles====================>

export const GetUserDetails = async () => {
    const response = await SSOAPI.get(BACKEND_SSO_URL + "/user/me/");
    return response;
  };
  
  export const GetServices = async (skip: number = 0, limit: number = 100, search_term: string = '') => {
    const response = await SSOAPI.get(BACKEND_SSO_URL + `/service?skip=${skip}&limit=${limit}&search_term=${search_term}`);
    return response
  }
