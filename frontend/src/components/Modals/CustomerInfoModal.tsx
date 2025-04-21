import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import Text from "../Text";
import Close from "../../assets/close.svg";

interface Props {
    onSubmit: ({ customerName, ocNumber }) => void;
    show: boolean;
    onClose: () => void;
}

const CustomerInfoModal: React.FC<Props> = ({ onSubmit, show, onClose }) => {

  const dispatch = useDispatch<Dispatch>();
  const [customerName, setCustomerName] = useState("");
  const [ocNumber, setOcNumber] = useState("");
    const [error, setError] = useState("");
    
  const closeModal = () => {
      dispatch.modal.closeConfirmation();
      onClose()
  };

  return (
    <>
      <Transition appear show={show} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#0061F3]/10" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel
                  className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DialogTitle
                    as="h3"
                    className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                  >
                    <Text>Customer Details</Text>
                    <button
                      className="absolute -right-4 -top-5"
                      onClick={closeModal}
                    >
                      <img src={Close} alt="close" loading="lazy" />
                    </button>
                  </DialogTitle>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!customerName.trim()) {
                        setError("Customer Name is required");
                        return;
                      }
                      onSubmit({ customerName, ocNumber });
                      closeModal();
                    }}
                  >
                    <div className="mb-4 mt-5">
                      <label className="block text-sm font-medium text-gray-700">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        required
                      />
                      {error && (
                        <p className="text-red-500 text-xs mt-1">{error}</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        OC Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={ocNumber}
                        onChange={(e) => setOcNumber(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                      />
                    </div>
                    <div className="mt-5 flex justify-end gap-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        <Text type="small">Cancel</Text>
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
                      >
                        <Text type="small">Confirm</Text>
                      </button>
                    </div>
                  </form>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default CustomerInfoModal;
