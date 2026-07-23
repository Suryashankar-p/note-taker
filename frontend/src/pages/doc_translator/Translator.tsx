import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../redux/store.ts";
import Button from "../../components/Button.tsx";
import SearchDropdown from "../../components/Combobox.tsx";
import Text from "../../components/Text.tsx";
import Toast from "../../components/Toast.tsx";
import Translation from "../../assets/translator.svg";
import { GetTranslatorFile, GetTranslatorResponse, TranslateDocument } from "../../services/doc_translator.ts";
import { Languages } from "../../utils/constants.ts";
import { getFileType } from "../../utils/functions.ts";

const PREVIEWABLE_TYPES = ["PDF", "JPG", "JPEG", "PNG"];

const Translator = () => {
  const [selectedInputLanguage, setSelectedInputLanguage] = useState<
    any | null
  >({
    name: "English",
    value: "en",
  });
  const [selectedOutputLanguage, setSelectedOutputLanguage] = useState<
    any | null
  >();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean | null>(false);
  const [downloading, setDownloading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [outputPreviewUrl, setOutputPreviewUrl] = useState<string | null>(null);
  const outputBlobRef = useRef<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();
  const dispatch = useDispatch<Dispatch>();
  const toast = useSelector((state: RootState) => state.toast);
  const mutation = useMutation({
    mutationKey: ["document_translation"],
    mutationFn: () => TranslateDocument(selectedOutputLanguage?.value, file, selectedInputLanguage?.value),
    onSuccess: () => setLoading(true)
  });

  const { data: translatorData, isLoading, isError, error } = useQuery({
    queryKey: ["document_translation_status"],
    queryFn: () => GetTranslatorResponse(mutation.data.task_id),
    enabled: loading,
    refetchInterval: loading ? 10000 : false,
  })

  const isPreviewable = PREVIEWABLE_TYPES.includes(getFileType(selectedFileName));
    useEffect(() => {
      if (translatorData?.status === "succeeded") {
        setLoading(false);
        const taskId = mutation.data?.task_id;
        if (taskId && PREVIEWABLE_TYPES.includes(getFileType(selectedFileName))) {
          GetTranslatorFile(taskId, "output").then((blob: Blob) => {
            outputBlobRef.current = blob;
            setOutputPreviewUrl(URL.createObjectURL(blob));
          });
        }
      } else if (translatorData?.status === "failed") {
        setLoading(false);
        dispatch.toast.openToast({
          message:
            translatorData?.result?.error?.error_message ||
            "Translation failed. Please try again.",
          status: true,
          type: "error",
        });
      }
    }, [translatorData]);

    // Revoke object URLs on unmount / when a new preview replaces them, to avoid leaking memory.
    useEffect(() => {
      return () => {
        if (outputPreviewUrl) URL.revokeObjectURL(outputPreviewUrl);
      };
    }, [outputPreviewUrl]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileUrl(null);
      setSelectedFileName(file.name);
      if(getFileType(file.name) === 'PDF'){
        const fileURL = URL.createObjectURL(file);
        setFileUrl(fileURL);
      }
      else {        
        setFileUrl(null);
      }
      setFile(file);
    }
  };

  

  const handleTranslation = () => {
    if (selectedInputLanguage && selectedOutputLanguage && file) {
      mutation.mutate();
    }

  };
  const handleChooseFileClick = (type: string) => {
    if (type === 'Clear') {
      setFile(undefined);
      mutation.reset();
      queryClient.clear()
      setSelectedFileName('');
      setFileUrl('');
      setOutputPreviewUrl(null);
      outputBlobRef.current = null;
      selectedOutputLanguage({})
    }
    else if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

const handleDownload = async () => {
  const taskId = mutation.data?.task_id;
  if (!taskId || translatorData?.status !== "succeeded") return;

  setDownloading(true);   // start loading
  try {
    const blob = outputBlobRef.current || (await GetTranslatorFile(taskId, "output"));
    outputBlobRef.current = blob;

    const parts = selectedFileName.split(".");
    const extension = parts.pop();
    const baseName = parts.join(".");
    const languageName = selectedOutputLanguage?.name.replace(/\s+/g, "-");

    const newFileName = `${baseName}-${languageName}.${extension}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = newFileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } finally {
    setDownloading(false);  // stop loading
  }
};

  return (
    <>
      {toast?.status && toast?.type === "error" && (
        <div className="fixed top-[4rem] sm:top-[5rem] md:top-[6rem] left-1/2 transform -translate-x-1/2 z-50 space-y-4">
          <Toast type="error" />
        </div>
      )}
    <div className="flex flex-col gap-8 px-2 pt-8 h-screen">
      {/* Top controls: Buttons and Dropdowns arranged in a row */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row w-60 items-center gap-2">
          <div className="relative w-full">
            <input
              type="text"
              title={selectedFileName}
              value={selectedFileName}
              className={`border text-[14px] rounded-md w-full border-grey h-10 flex-grow focus:outline-none p-4 pr-[6.6rem] ellipse overflow-hidden whitespace-nowrap text-ellipsis`}
              placeholder="Upload File"
            />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.ppsx,.xls,.xlsx,.csv"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => handleChooseFileClick(file ? "Clear" : "Choose File")}
              className="absolute h-8 right-2 top-1/2 transform -translate-y-1/2 border cursor-pointer bg-inherit text-primary_text rounded-md px-4 py-1"
            >
              <Text type="small">{file ? "Clear File" : "Choose File"}</Text>
            </button>
          </div>
          <Text type="small" className="text-danger"></Text>
        </div>

        <div className="flex flex-row items-center gap-1">
          {/* Reduced gap here */}
          <label>
            <Text type="small">Input Language:</Text>
          </label>
          <SearchDropdown
            onChange={(value: any) => setSelectedInputLanguage(value)}
            listValues={[
             {
              name: "English",
              value: "en",
            },
            {
              name: "Marathi",
              value: "mr",
            },
            {
              name: "Hindi",
              value: "hi",
            },
            {
              name: "Gujarati",
              value: "gu",
            },
            {
              name: "German",
              value: "de",
            }
            ]}
            initialValue={selectedInputLanguage}
            placeholder="Input Language"
            className="w-44"
          />
        </div>

        <div className="flex flex-row items-center gap-1">
          {/* Reduced gap here */}
          <label>
            <Text type="small">Output Language:</Text>
          </label>
          <SearchDropdown
            onChange={(value: any) => setSelectedOutputLanguage(value)}
            listValues={Languages}
            initialValue={selectedOutputLanguage}
            placeholder="Output Language"
            className="w-44"
          />
        </div>

        <div className="relative flex items-center gap-2">
          <Button
            type="button"
            className={`p-2 flex flex-row space-x-2 items-center ${
              !file || !selectedInputLanguage || !selectedOutputLanguage
                ? "bg-black bg-opacity-30"
                : ""
            }`}
            onClick={handleTranslation}
            disabled={
              !file || !selectedInputLanguage || !selectedOutputLanguage
            }
          >
            {loading ? (
              <div className="flex items-center">
                <Text type="small" className="mr-2">
                  Translating...
                </Text>
                <svg
                  className="animate-spin h-6 w-6 text-white"
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
              <>
                <Text type="small">Translate</Text>
                <img src={Translation} alt="Translate" />
              </>
            )}
          </Button>
        </div>

        <Button disabled={translatorData?.status !== "succeeded"} className={`p-2.5 ${translatorData?.status !== "succeeded" && 'bg-opacity-30'}`} onClick={handleDownload}>
          <Text type="small">{downloading ? "Downloading..." : "Download"}</Text>
        </Button>
      </div>

      {/* Bottom panes: Side by side with individual scroll */}
      <div className="flex flex-row gap-4 h-full">
        <div className="flex-[1] h-full border-2 border-gray-300 rounded-md overflow-auto">
          {file && isPreviewable ? (
            <iframe className="w-full h-full" title="Viewer 1" src={fileUrl || ''} />
          ) : file ? (
            <div className="flex items-center justify-center h-full p-4 text-center">
              <Text type="small">Preview not available for this file type.</Text>
            </div>
          ) : null}
        </div>
        <div className="flex-[1] h-full border-2 border-gray-300 rounded-md overflow-auto">
          {translatorData?.status === "succeeded" && isPreviewable ? (
            <iframe className="w-full h-full" title="Viewer 2" src={outputPreviewUrl || ''} />
          ) : translatorData?.status === "succeeded" ? (
            <div className="flex items-center justify-center h-full p-4 text-center">
              <Text type="small">Translation ready! Use the Download button above to get your file.</Text>
            </div>
          ) : null}
        </div>
      </div>
    </div>
    </>
  );
};

export default Translator;
