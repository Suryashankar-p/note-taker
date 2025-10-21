import { Dialog, Transition, DialogTitle, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';
import Close from '../../assets/close.svg';

interface DownloadFeedbackDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fromDate: string, toDate: string) => void;
}

const DownloadFeedbackDetails: React.FC<DownloadFeedbackDetailsProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [errors, setErrors] = useState({ fromDate: "", toDate: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors = { fromDate: "", toDate: "" };
    if (!fromDate) {
      newErrors.fromDate = "From date is required";
    }
    if (toDate && fromDate && new Date(toDate) < new Date(fromDate)) {
      newErrors.toDate = "To date must be after from date";
    }

    if (newErrors.fromDate || newErrors.toDate) {
      setErrors(newErrors);
      return;
    }

    onSubmit(fromDate, toDate);
    onClose();
    // Reset form
    setFromDate("");
    setToDate("");
    setErrors({ fromDate: "", toDate: "" });
  };

  const handleClose = () => {
    setFromDate("");
    setToDate("");
    setErrors({ fromDate: "", toDate: "" });
    onClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={handleClose}>
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
                className="w-full max-w-md h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <DialogTitle
                  as="h3"
                  className="text-[24px] relative text-black font-medium flex justify-between leading-6"
                >
                  <span className="text-primary_text">Download Usage Details</span>
                  <button className='absolute -right-2 -top-4' onClick={handleClose}>
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>

                <form onSubmit={handleSubmit}>
                  <div className="flex flex-row mt-5 gap-3 w-full">
                    <div className="flex flex-col w-1/2 space-y-1">
                      <label className="text-primary_text">From Date*</label>
                      <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => {
                          setFromDate(e.target.value);
                          if (errors.fromDate) setErrors({ ...errors, fromDate: "" });
                        }}
                        className={`w-11/12 h-8 border rounded-md focus:outline-none p-4 ${
                          errors.fromDate ? "border-red-500" : "border-gray-300"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {errors.fromDate && <span className="text-red-500">{errors.fromDate}</span>}
                    </div>

                    <div className="flex flex-col w-1/2 space-y-1">
                      <label className="text-primary_text">To Date</label>
                      <input
                        type="date"
                        value={toDate}
                        onChange={(e) => {
                          setToDate(e.target.value);
                          if (errors.toDate) setErrors({ ...errors, toDate: "" });
                        }}
                        className={`w-11/12 h-8 border rounded-md focus:outline-none p-4 ${
                          errors.toDate ? "border-red-500" : "border-gray-300"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {errors.toDate && <span className="text-red-500">{errors.toDate}</span>}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-5 flex justify-end gap-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handleClose}
                    >
                      <span className="text-sm">Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-offset-2"
                    >
                      <span className="text-sm">Submit</span>
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DownloadFeedbackDetails;