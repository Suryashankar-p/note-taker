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
            break
          case 401:
            redirectToLogin()
            break
          case 403:
            redirectToLogin()
            break
          case 404:
            break
          case 412:
            break
          case 502:
            console.error(response.statusText, response.data);
            break;
          case 500:
            dispatch.toast.openToast({
              status: true,
              message: 'Server did not respond',
              type: 'error',
            });
            break;
          default:
            console.error('Unhandled error:', response.data);
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
