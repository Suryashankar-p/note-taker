import {
  Dialog,
  Transition,
  Textarea,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useRef, useEffect } from "react";
import DropDownButton from "../DropDownButton";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useForm } from "react-hook-form";
import Toast from "../Toast";
import { fileTypeSelectorDoctorConBot } from "../../utils/functions";

const listValues = [
  { name: "Manual" },
  { name: "Image" },
  { name: "Video" },
  { name: "Other" },
];

interface Tag {
  id: number | null;
  title: string;
}

interface IFormInput {
  fileName: string;
  description: string;
  fileType: string;
  file: any;
}

interface Props {
  defaultValues: any;
  onSubmit: any;
  title: string;
}

const FileEditModal: React.FC<Props> = ({ defaultValues, onSubmit, title }) => {
  const isOpen = useSelector((state: RootState) => state.modal.isOpen);
  const dispatch = useDispatch<Dispatch>();
  const [fileName, setFileName] = useState<string>("");
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [selectedFileType, setSelectedFileType] = useState({ name: "Manual" });
  const [selectedModels, setSelectedModels] = useState<Tag[]>([]); // State for selected models
  const [file, setFile] = useState<File | null>(null);
  const loading = useSelector((state: RootState) => state.loadingState.status);
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    getValues,
  } = useForm<IFormInput>();

  useEffect(() => {
    if (selectedFileType && !defaultValues?.kind) {
      setValue("fileType", "Manual");
    }

    return () => {
      dispatch.loadingState.endLoading();
    };
  }, []);

  useEffect(() => {
    if (defaultValues) {
      setValue("description", defaultValues?.description);
      setValue("fileName", defaultValues?.filename);
      setSelectedFileType({
        name: fileTypeSelectorDoctorConBot(defaultValues?.kind),
      });
      setValue("fileType", fileTypeSelectorDoctorConBot(defaultValues?.kind));
      setValue("file", defaultValues?.file);
    }
  }, [defaultValues]);

  const closeModal = () => {
    dispatch.modal.closeModal();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFileName(event.target.files[0].name);
      setFile(event.target.files[0]);
      clearErrors("fileName");
      setValue("fileName", event.target.files[0].name);
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
    data.description = data?.description?.trim();
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
                  className="w-full max-w-4xl h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                  style={{ transform: "translate(60px, 10px)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <DialogTitle
                    as="h3"
                    className="text-[24px] relative font-medium flex justify-between leading-6 text-gray-900"
                  >
                    <Text>
                      {/* {isOpen?.type === "edit" ? "Edit File" : "Add file"} */}
                      Add File
                    </Text>
                    <button
                      className="absolute -right-4 -top-5"
                      onClick={closeModal}
                      ref={initialFocusRef}
                    >
                      <img src={Close} alt="close" loading="lazy" />
                    </button>
                  </DialogTitle>
                  <form onSubmit={handleSubmit(onHandle)}>
                    {toastStatus.status && (
                      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                        <Toast type="error" />
                      </div>
                    )}
                    <Text type="small" className="italic text-gray-400 mt-1">
                      {title}
                    </Text>
                    <div className="flex mt-3 flex-col gap-2">
                      {/* File upload and file type dropdown - Only show when NOT in edit mode */}
                      {isOpen?.type !== "edit" && (
                        <div className="flex flex-row mt-2 w-full gap-5 justify-between">
                          <div className="flex flex-col w-2/3 gap-1">
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
                                } rounded-md w-full border-grey h-12 flex-grow focus:outline-none p-4`}
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
                                className="absolute h-10 right-2 top-1/2 transform -translate-y-1/2 border cursor-pointer bg-inherit text-primary_text rounded-md px-4 py-1"
                                onClick={handleChooseFileClick}
                              >
                                <Text type="small">Choose File</Text>
                              </button>
                            </div>
                            <Text type="small" className="text-danger">
                              {errors?.fileName?.message}
                            </Text>
                          </div>
                          <div className="w-1/3">
                            <DropDownButton
                              label="File type"
                              listValues={listValues}
                              value={selectedFileType}
                              onChange={(value: any) => {
                                setSelectedFileType(value);
                                clearErrors("fileType");
                                setValue("fileType", value.name);
                              }}
                              error={errors.fileType}
                            />
                          </div>
                        </div>
                      )}

                      {/* Description - Always visible */}
                      <div className="w-full flex-col gap-5 mt-3 h-32">
                        <label>
                          <Text className="text-primary_text">
                            Description*
                          </Text>
                        </label>
                        <Textarea
                          className={`w-full h-full border mt-1 ${
                            errors?.description && "border-danger"
                          } rounded-md focus:outline-none p-4`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Enter file description..."
                          {...register("description", {
                            required: "Field is required",
                          })}
                        />
                        <Text type="small" className="text-danger">
                          {errors?.description?.message}
                        </Text>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-end gap-4">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                      >
                        <Text type="small">Cancel</Text>
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center items-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-offset-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <div className="mr-2">Saving...</div>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
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
