import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import store, { Dispatch } from '../redux/store';

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
          case 401:
          case 403:
          case 404:
          case 412:
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
