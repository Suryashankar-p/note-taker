import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  uploadDocumentAnalyserFile,
  DocumentAnalyserFileStatusCheck,
} from "../thermax_gpt";

export const useDocumentUploadWithStatus = () => {
  const [fileId, setFileId] = useState<string | undefined>(undefined);
  const [isDone, setIsDone] = useState(false);

  // 1. Mutation: Upload file
  const uploadMutation = useMutation({
    mutationFn: uploadDocumentAnalyserFile,
    onSuccess: (data) => {
      setFileId(data?.document_id);
      setIsDone(false);
    },
  });

  // 2. Query: Poll upload status
  const statusQuery = useQuery({
    queryKey: ["upload-status", fileId],
    queryFn: () => DocumentAnalyserFileStatusCheck(fileId!),
    enabled: !!fileId && !isDone,
    refetchInterval: 5000,
  });

  // 3. Auto-stop polling when processing is complete
  useEffect(() => {
    if (statusQuery.data?.status === "completed") {
      setIsDone(true);
    }
  }, [statusQuery.data]);

  return {
    upload: uploadMutation.mutateAsync,
    uploadState: uploadMutation,
    fileId,
    status: statusQuery.data,
    statusState: statusQuery,
    isDone,
  };
};
