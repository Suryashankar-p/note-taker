import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import store, { Dispatch } from '../redux/store';
import { redirectToLogin } from './Axios';

const dispatch = store.dispatch as Dispatch;

export const setInterceptors = (axiosInstance: AxiosInstance) => {
  axiosInstance.interceptors.request.use(
    (config: any) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      const { response }: any = error;

      if (response) {
        switch (response.status) {
          case 400:
            console.error('Bad Request:', response.data);
            return response;
          case 401:
            console.error('Unauthorized:', response.data);
            redirectToLogin();
            return response;
          case 403:
            console.error('Forbidden:', response.data);
            return response;
          case 404:
            console.error('Not Found:', response.data);
            return response;
          case 412:
            console.error('Not Found:', response.data);
            return response
          case 500:
            console.error('Internal Server Error:', response.data);
            dispatch.toast.openToast({ status: true, message: "Server did not respond", type: 'error' });
          case 502:
            console.error('Bad Gateway:', response.data);
            return response;
          default:
            console.error(`Error: ${response.status}`, response.data);
            return response;
        }
      } else if (error.message === 'Network Error') {
        dispatch.toast.openToast({
          status: true,
          message: 'Server did not respond',
          type: 'error',
        });
      }

      return Promise.reject(error);
    },
  );
};
