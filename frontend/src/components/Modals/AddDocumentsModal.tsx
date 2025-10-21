// AddDocumentsModal.tsx
import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState, useRef, useEffect } from "react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import DropDownButton from "../DropDownButton";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useForm } from "react-hook-form";
import Toast from "../Toast";

const listValues = [
  { name: "Policy" },
  { name: "Procedure" },
  { name: "Guidelines" },
  { name: "Others" },
];

interface IFormInput {
  file: FileList;
  kind: string;
}

interface Props {
  defaultValues: {
    filename?: string;
    file?: File;
    kind?: string;
  } | null;
  onSubmit: (data: {
    file: File;
    kind: string;
  }) => void;
}

const AddDocumentsModal: React.FC<Props> = ({ defaultValues, onSubmit }) => {
  const isOpen = useSelector((state: RootState) => state.modal.isOpen);
  const dispatch = useDispatch<Dispatch>();
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loading = useSelector((state: RootState) => state.loadingState.status);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [selectedFileType, setSelectedFileType] = useState(listValues[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<IFormInput>({
    defaultValues: {
      kind: defaultValues?.kind || "Policy",
    },
  });
  const watchedFileList = watch("file");
  const watchedKind = watch("kind");

  useEffect(() => {
    if (defaultValues) {
      setValue("kind", defaultValues.kind || "");
    }
    else {
      setValue("kind", "Policy");
      setSelectedFileType(listValues[0]);
    }
  }, [defaultValues, setValue]);

  const closeModal = () => {
    dispatch.modal.closeModal();
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const onHandle = (data: IFormInput) => {
    if (!data.file || data.file.length === 0) return;
    const file = data.file[0];
    onSubmit({
      file,
      kind: data.kind,
    });
  };

  return (
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
                className="w-full max-w-xl h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                style={{ transform: "translate(60px, 10px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <DialogTitle
                  as="h3"
                  className="text-[24px] relative font-medium flex justify-between leading-6 text-gray-900"
                >
                  <Text>
                    {isOpen?.type === "edit" ? "Edit File" : "Add document"}
                  </Text>
                  <button
                    className="absolute -right-4 -top-5"
                    onClick={closeModal}
                    ref={initialFocusRef}
                  >
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>

                <form onSubmit={handleSubmit(onHandle)} className="mt-4">
                  {toastStatus.status && (
                    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                      <Toast type="error" />
                    </div>
                  )}

                  <div className="flex flex-col gap-6">
                    {/* File type / kind */}
                    <div className="flex flex-col w-full">
                      <DropDownButton
                        label="File Type*"
                        listValues={listValues}
                        value={selectedFileType}
                        onChange={(value: any) => {
                          setSelectedFileType(value);
                          clearErrors("kind");
                          setValue("kind", value.name);
                        }}
                        error={errors.kind}
                        className="flex flex-start w-full justify-between"
                      />
                      <Text type="small" className="text-danger">
                        {errors.kind && (errors.kind.message as string)}
                      </Text>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>
                        <Text className="text-primary_text">Upload File*</Text>
                      </label>
                      <div className="relative w-full">
                        <input
                          type="text"
                          readOnly
                          value={
                            watchedFileList && watchedFileList.length > 0
                              ? watchedFileList[0].name.length > 45
                                ? watchedFileList[0].name.substring(0, 45) + "..."
                                : watchedFileList[0].name
                              : defaultValues?.filename?.length > 45
                                ? defaultValues.filename.substring(0, 45) + "..."
                                : defaultValues?.filename || ""
                          }
                          placeholder="Choose file"
                          className={`border rounded-md w-full border-grey h-12 flex-grow focus:outline-none p-4`}
                        />
                        <input
                          type="file"
                          className="hidden"
                          {...register("file", {
                            required: "File is required",
                            onChange: () => clearErrors("file"),
                          })}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.querySelector(
                              'input[type="file"]'
                            ) as HTMLInputElement;
                            input?.click();
                          }}
                          className="absolute h-10 right-2 top-1/2 transform -translate-y-1/2 border cursor-pointer bg-inherit text-primary_text rounded-md px-4 py-1"
                        >
                          <Text type="small">
                            {watchedFileList && watchedFileList.length > 0
                              ? "Change File"
                              : "Choose File"}
                          </Text>
                        </button>
                      </div>
                      <Text type="small" className="text-danger">
                        {errors.file && (errors.file.message as string)}
                      </Text>
                    </div>
                  </div>

                  <div className="mt-10 flex justify-end gap-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none"
                      onClick={closeModal}
                    >
                      <Text type="small">Cancel</Text>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center items-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-white focus:outline-none"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div>Saving...</div>
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
  );
}

export default AddDocumentsModal;
