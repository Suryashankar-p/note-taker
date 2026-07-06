import { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import CloseIcon from "../../../assets/close.svg";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
};

const DeleteConfirmationModal = ({ open, onClose, onConfirm, memberName }: Props) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
              <div className="mb-6 flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold text-[#0D1431]">
                  Remove Member
                </DialogTitle>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-20 w-20 items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                  <img src={CloseIcon} alt="close" className="w-16 h-16 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-2">
                  <svg
                    className="w-8 h-8 text-[#e03639]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </div>

                <p className="text-center text-gray-700 text-base">
                  Are you sure you want to remove this member? 
                </p>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={onConfirm}
                    className="rounded-lg bg-[#e03639] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#c92e32] active:bg-[#b0282c] transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteConfirmationModal;
