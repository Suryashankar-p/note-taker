import {
  Dialog,
  Transition,
  Textarea,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import DropDownButton from "../DropDownButton";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useForm } from "react-hook-form";
import Toast from "../Toast";
import TagInput from "../TagInput";

export type DefaultValue = {
  title: string;
  other_names?: string[];
  description: string;
  id: string;
};

export interface IFormInput {
  title: string;
  other_names?: string[];
  description: string;
}

type ModalType = "CATEGORY" | "SUBPACKAGE";

interface Props {
  defaultValue?: DefaultValue;
  onSubmit?: any;
  title?: string;
  modalType: ModalType;
}

const AddProductModal: React.FC<Props> = ({
  defaultValue,
  onSubmit,
  title,
  modalType,
}) => {
  const addProduct = useSelector(
    (state: RootState) => state.modal.addProduct.status
  );
  const type = useSelector((state: RootState) => state.modal.addProduct.type);
  const dispatch = useDispatch<Dispatch>();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
  } = useForm<IFormInput>();
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [tags, setTags] = useState<{ id: number | null; title: string }[]>([]);
  const loading = useSelector((state: RootState) => state.loadingState.status)
  
  const closeModal = () => {
    dispatch.modal.closeAddProduct();
  };

  const onProductSubmit = (data: IFormInput) => {
    const body = {
      title: data.title?.trim(),
      other_names: data.other_names || [],
      description: data.description?.trim(),
      id: defaultValue?.id,
    };
    onSubmit(body);
  };

  useEffect(() => {
    if (defaultValue) {
      setValue("title", defaultValue.title);
      setValue("other_names", defaultValue.other_names || []);
      setValue("description", defaultValue.description);
    }
  }, [defaultValue, setValue]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
      event.preventDefault(); // Prevent form submission on Enter key press
    }
  };

  const onTagChange = (data: { id: number | null; title: string }[]) => {
    if (data) {
      clearErrors("other_names");
      setTags(data);
      setValue(
        "other_names",
        data.map((tag) => tag.title) // ✅ extract only titles
      );
    }
  };

  return (
    <Transition appear show={addProduct} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                className="w-full max-w-3xl h-fit transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                style={{ transform: "translate(60px, -3px)" }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown} // Handle key events to prevent form submission
              >
                <DialogTitle
                  as="h3"
                  className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                >
                  <Text className="font-semibold text-xl">
                    {type === "add"
                      ? `Add ${
                          modalType === "SUBPACKAGE"
                            ? "Sub-package"
                            : "Category"
                        }`
                      : `Edit ${
                          modalType === "SUBPACKAGE"
                            ? "Sub-package"
                            : "Category"
                        }`}
                  </Text>

                  <button
                    className="absolute -right-2 -top-4"
                    onClick={closeModal}
                  >
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>
                <form onSubmit={handleSubmit(onProductSubmit)}>
                  {toastStatus.status && (
                    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                      <Toast type="error" />
                    </div>
                  )}
                  <Text type="small" className="italic text-gray-400 mt-1">
                    {title}
                  </Text>
                  <div className="flex flex-col mt-5 gap-2">
                    <label>
                      <Text className="text-primary_text">Full name*</Text>
                    </label>
                    <div className="flex flex-row space-x-2">
                      <input
                        type="text"
                        className={`w-full h-12 border rounded-md focus:outline-none p-4 ${
                          errors.title ? "border-red-500" : "border-gray-300"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Full name"
                        defaultValue={
                          type === "edit" ? defaultValue?.title : ""
                        }
                        {...register("title", {
                          required: "Field is required",
                        })}
                      />
                      {errors.title && (
                        <span className="text-red-500">
                          {errors.title.message}
                        </span>
                      )}
                      {/* <div className="w-1/2 flex-col space-y-2">
                        <label>
                          <Text className="text-primary_text">Short name*</Text>
                        </label> */}
                      {/* <input
                          type="text"
                          className={`w-full h-12 border rounded-md focus:outline-none p-4 ${
                            errors.short_title
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Short name"
                          defaultValue={
                            type === "edit" ? defaultValue?.short_title : ""
                          }
                          {...register("short_title", {
                            required: "Field is required",
                          })}
                        /> */}
                      {/* <input
                          type="text"
                          className="w-full h-12 border rounded-md focus:outline-none p-4 border-gray-300"
                          placeholder="Short name (optional)"
                          {...register("short_title")}
                        />
                        {errors.short_title && (
                          <span className="text-red-500">
                            {errors.short_title.message}
                          </span>
                        )}
                      </div> */}
                    </div>
                    <div className="w-full flex-col space-y-2">
                      <label>
                        <Text className="text-primary_text">
                          Aliases and abbrevaiations
                        </Text>
                      </label>
                      <TagInput
                        value={tags}
                        onChange={onTagChange}
                        error={errors.other_names?.message}
                        placeholder="Enter aliases and abbreviations"
                      />
                      {errors.other_names && (
                        <span className="text-red-500">
                          {errors.other_names?.message}
                        </span>
                      )}
                    </div>
                    <div className="w-full flex-col space-y-2 h-[15vh]">
                      <label>
                        <Text className="text-primary_text">Description*</Text>
                      </label>
                      <Textarea
                        className={`w-full h-full border rounded-md focus:outline-none p-4 ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Description"
                        defaultValue={
                          type === "edit" ? defaultValue?.description : ""
                        }
                        {...register("description", {
                          required: "Field is required",
                        })}
                      />
                      {errors.description && (
                        <span className="text-red-500">
                          {errors.description.message}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-12 flex justify-end gap-4">
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
  );
};

export default AddProductModal;