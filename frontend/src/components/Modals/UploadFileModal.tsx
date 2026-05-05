import React, { useState } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import Close from "../../assets/close.svg";

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (files: File[]) => void;
  aiProvider: string;
  disabled?: boolean;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({
  isOpen,
  onClose,
  onFileUpload,
  aiProvider,
  disabled = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const allowedExtensions = ['.pdf', '.txt','.png', '.json', '.html', '.htm', '.docx', '.doc', '.ppt', '.pptx', '.xlsx', '.xls', '.csv'];
      const invalidFiles = selectedFiles.filter(file => 
        !allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
      );
      
      if (invalidFiles.length > 0) {
        setError(`Only .pdf, .txt, '.png',.json, .html, .htm, .docx, .doc, .ppt, .pptx, .xlsx, .xls, .csv files are allowed. ${invalidFiles.length} invalid file(s) selected.`);
        setFiles([]);
      } else {
        setError("");
        setFiles(selectedFiles);
      }
    }
  };

  const handleClose = () => {
    setFiles([]);
    setError("");
    onClose();
  };

  const handleUpload = () => {
    if (files.length > 0) {
      onFileUpload(files);
      setFiles([]);
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Close Button */}

        {/* Modal Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Upload Document
          </h2>
          <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
            onClick={onClose}
          >
            <img src={Close} alt="Close" loading="lazy" className="w-15 h-15" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Custom File Upload Box */}
        <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-red-400 rounded-xl p-6 text-center bg-red-50 hover:bg-red-100 transition-colors duration-200 cursor-pointer">
          <FaCloudUploadAlt className="w-10 h-10 text-red-600 mb-2" />
          {files.length > 0 ? (
            <div className="flex flex-col items-center">
              <span className="text-green-600 font-medium">
                {files.length} {files.length === 1 ? "file" : "files"} selected
              </span>
              <div className="text-xs text-gray-500 mt-1 max-w-md truncate">
                {files.map((f) => f.name).join(", ")}
              </div>
            </div>
          ) : (
            <span className="text-red-700 font-medium hover:underline">
              Click to select files
            </span>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Supported formats: .pdf, .png, .txt, .json, .html, .htm, .docx, .doc, .ppt, .pptx, .xlsx, .xls, .csv. File size max 100MB.
          </p>
          <input
            type="file"
            accept=".pdf,.txt, .png,.json,.html,.htm,.docx,.doc,.ppt,.pptx,.xlsx,.xls,.csv"
            onChange={handleFileChange}
            disabled={disabled}
            multiple
            className="hidden"
          />
        </label>

        {/* Static Note */}
        <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg">
          <strong>Note:</strong> Please upload a document that you want answers
          from. This document will be used as a temporary knowledge base and
          will be automatically deleted after{" "}
          <strong>48 hours</strong>
          . If you need to access it again later, you will need to reupload the
          file.
        </p>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || disabled}
            className={`px-4 py-2 rounded-lg text-white font-medium transition ${
              files.length === 0 || disabled
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
