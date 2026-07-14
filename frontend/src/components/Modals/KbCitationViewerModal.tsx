import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { renderAsync } from "docx-preview";
import Text from "../Text";
import Close from "../../assets/close.svg";
import { PdfViewer } from "../PdfViewer";
import { ReadKbDocumentLink } from "../../services/troubleshooting";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
  filename: string;
  page: number;
}

const KbCitationViewerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentId,
  filename,
  page,
}) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const docxContainerRef = useRef<HTMLDivElement>(null);
  const isDocx = filename?.toLowerCase().endsWith(".docx");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!isOpen || documentId == null) return;
      setLoading(true);
      setError(null);
      setFileUrl(null);
      try {
        const res = await ReadKbDocumentLink(documentId);
        if (cancelled) return;
        const link = res?.data?.link ?? res?.link;
        if (!link) throw new Error("No link returned");
        setFileUrl(link);
        if (!filename?.toLowerCase().endsWith(".docx")) setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setError("Failed to load document");
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, documentId]);

  useEffect(() => {
    if (!isDocx || !fileUrl || !docxContainerRef.current) return;
    let cancelled = false;
    const render = async () => {
      try {
        const blob = await (await fetch(fileUrl)).blob();
        if (cancelled || !docxContainerRef.current) return;
        docxContainerRef.current.innerHTML = "";
        await renderAsync(blob, docxContainerRef.current, undefined, {
          className: "docx-preview",
          ignoreWidth: false,
          ignoreHeight: true,
        });
      } catch (e) {
        if (!cancelled) setError("Failed to render document");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [isDocx, fileUrl]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0061F3]/10" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-hidden">
          <div className="flex items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                className="w-full lg:max-w-6xl max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                <DialogTitle
                  as="h3"
                  className="text-[20px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                >
                  <Text className="lg:w-[55rem] md:w-[50rem] sm:w-[30rem] w-[10rem] truncate ellipsis">
                    {filename} · page {page}
                  </Text>
                  <button
                    className="absolute -right-4 -top-5"
                    onClick={onClose}
                  >
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>

                <div className="h-[calc(100vh-150px)] mt-8 w-full overflow-y-scroll relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-700">Loading...</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center justify-center h-full">
                      <Text className="text-red-500">{error}</Text>
                    </div>
                  )}
                  {fileUrl && !error && !isDocx && (
                    <div
                      className="w-full h-full"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <PdfViewer
                        fileUrl={fileUrl}
                        initialPage={Math.max(0, page - 1)}
                        onLoad={() => setLoading(false)}
                      />
                    </div>
                  )}
                  {fileUrl && !error && isDocx && (
                    <div
                      className="w-full h-full overflow-auto bg-gray-100 flex justify-center"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <div ref={docxContainerRef} />
                    </div>
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default KbCitationViewerModal;
