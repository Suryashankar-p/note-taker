import React, { useState, useRef } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Close from "../../assets/close.svg";
import Text from "../Text";
import { useSelector, useDispatch } from "react-redux";
import { Dispatch, RootState } from "../../redux/store";
import { useForm } from "react-hook-form";
import Toast from "../Toast";

interface IFormInput {
  fileName: string;
  file: any;
  files: File[];
  productId: string;
}

interface ProductOption {
  id: number;
  product_title: string;
}

interface Props {
  defaultValues: any;
  onSubmit: any;
  // Present only for KB upload, where a product must be chosen. Other callers
  // (e.g. product-document upload) omit it and keep the plain file picker.
  products?: ProductOption[];
  // Allow selecting more than one file (KB upload only). Other callers keep
  // the single-file picker and read `data.file` as before.
  multiple?: boolean;
  // Restrict the native file picker (e.g. ".pdf,.docx"). Backend still
  // enforces the real allow-list regardless of this.
  accept?: string;
}

const FileEditModal: React.FC<Props> = ({ defaultValues, onSubmit, products, multiple, accept }) => {
  const isOpen = useSelector((state: RootState) => state.modal.isOpen);
  const dispatch = useDispatch<Dispatch>();
  const [fileName, setFileName] = useState<string>("");
  const [productId, setProductId] = useState<string>("");
  // Product selection is required only when a product list was supplied.
  const requireProduct = Array.isArray(products);
  const initialFocusRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toastStatus = useSelector((state: RootState) => state.toast);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
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
    if (!event.target.files || event.target.files.length === 0) return;

    if (multiple) {
      const selectedFiles = Array.from(event.target.files);
      const label =
        selectedFiles.length === 1
          ? selectedFiles[0].name
          : `${selectedFiles.length} files selected`;
      const truncatedFileName =
        label.length > 20 ? `${label.substring(0, 20)}...` : label;
      setFileName(truncatedFileName);
      setFiles(selectedFiles);
      clearErrors("fileName");
      setValue("fileName", truncatedFileName);
      return;
    }

    const file = event.target.files[0];
    const truncatedFileName =
      file.name.length > 20
        ? `${file.name.substring(0, 20)}...`
        : file.name;
    setFileName(truncatedFileName);
    setFile(file);
    clearErrors("fileName");
    setValue("fileName", truncatedFileName);
  };
  
  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProductChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setProductId(event.target.value);
    setValue("productId", event.target.value);
    clearErrors("productId");
  };

  const onHandle = (data: IFormInput) => {
    if (multiple) {
      data.files = files;
    } else if (file) {
      data.file = file;
    }
    if (requireProduct) {
      data.productId = productId;
    }
    onSubmit(data);
  };

  return (
    <>
      {isOpen?.status && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 relative">
            {/* Modal Header */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Add file
              </h2>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
                onClick={closeModal}
              >
                <img src={Close} alt="Close" loading="lazy" className="w-15 h-15" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onHandle)}>
              {toastStatus.status && (
                <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 space-y-4">
                  <Toast type="error" />
                </div>
              )}

              {/* Product selection (mandatory, KB upload only) */}
              {requireProduct && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product <span className="text-danger">*</span>
                  </label>
                  <select
                    value={productId}
                    onChange={handleProductChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select a product
                    </option>
                    {products!.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="hidden"
                    {...register("productId", {
                      required: "Please select a product",
                    })}
                  />
                  {errors?.productId && (
                    <Text type="small" className="text-danger">
                      {errors?.productId?.message}
                    </Text>
                  )}
                </div>
              )}

              {/* Custom File Upload Box */}
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-red-400 rounded-xl p-6 text-center bg-red-50 hover:bg-red-100 transition-colors duration-200 cursor-pointer">
                <FaCloudUploadAlt className="w-10 h-10 text-red-600 mb-2" />
                {(multiple ? files.length > 0 : file) ? (
                  <span className="text-green-600">{fileName}</span>
                ) : (
                  <span className="text-red-700 font-medium hover:underline">
                    {multiple ? "Click to select files" : "Click to select a file"}
                  </span>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  File size max 10MB.
                </p>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple={multiple}
                  accept={accept}
                />
              </label>

              {/* Hidden input for form validation */}
              <input
                type="hidden"
                {...register("fileName", {
                  required: "Field is required",
                })}
              />

              {errors?.fileName && (
                <Text type="small" className="text-danger">
                  {errors?.fileName?.message}
                </Text>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (requireProduct && !productId)}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    loading || (requireProduct && !productId)
                      ? "bg-blue-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
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
          </div>
        </div>
      )}
    </>
  );
};

export default FileEditModal;
