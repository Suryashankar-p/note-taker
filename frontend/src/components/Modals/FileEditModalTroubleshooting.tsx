import {
  Dialog,
  Transition,
  Textarea,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useRef, useEffect } from "react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useForm } from "react-hook-form";
import Toast from "../Toast";

interface IFormInput {
  fileName: string;
  file: any;
}

interface Props {
  defaultValues: any;
  onSubmit: any;
}

const FileEditModal: React.FC<Props> = ({ defaultValues, onSubmit }) => {
  const isOpen = useSelector((state: RootState) => state.modal.isOpen);
  const dispatch = useDispatch<Dispatch>();
  const [fileName, setFileName] = useState<string>("");
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [file, setFile] = useState<File | null>(null);
  const loading = useSelector((state: RootState) => state.loadingState.status);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm<IFormInput>();

  const closeModal = () => {
    dispatch.modal.closeModal();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const truncatedFileName =
        file.name.length > 20
          ? `${file.name.substring(0, 20)}...`
          : file.name;
      setFileName(truncatedFileName);
      setFile(file);
      clearErrors("fileName");
      setValue("fileName", truncatedFileName);
    }
  };
  
  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const onHandle = (data: IFormInput) => {
    if (file) {
      data.file = file;
    }
    onSubmit(data);
  };

  return (
    <>
      <Transition appear show={isOpen?.status} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-100"
          onClose={closeModal}
          initialFocus={initialFocusRef}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#0061F3]/5" />
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
                  className="w-[90%] sm:max-w-xs md:max-w-md lg:max-w-lg h-fit transform overflow-hidden rounded-2xl bg-white p-4 sm:p-5 md:p-6 text-left align-middle shadow-xl transition-all"
                  style={{ transform: "translate(5vw, 5vh)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DialogTitle
                    as="h3"
                    className="text-[20px] sm:text-[18px] md:text-[24px] relative font-medium flex justify-between leading-6 text-gray-900"
                  >
                    <Text>{"Add file"}</Text>
                    <button
                      className="absolute right-2 -top-1 sm:right-1 sm:-top-1"
                      onClick={closeModal}
                      ref={initialFocusRef}
                    >
                      <img
                        src={Close}
                        alt="close"
                        className="w-12 h-12 sm:w-12 sm:h-12"
                        loading="lazy"
                      />
                    </button>
                  </DialogTitle>

                  <form onSubmit={handleSubmit(onHandle)}>
                    {toastStatus.status && (
                      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                        <Toast type="error" />
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mt-3">
                      <div className="flex flex-col md:flex-row w-full gap-4">
                        <div className="flex flex-col w-full md:w-2/3 gap-1">
                          <label>
                            <Text className="text-primary_text">
                              Upload File*
                            </Text>
                          </label>
                          <div className="relative w-full">
                            <input
                              type="text"
                              {...register("fileName", {
                                required: "Field is required",
                              })}
                              className={`border ${
                                errors?.fileName && "border-danger"
                              } rounded-md w-full h-10 sm:h-12 flex-grow focus:outline-none p-3 sm:p-4`}
                              placeholder="Upload File"
                            />
                            <input
                              type="file"
                              className="hidden"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                            />
                            <button
                              type="button"
                              className="absolute h-9 sm:h-10 right-2 top-1/2 transform -translate-y-1/2 border cursor-pointer bg-inherit text-primary_text rounded-md px-3 py-1"
                              onClick={handleChooseFileClick}
                            >
                              <Text type="small">Choose File</Text>
                            </button>
                          </div>
                          <Text type="small" className="text-danger">
                            {errors?.fileName?.message}
                          </Text>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-10 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-3 sm:px-4 py-2 text-sm sm:text-base font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        <Text type="small">Cancel</Text>
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center items-center rounded-md border border-transparent bg-[#0061F3] px-3 sm:px-4 py-2 text-sm sm:text-base font-medium text-white focus:outline-none focus-visible:ring-offset-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="mr-2">Saving...</div>
                            <svg
                              className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              ></path>
                            </svg>
                          </div>
                        ) : (
                          <span>Save</span>
                        )}
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

export default FileEditModal;
