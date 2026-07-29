import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import {
  UploadNDADeviationMatrix,
  UploadNDATemplate,
} from "../../services/legal_checker.ts";

interface UploadCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onUpload: (file: File) => Promise<{ message: string }>;
}

const UploadCard: React.FC<UploadCardProps> = ({
  title,
  description,
  buttonLabel,
  onUpload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: () => onUpload(file as File),
  });

  const handleUpload = () => {
    if (!file) return;
    mutation.mutate();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Text type="small" className="font-semibold text-gray-700 mb-1">
        {title}
      </Text>
      <Text type="small" className="text-gray-400 mb-4">
        {description}
      </Text>
      <input
        type="file"
        ref={fileInputRef}
        accept=".docx"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-xs text-gray-600 mb-3"
      />
      <Button
        className="w-full justify-center py-2"
        onClick={handleUpload}
        disabled={mutation.isPending}
      >
        <Text type="small">
          {mutation.isPending ? "Uploading..." : buttonLabel}
        </Text>
      </Button>
      {mutation.isSuccess && (
        <Text type="small" className="text-green-700 mt-2">
          {mutation.data?.message}
        </Text>
      )}
      {mutation.isError && (
        <Text type="small" className="text-red-600 mt-2">
          {(mutation.error as any)?.response?.data?.detail ||
            "Upload failed."}
        </Text>
      )}
    </div>
  );
};

const Admin: React.FC = () => {
  return (
    <div className="px-2 pt-8 overflow-y-auto">
      <div className="mb-6">
        <Text type="subtitle">NDA Templates &amp; Deviation Matrix</Text>
        <Text type="small" className="text-gray-500 mt-1">
          Upload updated files here. Changes take effect immediately for all
          future reviews.
        </Text>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadCard
          title="Standard NDA — Unilateral"
          description="Replaces standard_unilateral.docx"
          buttonLabel="Upload Template"
          onUpload={(file) => UploadNDATemplate("unilateral", file)}
        />
        <UploadCard
          title="Standard NDA — Mutual"
          description="Replaces standard_mutual.docx"
          buttonLabel="Upload Template"
          onUpload={(file) => UploadNDATemplate("mutual", file)}
        />
        <UploadCard
          title="Deviation Matrix"
          description="Upload the Word matrix file — auto-converted internally"
          buttonLabel="Upload Matrix"
          onUpload={UploadNDADeviationMatrix}
        />
      </div>
    </div>
  );
};

export default Admin;
