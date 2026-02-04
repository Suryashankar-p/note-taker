import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import Close from "../../assets/close.svg";
import Text from "../Text";
import Button from "../Button";
import DropDownButton from "../DropDownButton";
import { capitalizeWords } from "../../utils/functions.ts";

interface CreateMasterActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, masterType: string, template: string, file: File) => Promise<void>; // ✅ All 4 params
  defaultValues?: any;
  onUpdate?: (title: string) => Promise<void>;
}

const CreateMasterActivity: React.FC<CreateMasterActivityModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  defaultValues,
  onUpdate,
}) => {
  const [title, setTitle] = useState<string>("");
  const [masterType, setMasterType] = useState<string>("Transmitter");
  const [template, setTemplate] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [templateError, setTemplateError] = useState<string>("");
  const [fileError, setFileError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Template options for dropdown - dynamically based on masterType
  const getTemplateOptions = () => {
    if (masterType === "Transmitter") {
      return [
        { name: "Select Master Template", value: "" },
        { name: "Emerson", value: "emerson" },
        { name: "Honeywell", value: "honeywell" },
        { name: "Yokogawa", value: "yokogawa" }
      ];
    } else if (masterType === "Gauge") {
      return [
        { name: "Select Master Template", value: "" },
        { name: "Gauges Bourdon", value: "gauges_bourdon" }
      ];
    }
    return [{ name: "Select Master Template", value: "" }];
  };

  const templateOptions = getTemplateOptions();

  useEffect(() => {
    if (isOpen) {
      if (defaultValues) {
        setTitle(defaultValues.title || "");
        setMasterType(defaultValues.masterType || "Transmitter");
        setTemplate(defaultValues.template || "");
        setFile(defaultValues.file || null);
        setFileName(defaultValues.filename || "");
      } else {
        // Reset form when opening in create mode
        setTitle("");
        setMasterType("Transmitter");
        setTemplate("");
        setFile(null);
        setFileName("");
        setTitleError("");
        setTemplateError("");
        setFileError("");
      }
    }
  }, [isOpen, defaultValues]);

  // Reset template when masterType changes
  useEffect(() => {
    // Only reset template if it's not valid for the current masterType
    const currentOptions = getTemplateOptions();
    const isTemplateValid = currentOptions.some(opt => opt.value === template);
    if (!isTemplateValid && template !== "") {
      setTemplate("");
    }
  }, [masterType]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
      setFileError("");
    }
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let updatedTitle = capitalizeWords(e.target.value);
    setTitle(updatedTitle);
    if (updatedTitle !== "") {
      setTitleError("");
    }
  };

  const handleMasterTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMasterType(e.target.value);
  };

  const handleTemplateChange = (selectedTemplate: any) => {
    setTemplate(selectedTemplate?.value || "");
    if (selectedTemplate?.value !== "") {
      setTemplateError("");
    }
  };

  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCreate = async () => {
    let hasError = false;
    
    // Validation
    if (!title.trim()) {
      setTitleError("Title is required");
      hasError = true;
    } else {
      setTitleError("");
    }

    if (!template || template === "") {
      setTemplateError("Master Type is required");
      hasError = true;
    } else {
      setTemplateError("");
    }

    if (!file && !defaultValues) {
      setFileError("File is required");
      hasError = true;
    } else {
      setFileError("");
    }

    if (hasError) {
      return;
    }

    setLoading(true);

    try {
      if (!defaultValues) {
        // ✅ Create mode - pass all 4 parameters
        await onCreate(title, masterType, template, file as File);
        
        // Reset form after successful creation
        setTitle("");
        setMasterType("Transmitter");
        setTemplate("");
        setFile(null);
        setFileName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        // Update mode
        if (onUpdate) {
          await onUpdate(title);
        }
        
        // Reset form after successful update
        setTitle("");
        setMasterType("Transmitter");
        setTemplate("");
        setFile(null);
        setFileName("");
      }
    } catch (error) {
      console.error("Error in handleCreate:", error);
      // Error is handled in parent component
    } finally {
      setLoading(false);
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <Text className="text-[24px] text-black font-medium leading-6">
            {defaultValues ? "Edit Master Activity" : "Create Master Activity"}
          </Text>
          <button 
            className="absolute top-4 right-4 z-50" 
            onClick={onClose}
            disabled={loading}
          >
            <img src={Close} alt="close" loading="lazy" />
          </button>
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <Text className="text-primary_text">Title*</Text>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            disabled={loading}
            className="border rounded-md w-full border-grey h-12 focus:outline-none p-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter title"
          />
          {titleError && <Text className="text-red-500 text-sm mt-1">{titleError}</Text>}
        </div>

        {/* Radio Buttons - Only show in create mode */}
        {!defaultValues && (
          <div className="mb-4 flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="masterType"
                value="Transmitter"
                checked={masterType === "Transmitter"}
                onChange={handleMasterTypeChange}
                disabled={loading}
                className="w-4 h-4 text-blue-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <Text className="ml-2 text-primary_text">Transmitter</Text>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="masterType"
                value="Gauge"
                checked={masterType === "Gauge"}
                onChange={handleMasterTypeChange}
                disabled={loading}
                className="w-4 h-4 text-blue-600 cursor-pointer disabled:cursor-not-allowed"
              />
              <Text className="ml-2 text-primary_text">Gauge</Text>
            </label>
          </div>
        )}

        {/* Master Type Dropdown - Only show in create mode */}
        {!defaultValues && (
          <div className="mb-4">
            <DropDownButton
              label="Master Type*"
              listValues={templateOptions}
              value={templateOptions.find(opt => opt.value === template) || templateOptions[0]}
              onChange={handleTemplateChange}
              error={templateError ? { message: templateError } as any : undefined}
              disabled={loading}
            />
          </div>
        )}

        {/* File Upload - Only show in create mode */}
        {!defaultValues && (
          <div className="mb-4">
            <Text className="text-primary_text">File upload*</Text>
            <div className="relative w-full">
              <input
                type="text"
                value={fileName}
                readOnly
                disabled={loading}
                className="border rounded-md w-full border-grey h-12 focus:outline-none p-4 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Upload File"
              />
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={loading}
                accept=".pdf,.doc,.docx,.xls,.xlsx"
              />
              <button
                type="button"
                className="absolute h-10 right-2 top-1/2 transform -translate-y-1/2 border bg-inherit text-primary_text rounded-md px-4 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleChooseFileClick}
                disabled={loading}
              >
                <Text type="small">Choose File</Text>
              </button>
            </div>
            {fileError && <Text className="text-red-500 text-sm mt-1">{fileError}</Text>}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-grey bg-white text-primary_text px-4 py-2 text-sm font-medium focus:outline-none hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Text type="small">Cancel</Text>
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="mr-2">{defaultValues ? "Updating..." : "Saving..."}</div>
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
              <span>{defaultValues ? "Update" : "Save"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateMasterActivity;