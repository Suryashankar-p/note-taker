import React, { useState, Fragment } from "react";
import {
  Dialog,
  Transition,
  DialogTitle,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import download from "../../assets/download.svg";
import { getIframeSrc } from "../../utils/functions.ts";

const FileViewModal = ({ fileUrl, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);

  const closeModal = () => {
    onClose();
  };

  const onDownload = () => {
    const a = document.createElement("a");
    a.href = fileUrl.url;
    a.download = fileUrl.name || "downloaded-file"; // Set the file name
    a.target = "_blank"; // Open in a new tab to force download behavior in some browsers
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

 

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                    className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900"
                  >
                    <Text className="lg:w-[55rem] w-[15rem] truncate ellipsis">{fileUrl?.name}</Text>
                    <button
                      className="absolute right-12 -top-5"
                      onClick={onDownload}
                    >
                      <img src={download} alt="close" loading="lazy" />
                    </button>
                    <button
                      className="absolute -right-4 -top-5"
                      onClick={closeModal}
                    >
                      <img src={Close} alt="close" loading="lazy" />
                    </button>
                  </DialogTitle>
                  <div className="h-[calc(100vh-150px)] mt-8 w-full overflow-y-scroll">
                  <div className="relative w-full h-full">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
                          <p className="mt-2 text-gray-700">Loading...</p>
                        </div>
                      </div>
                    )}
                    {fileUrl?.type?.toLowerCase() === "jpg" ||
                    fileUrl?.type?.toLowerCase() === "jpeg" ||
                    fileUrl?.type?.toLowerCase() === "png" ? (
                      <img
                        src={fileUrl?.url}
                        alt={fileUrl?.name || "Image"}
                        className="w-full h-full object-contain"
                        onLoad={() => setLoading(false)}
                      />
                    ) : fileUrl?.type?.toLowerCase() === "mp4" ||
                      fileUrl?.type?.toLowerCase() === "webm" ||
                      fileUrl?.type?.toLowerCase() === "ogg" ? (
                      <video
                        src={fileUrl?.url}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        onCanPlay={() => setLoading(false)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <iframe
                        id="file-iframe"
                        title="file-iframe"
                        src={getIframeSrc(fileUrl?.url, fileUrl?.type)}
                        className={`w-full h-full ${loading ? "hidden" : "block"}`}
                        allowTransparency={true}
                        onLoad={() => setLoading(false)}
                      />
                    )}
                  </div>
                                    </div>
                                  </DialogPanel>
                                </TransitionChild>
                              </div>
                            </div>
                          </Dialog>
                        </Transition>
                      </>
                    );
                  };

export default FileViewModal;
