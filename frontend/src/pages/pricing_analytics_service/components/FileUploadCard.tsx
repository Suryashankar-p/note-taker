import React, { useRef, type ReactNode } from "react";
import { Upload, CheckCircle } from "lucide-react";

type FileUploadCardProps = {
  title: string;
  description: string;
  status: "loaded" | "upload";
  icon: ReactNode;
  onUpload?: (file: File) => void;
  fileName?:string;
};

const FileUploadCard = ({
  title,
  description,
  status,
  icon,
  onUpload,
  fileName
}: FileUploadCardProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload?.(file);
    }
  };
  return (
    <div className="flex items-center justify-between rounded-xl border bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
          {icon}
        </div>

        <div className="max-w-[220px]">
          <h3 className="font-semibold text-sm text-gray-900">{title}</h3>
          <div>
            <p className="text-xs text-gray-500 break-words line-clamp-2">
              {description}
            </p>
          </div>
          {fileName && (
            <p className="mt-1 text-xs text-blue-600">📄 {fileName}</p>
          )}
        </div>
      </div>

      {status === "loaded" ? (
        <div className="flex items-center gap-2 rounded-full border border-green-300 bg-green-50 px-3 py-1.5 text-xs text-green-700">
          <CheckCircle size={15} />
          LOADED
        </div>
      ) : (
        <>
          <input
            hidden
            ref={fileInputRef}
            type="file"
            onChange={onSelectFile}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="
            flex items-center gap-2
            rounded-lg 
            bg-red-700 
            px-4 
            py-2 
            text-xs 
            font-medium 
            text-white
            hover:bg-red-800
          "
          >
            <Upload size={15} />
            Upload File
          </button>
        </>
      )}
    </div>
  );
};

export default FileUploadCard;
