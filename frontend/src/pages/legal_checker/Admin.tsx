import React, { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../redux/store.ts";
import Button from "../../components/Button.tsx";
import Text from "../../components/Text.tsx";
import ConfirmationModal from "../../components/Modals/ConfirmationModal.tsx";
import {
  GetNDAAdminStatus,
  UploadNDADeviationMatrix,
  UploadNDATemplate,
} from "../../services/legal_checker.ts";

type FileStatus = {
  loaded: boolean;
  last_modified?: string;
  size_bytes?: number;
  clause_count?: number;
};

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

interface UploadCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  status?: FileStatus;
  onUpload: (file: File) => Promise<{ message: string }>;
  onUploaded: () => void;
  requestConfirmation: (content: string, onConfirm: () => void) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({
  title,
  description,
  buttonLabel,
  status,
  onUpload,
  onUploaded,
  requestConfirmation,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mutation = useMutation({
    mutationFn: () => onUpload(file as File),
    onSuccess: () => {
      onUploaded();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const handleUpload = () => {
    if (!file) return;
    if (status?.loaded) {
      requestConfirmation(
        `This will permanently replace the existing file${
          status.last_modified
            ? ` (last updated ${formatDate(status.last_modified)})`
            : ""
        }. This cannot be undone. Continue?`,
        () => mutation.mutate()
      );
    } else {
      mutation.mutate();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <Text type="small" className="font-semibold text-gray-700 mb-1">
        {title}
      </Text>
      <Text type="small" className="text-gray-400 mb-2">
        {description}
      </Text>
      <div className="mb-4">
        {status?.loaded ? (
          <Text type="small" className="text-green-700">
            ✓ Loaded
            {status.last_modified
              ? ` — updated ${formatDate(status.last_modified)}`
              : ""}
            {typeof status.clause_count === "number"
              ? ` (${status.clause_count} clauses)`
              : ""}
          </Text>
        ) : (
          <Text type="small" className="text-yellow-700">
            ⚠ Not yet loaded
          </Text>
        )}
      </div>
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
  const queryClient = useQueryClient();
  const dispatch = useDispatch<Dispatch>();
  const [confirmState, setConfirmState] = useState<{
    content: string;
    onConfirm: () => void;
  } | null>(null);

  const { data: status } = useQuery({
    queryKey: ["legal_checker_nda_admin_status"],
    queryFn: GetNDAAdminStatus,
  });

  const refreshStatus = () =>
    queryClient.invalidateQueries({
      queryKey: ["legal_checker_nda_admin_status"],
    });

  const requestConfirmation = (content: string, onConfirm: () => void) => {
    setConfirmState({ content, onConfirm });
    dispatch.modal.openConfirmation();
  };

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
          status={status?.unilateral_template}
          onUpload={(file) => UploadNDATemplate("unilateral", file)}
          onUploaded={refreshStatus}
          requestConfirmation={requestConfirmation}
        />
        <UploadCard
          title="Standard NDA — Mutual"
          description="Replaces standard_mutual.docx"
          buttonLabel="Upload Template"
          status={status?.mutual_template}
          onUpload={(file) => UploadNDATemplate("mutual", file)}
          onUploaded={refreshStatus}
          requestConfirmation={requestConfirmation}
        />
        <UploadCard
          title="Deviation Matrix"
          description="Upload the Word matrix file — auto-converted internally"
          buttonLabel="Upload Matrix"
          status={status?.deviation_matrix}
          onUpload={UploadNDADeviationMatrix}
          onUploaded={refreshStatus}
          requestConfirmation={requestConfirmation}
        />
      </div>
      {confirmState && (
        <ConfirmationModal
          title="Confirm Overwrite"
          content={confirmState.content}
          onSubmit={() => confirmState.onConfirm()}
        />
      )}
    </div>
  );
};

export default Admin;