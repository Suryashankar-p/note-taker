import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch, RootState } from '../redux/store';
import Text from './Text';

type ToastProps = {
  duration?: number;
  type: 'success' | 'error';
  onClose?: any;
};

const Toast: React.FC<ToastProps> = ({ duration = 3000, type, onClose }) => {
  //const [show, setShow] = useState(true);
  const dispatch = useDispatch<Dispatch>()
  const toastValue = useSelector((state: RootState) => state.toast)

  useEffect(() => {
    const timer = setTimeout(() => {
      // setShow(false);
      // onClose();
      dispatch.toast.openToast({ message: '', status: false, type: 'error' })
    }, duration);

    return () => {
      clearTimeout(timer);
      handleClose()
    };
  }, [duration]);

  const handleClose = () => {
    dispatch.toast.openToast({ message: '', status: false, type: 'error' })
  //  onClose()
  };

  return (
    <div
      className={`fixed top-4 min-w-80 z-50 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 p-4 transition-all duration-500 ease-out ${toastValue?.status ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        } ${type === 'success' ? 'border-green-400' : 'border-red-400'}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex">
          <div className="flex-shrink-0">
            {type === 'success' ? (
              <svg
                className="h-6 w-6 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2l4-4m5 5a9 9 0 11-18 0a9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>
          <div className="ml-3 w-fit flex-1 pt-0.5">
            <Text type='small' className="text-sm font-medium text-gray-900">{toastValue?.message}</Text>
          </div>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleClose}
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-3 w-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
