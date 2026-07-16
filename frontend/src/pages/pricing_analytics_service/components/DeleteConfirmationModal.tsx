import { Fragment } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import CloseIcon from "../../../assets/close.svg";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName?: string;
  loading?: boolean;
};

const DeleteConfirmationModal = ({ open, onClose, onConfirm, memberName, loading }: Props) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0061F3]/10" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle
                as="h3"
                className="text-[20px] relative text-black font-semibold flex justify-between leading-6 text-gray-900"
              >
                <span>Remove Member</span>
                <button
                  className="absolute -right-2 -top-2 flex items-center justify-center p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200"
                  onClick={onClose}
                  disabled={loading}
                >
                  <img src={CloseIcon} alt="close" className="w-4 h-4" />
                </button>
              </DialogTitle>

              <div className="mb-2 mt-5">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Are you sure you want to remove this member?
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={loading}
                  className="inline-flex justify-center items-center gap-2 rounded-md border border-transparent bg-[#e03639] px-4 py-2 text-sm font-medium text-white hover:bg-[#c92e32] active:bg-[#b0282c] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </DialogPanel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DeleteConfirmationModal;
