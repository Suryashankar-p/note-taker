import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import Close from "../../assets/close.svg";
import Text from "../Text";
import Button from "../Button";
import { capitalizeWords } from "../../utils/functions.ts";

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, file: File) => void;
  defaultValues?: any;
  onUpdate?: (title: string) => void;
}

const CreateActivity: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultValues,
  onUpdate,
}) => {
  const [title, setTitle] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (defaultValues) {
      setTitle(defaultValues.title);
      setFile(defaultValues.file);
      setFileName(defaultValues.filename ?? "");
    }
    return () => {
      setTitle("");
      setFile(null);
      setFileName("");
      setTitleError("");
      setFileError("");
      setLoading(false)
    };
  }, [isOpen, defaultValues]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setFileError(""); // Clear file error when a file is selected
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let updatedTitle = capitalizeWords(e.target.value);
    setTitle(updatedTitle);
    if (updatedTitle !== "") {
      setTitleError(""); // Clear title error when user starts typing
    }
  };

  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCreate = () => {
    let hasError = false;
    setLoading(true);
    if (!title) {
      setTitleError("Title is required");
      hasError = true;
    } else {
      setTitleError("");
    }

    if (!file && !defaultValues) {
      setFileError("File is required");
      hasError = true;
    } else {
      setFileError("");
    }

    if (!hasError && !defaultValues) {
      onCreate(title, file as File);
      // onClose()
    } else if (!hasError && defaultValues) {
      onUpdate(title);
      setTitle("");
      setFile(null);
      setFileName("");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-[#0061F3] bg-opacity-20 z-10"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl h-auto relative"
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-4">
          <Text className="text-[24px] text-black font-medium leading-6">
            Create Activity
          </Text>
          <button className="absolute top-4 right-4 z-50" onClick={onClose}>
            <img src={Close} alt="close" loading="lazy" />
          </button>
        </div>
        <div className="mb-4">
          <Text className="text-primary_text">Title*</Text>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="border rounded-md w-full border-grey h-12 focus:outline-none p-4"
          />
          {titleError && <Text className="text-red-500">{titleError}</Text>}
        </div>
        <div className="mb-4">
          <Text className="text-primary_text">File upload*</Text>
          <div className="relative w-full">
            <input
              type="text"
              value={fileName}
              readOnly
              disabled={defaultValues?.filename}
              className="border rounded-md w-full border-grey h-12 focus:outline-none p-4"
              placeholder="Upload File"
            />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              disabled={defaultValues?.filename}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="absolute h-10 right-2 top-1/2 transform -translate-y-1/2 border  bg-inherit text-primary_text rounded-md px-4 py-1"
              onClick={handleChooseFileClick}
              disabled={defaultValues?.filename}
            >
              <Text type="small">Choose File</Text>
            </button>
          </div>
          {fileError && <Text className="text-red-500">{fileError}</Text>}
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <Text type="small">Cancel</Text>
          </button>
          <button
            onClick={handleCreate}
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
                <span>{defaultValues ? 'Update' : 'Save' }</span>
            )}{" "}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateActivity;
