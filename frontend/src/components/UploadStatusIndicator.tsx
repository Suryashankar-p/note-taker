import React, { useEffect, useState } from "react";
import "./UploadStatusIndicator.css";

interface UploadStatus {
  status: string;
  progress?: any;
}

interface Props {
  uploadStatus?: UploadStatus;
}

const UploadStatusIndicator: React.FC<Props> = ({ uploadStatus }) => {
  
  const [visible, setVisible] = useState(true);
  const isComplete = uploadStatus?.status === "completed";
  const isLoading = uploadStatus?.status === "uploading" || uploadStatus?.status === "inprogress";
  const isCancelled = uploadStatus?.status === "Upload cancelled" || uploadStatus?.status === "failed";
  const isIdle = uploadStatus?.status === "idle" || uploadStatus?.status === "pending";
  const progress = uploadStatus?.progress || 0;

  useEffect(() => {
    if (isComplete || isCancelled) {
      const timer = setTimeout(() => setVisible(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setVisible(true);
    }
  }, [uploadStatus]);

  if (!uploadStatus?.status || !visible || isIdle) return null;

  return (
    <div className="inline-flex items-center gap-2">
      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin text-blue-400"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      )}
      <span
        className={`${
          isLoading
            ? "text-shimmer"
            : isCancelled
            ? "text-red-400"
            : "text-green-600"
        } text-sm`}
      >
        {uploadStatus.status &&
          uploadStatus.status.charAt(0).toUpperCase() +
            uploadStatus.status.slice(1)}
        {progress !== undefined && (
          <span className="ml-2 text-gray-600 font-medium">
            {isLoading && <span>({progress?.percent ?? 0}%)</span>}{" "}
          </span>
        )}
      </span>
    </div>
  );
};

export default UploadStatusIndicator;
