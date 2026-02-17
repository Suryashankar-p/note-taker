import React, { useState, Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";

import Close from "../../assets/close.svg";
import DownloadIcon from "../../assets/download.svg";

const FileViewModal = ({ fileUrl, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const closeModal = () => {
    setLoading(true);
    setError(null);
    onClose();
  };
  
  const zoomScale = zoom / 100;

  const onDownload = () => {
    if (!fileUrl?.url) return;
    const a = document.createElement("a");
    a.href = fileUrl.url;
    a.download = fileUrl.name || "downloaded-file";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Reset loading state when fileUrl changes
  React.useEffect(() => {
    if (isOpen && fileUrl?.url) {
      setLoading(true);
      setError(null);
    }
  }, [fileUrl, isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        {/* BACKDROP */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" />
        </TransitionChild>

        {/* CENTERED MODAL */}
        <div className="fixed inset-0 flex items-center justify-center p-6">
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
              className={`transform bg-white text-left shadow-2xl transition-all flex flex-col 
                ${
                  isFullScreen
                    ? "fixed inset-0 rounded-none"
                    : "rounded-lg w-full max-w-5xl h-[95vh]"
                }
              `}
            >
              {/* HEADER */}
              <div className="border-b border-gray-200 px-6 py-3 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black truncate flex-1">
                  {fileUrl?.name}
                </h3>

                <div className="flex items-center gap-3">
                  {/* ZOOM OUT */}
                  <button
                    onClick={() => setZoom((z) => Math.max(50, z - 10))}
                    title="Zoom Out"
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    −
                  </button>

                  {/* ZOOM VALUE */}
                  <span
                    className="w-14 text-center text-sm font-semibold text-gray-700 bg-gray-50 rounded px-2 py-1"
                    title="Zoom Level"
                  >
                    {zoom}%
                  </span>

                  {/* ZOOM IN */}
                  <button
                    onClick={() => setZoom((z) => Math.min(300, z + 10))}
                    title="Zoom In"
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    +
                  </button>

                  {/* FULLSCREEN */}
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    title="Toggle Fullscreen"
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    ⛶
                  </button>

                  {/* OPEN IN NEW TAB */}
                  <button
                    onClick={() => window.open(fileUrl.url, "_blank")}
                    title="Open in New Tab"
                    className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                  >
                    ↗
                  </button>

                  {/* DOWNLOAD BUTTON — icon only, large */}
                  <button
                    title="Download File"
                    onClick={onDownload}
                    className="p-1 hover:opacity-80 transition"
                  >
                    <img
                      src={DownloadIcon}
                      alt="download"
                      className="w-10 h-10"
                    />
                  </button>

                  {/* CLOSE BUTTON — icon only, large */}
                  <button
                    title="Close"
                    onClick={closeModal}
                    className="p-1 hover:opacity-80 transition"
                  >
                    <img src={Close} alt="close" className="w-10 h-10" />
                  </button>
                </div>
              </div>

              {/* BODY SECTION */}
              <div className="flex-1 overflow-auto bg-white relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="mt-3 text-gray-700 font-medium">
                        Loading file...
                      </p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-20">
                    <div className="flex flex-col items-center text-center p-6">
                      <div className="text-red-500 text-6xl mb-4">⚠️</div>
                      <p className="mt-3 text-red-700 font-medium">
                        Failed to load file
                      </p>
                      <p className="mt-1 text-gray-600 text-sm">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* PDF VIEWER */}
                {fileUrl?.type?.toLowerCase() === "pdf" && fileUrl?.url && !error ? (
                  <iframe
                    src={`${fileUrl.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full"
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "top center",
                      border: "none",
                      overflow: "hidden",
                      background: "white",
                    }}
                    scrolling="no"
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setError("Failed to load PDF");
                      setLoading(false);
                    }}
                  />
                ) : fileUrl?.type?.toLowerCase() !== "pdf" && fileUrl?.url && !error ? (
                  <img
                    src={fileUrl?.url}
                    alt="preview"
                    className="w-full mx-auto"
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "top center",
                    }}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                      setError("Failed to load image");
                      setLoading(false);
                    }}
                  />
                ) : !fileUrl?.url && !loading && !error ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No file URL provided</p>
                  </div>
                ) : null}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
};

export default FileViewModal;
