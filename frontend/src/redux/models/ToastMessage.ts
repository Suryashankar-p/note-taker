// Define the interface for ChatIdState
export interface ToastState {
    message: string;
    status: boolean;
    type?: string
  }
  
  // Define the initial state
  const initialState: ToastState = {
    message: '',
    status: false,
    type:'error'
  };
  
  // Define the reducer with proper state updates
  const toast = {
    state: initialState,
    reducers: {
      openToast(state: ToastState, payload: ToastState): ToastState {
        return { ...state, message: payload.message, status: payload.status, type: payload?.type};
      },
    },
  };
  
  export default toast;
  